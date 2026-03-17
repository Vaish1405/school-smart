import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: "ibm-credentials.env" });

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

const ORCHESTRA_API_URL =
  process.env.IBM_ORCHESTRA_API_URL ||
  process.env.ORCHESTRATE_URL ||
  "";
const API_KEY =
  process.env.IBM_ORCHESTRA_API_KEY ||
  process.env.ORCHESTRATE_APIKEY ||
  process.env.ORCHESTRATE_IAM_APIKEY ||
  "";
const IAM_TOKEN_URL = process.env.IBM_ORCHESTRA_IAM_TOKEN_URL || "https://iam.cloud.ibm.com/identity/token";
const ORCHESTRATE_AUTH_TYPE = (process.env.ORCHESTRATE_AUTH_TYPE || "").toLowerCase();
const USE_IAM =
  (process.env.IBM_ORCHESTRA_USE_IAM || "").toLowerCase() === "true" ||
  ORCHESTRATE_AUTH_TYPE === "iam" ||
  ((process.env.IBM_ORCHESTRA_USE_IAM || "").toLowerCase() !== "false" && !ORCHESTRATE_AUTH_TYPE);
const TIMEOUT_MS = Number(process.env.IBM_ORCHESTRA_TIMEOUT_MS || 20000);
const SIMULATE_CHAT = (process.env.IBM_ORCHESTRA_SIMULATE || "false").toLowerCase() === "true";

const AGENT_ID = process.env.IBM_ORCHESTRA_AGENT_ID || "";
const AGENT_ENV_ID = process.env.IBM_ORCHESTRA_AGENT_ENV_ID || "";
const ORCHESTRATION_ID = process.env.IBM_ORCHESTRA_ORCHESTRATION_ID || "";

let iamTokenCache = {
  token: "",
  expiresAt: 0,
};

function extractFirstText(value) {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractFirstText(item);
      if (extracted) return extracted;
    }
    return "";
  }

  if (!value || typeof value !== "object") return "";

  const metadataKeys = new Set([
    "id",
    "message_id",
    "run_id",
    "event_id",
    "created_at",
    "updated_at",
    "event",
    "type",
    "status",
    "timestamp",
  ]);

  const keys = Object.keys(value);
  if (keys.length && keys.every((k) => metadataKeys.has(k))) return "";

  const directKeys = [
    "answer",
    "response",
    "output",
    "output_text",
    "text",
    "content",
    "message",
    "delta",
    "partial_response",
  ];
  for (const key of directKeys) {
    if (key in value) {
      const extracted = extractFirstText(value[key]);
      if (extracted) return extracted;
    }
  }

  for (const [key, nested] of Object.entries(value)) {
    if (metadataKeys.has(key)) continue;
    const extracted = extractFirstText(nested);
    if (extracted) return extracted;
  }

  return "";
}

function extractTextFromStreamBody(rawText) {
  const text = String(rawText || "");
  if (!text.trim()) return "";

  const candidates = [];
  const controlTokens = new Set([
    "run.started",
    "message.started",
    "run.step.intermediate",
    "message.delta",
    "message.created",
    "message.completed",
    "run.completed",
    "done",
  ]);
  const idLikePattern = /^\d{10,}-\d+$/;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("event:")) continue;
    if (line.startsWith("id:")) continue;
    if (line.startsWith("retry:")) continue;
    if (line.startsWith(":")) continue;
    if (idLikePattern.test(line)) continue;

    let payloadLine = line;
    if (line.startsWith("data:")) {
      payloadLine = line.slice(5).trim();
      if (!payloadLine || payloadLine === "[DONE]") continue;
      if (payloadLine.startsWith("id:")) continue;
      if (idLikePattern.test(payloadLine)) continue;
    }

    try {
      const parsed = JSON.parse(payloadLine);
      const extracted = extractFirstText(parsed);
      if (extracted) {
        candidates.push(extracted);
        continue;
      }
    } catch (_error) {
      // Fallback to raw chunk text.
    }

    const lowered = payloadLine.toLowerCase();
    if (lowered && !controlTokens.has(lowered)) candidates.push(payloadLine);
  }

  const deduped = [];
  const seen = new Set();
  for (const item of candidates) {
    const cleaned = item.trim();
    const lowered = cleaned.toLowerCase();
    if (!cleaned) continue;
    if (controlTokens.has(lowered)) continue;
    if (seen.has(cleaned)) continue;
    seen.add(cleaned);
    deduped.push(cleaned);
  }

  return deduped.join("\n").trim();
}

function extractJsonBlock(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      JSON.parse(raw);
      return raw;
    } catch (_error) {
      // Continue to extraction.
    }
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    const inner = fenced[1].trim();
    if (inner.startsWith("{") || inner.startsWith("[")) {
      try {
        JSON.parse(inner);
        return inner;
      } catch (_error) {
        // Continue to extraction.
      }
    }
  }

  return "";
}

