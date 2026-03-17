import express from "express";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "ibm-credentials.env", override: true });

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

app.use(express.json({ limit: "30mb" }));
app.use(express.static("."));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const GEMINI_API_BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 45000);
const MAX_ATTACHMENTS = Number(process.env.GEMINI_MAX_ATTACHMENTS || 8);
const MAX_FILE_BYTES = Number(process.env.GEMINI_MAX_FILE_BYTES || 7_000_000);

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function truncate(text, max = 12000) {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function mimeAllowed(mimeType) {
  if (!mimeType) return false;
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "text/csv" ||
    mimeType === "application/json" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

function parseGeminiError(payload) {
  const message =
    payload?.error?.message ||
    payload?.message ||
    "";
  return typeof message === "string" ? message : "";
}

function normalizeAttachments(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(0, MAX_ATTACHMENTS)
    .map((item) => ({
      name: cleanText(item?.name) || "attachment",
      mimeType: cleanText(item?.mimeType).toLowerCase(),
      data: cleanText(item?.data),
      size: Number(item?.size || 0),
    }))
    .filter((item) => item.data && item.mimeType && mimeAllowed(item.mimeType) && item.size <= MAX_FILE_BYTES);
}

function buildGeminiBody({ question, pageContext, currentView, attachments }) {
  const promptText = [
    "You are the AI Study Helper for a learning management system.",
    "Use the current page context and any uploaded files/images to answer accurately.",
    "If the answer is not in the context or uploads, say what is missing.",
    `Current view: ${currentView || "unknown"}`,
    "",
    `Question: ${question}`,
    "",
    `Page context: ${truncate(pageContext || "", 14000)}`,
  ].join("\n");

  const parts = [{ text: promptText }];
  attachments.forEach((file) => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data,
      },
    });
  });

  return {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topK: 30,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  };
}

async function handleStudyHelperRequest(req, res) {
  const question = cleanText(req.body?.question);
  const pageContext = cleanText(req.body?.pageContext);
  const currentView = cleanText(req.body?.currentView);
  const attachments = normalizeAttachments(req.body?.attachments);

  if (!question) {
    return res.status(400).json({ error: "Missing 'question'." });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Gemini config missing. Set GEMINI_API_KEY in ibm-credentials.env.",
    });
  }

  const candidateModels = Array.from(
    new Set([
      GEMINI_MODEL,
      "gemini-2.5-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-2.5-flash",
      "gemini-flash-latest",
    ].filter(Boolean))
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    let lastFailure = null;

    for (const model of candidateModels) {
      const endpoint = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGeminiBody({ question, pageContext, currentView, attachments })),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastFailure = { model, status: response.status, payload };
        continue;
      }

      const answer = extractGeminiText(payload);
      if (!answer) {
        return res.status(502).json({
          error: "No answer text returned by Gemini.",
          raw: payload,
        });
      }

      clearTimeout(timeout);
      return res.json({ answer, model });
    }

    clearTimeout(timeout);
    const lastErrorMessage = parseGeminiError(lastFailure?.payload);
    return res.status(lastFailure?.status || 502).json({
      error: "Gemini request failed.",
      details: lastFailure?.payload || {},
      hint: lastErrorMessage || "Check GEMINI_MODEL and API key permissions.",
    });
  } catch (error) {
    clearTimeout(timeout);
    return res.status(500).json({
      error: "Unable to reach Gemini API.",
      details: error?.message || String(error),
    });
  }
}

app.post("/api/study-helper", handleStudyHelperRequest);
app.post("/api/get-helper", handleStudyHelperRequest);

app.get("/health", (_req, res) => {
  res.json({ ok: true, provider: "gemini" });
});

app.listen(port, host, () => {
  console.log(`SchoolSmart server running on http://${host}:${port}`);
});