function extractLastBalancedObject(text) {
  const s = String(text || "").trim();
  if (!s) return "";

  let inString = false;
  let escape = false;
  let depth = 0;
  let start = -1;
  const candidates = [];

  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === "\"") {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }
    if (ch === "}") {
      if (depth === 0) continue;
      depth -= 1;
      if (depth === 0 && start !== -1) {
        candidates.push(s.slice(start, i + 1).trim());
        start = -1;
      }
    }
  }

  return candidates.length ? candidates[candidates.length - 1] : "";
}

function repairCommonJsonIssues(text) {
  let s = String(text || "").trim();
  if (!s) return "";

  s = s
    .replace(/\u201c/g, "\"")
    .replace(/\u201d/g, "\"")
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'");

  const keyPattern = "(course_name|summary_title|summary_text|title|why|id|outcome)";
  const valuePattern = "([A-Za-z][^,\\]\\}\\n\"]*)";
  const regex = new RegExp(`("(?:${keyPattern})"\\s*:\\s*)${valuePattern}`, "gi");
  s = s.replace(regex, (_match, prefix, value) => `${prefix}${JSON.stringify(String(value || "").trim())}`);

  return s;
}

function normalizeJsonAnswer(text) {
  const direct = extractJsonBlock(text);
  if (direct) return direct;

  const candidate = extractLastBalancedObject(text);
  if (!candidate) return "";
  try {
    JSON.parse(candidate);
    return candidate;
  } catch (_error) {
    const repaired = repairCommonJsonIssues(candidate);
    if (!repaired) return "";
    try {
      JSON.parse(repaired);
      return repaired;
    } catch (_error2) {
      return "";
    }
  }
}

async function fetchIamToken() {
  const now = Date.now();
  if (iamTokenCache.token && iamTokenCache.expiresAt > now + 60_000) {
    return iamTokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: API_KEY,
  });

  const response = await fetch(IAM_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) {
    throw new Error(`IAM token request failed: ${JSON.stringify(data)}`);
  }

  const expiresInMs = Number(data.expires_in || 3600) * 1000;
  iamTokenCache = {
    token: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return iamTokenCache.token;
}

function buildPayload({ question, pageContext, currentView }) {
  const payload = {
    input: question,
    question,
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
    context: pageContext || "",
    metadata: {
      source: "school-smart-ai-study-helper",
      view: currentView || "unknown",
    },
  };

  if (AGENT_ID || AGENT_ENV_ID) {
    payload.chatOptions = {
      ...(AGENT_ID ? { agentId: AGENT_ID } : {}),
      ...(AGENT_ENV_ID ? { agentEnvironmentId: AGENT_ENV_ID } : {}),
    };

    payload.agent_id = AGENT_ID || undefined;
    payload.agent_environment_id = AGENT_ENV_ID || undefined;
  }

  if (ORCHESTRATION_ID) {
    payload.orchestrationID = ORCHESTRATION_ID;
    payload.orchestration_id = ORCHESTRATION_ID;
  }

  return payload;
}

app.post("/api/study-helper", async (req, res) => {
  const { question, pageContext, currentView } = req.body || {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing 'question'." });
  }

  if (SIMULATE_CHAT) {
    const viewLabel = currentView || "current page";
    const snippet = (pageContext || "").slice(0, 180).replace(/\s+/g, " ").trim();
    return res.json({
      answer: `Simulated IBM response for ${viewLabel}: You asked "${question}". I can see page context like "${snippet || "no context provided"}".`,
    });
  }

  if (!ORCHESTRA_API_URL || !API_KEY) {
    return res.status(500).json({
      error: "IBM Orchestra config missing. Set IBM_ORCHESTRA_API_URL and IBM_ORCHESTRA_API_KEY.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const authValue = USE_IAM
      ? `Bearer ${await fetchIamToken()}`
      : `Bearer ${API_KEY}`;

    const response = await fetch(ORCHESTRA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authValue,
      },
      body: JSON.stringify(buildPayload({ question, pageContext, currentView })),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const rawBody = await response.text();
    let data = {};
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch (_error) {
      data = {};
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "IBM Orchestra request failed.",
        details: Object.keys(data).length ? data : rawBody,
      });
    }

    const answer =
      extractFirstText(data) ||
      extractTextFromStreamBody(rawBody);

    if (!answer) {
      return res.status(502).json({
        error: "No answer text found in IBM Orchestra response.",
        raw: Object.keys(data).length ? data : rawBody,
      });
    }

    const normalizedJson = normalizeJsonAnswer(answer);
    return res.json({ answer: normalizedJson || answer });
  } catch (error) {
    clearTimeout(timeout);
    return res.status(500).json({
      error: "Unable to reach IBM Orchestra API.",
      details: error?.message || String(error),
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, host, () => {
  console.log(`SchoolSmart server running on http://${host}:${port}`);
});
