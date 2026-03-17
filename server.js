import express from "express";
import dotenv from "dotenv";
import { promises as fs } from "node:fs";
import path from "node:path";

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

function extractAnswer(payload) {
  if (!payload || typeof payload !== "object") return "";

  if (typeof payload.answer === "string" && payload.answer.trim()) return payload.answer;
  if (typeof payload.response === "string" && payload.response.trim()) return payload.response;
  if (typeof payload.output === "string" && payload.output.trim()) return payload.output;
  if (typeof payload.text === "string" && payload.text.trim()) return payload.text;

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;

  const outputText =
    payload?.result?.output_text ||
    payload?.result?.text ||
    payload?.data?.answer ||
    payload?.data?.response;

  if (typeof outputText === "string" && outputText.trim()) return outputText;

  return "";
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

async function readRecordsJson(filename) {
  const p = path.join(process.cwd(), "records", filename);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

function safeJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to extract the first {...} block.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const maybe = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(maybe);
      } catch {
        return null;
      }
    }
    return null;
  }
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

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: "IBM Orchestra request failed.",
        details: data,
      });
    }

    const answer = extractAnswer(data);
    if (!answer) {
      return res.status(502).json({
        error: "No answer text found in IBM Orchestra response.",
        raw: data,
      });
    }

    return res.json({ answer });
  } catch (error) {
    clearTimeout(timeout);
    return res.status(500).json({
      error: "Unable to reach IBM Orchestra API.",
      details: error?.message || String(error),
    });
  }
});

app.post("/api/tutor-session", async (req, res) => {
  const { courseKey, studentId } = req.body || {};
  if (!courseKey || typeof courseKey !== "string") {
    return res.status(400).json({ error: "Missing 'courseKey'." });
  }

  // Minimal mapping for this demo (UI uses courseKey -> classId).
  const courseKeyToClassId = { chemistry: "c1" };
  const classId = courseKeyToClassId[courseKey] || courseKey;

  const [classes, assignments, grades] = await Promise.all([
    readRecordsJson("classes.json").catch(() => []),
    readRecordsJson("assignments.json").catch(() => []),
    readRecordsJson("assignment_grades.json").catch(() => []),
  ]);

  const cls = Array.isArray(classes) ? classes.find((c) => c.id === classId) : null;
  const classAssignments = Array.isArray(assignments)
    ? assignments.filter((a) => a.classId === classId).slice(0, 8)
    : [];
  const studentGrades = Array.isArray(grades) && studentId
    ? grades.filter((g) => g.studentId === studentId)
    : [];

  const sessionSchema = {
    sessionId: "string",
    courseKey: "string",
    classId: "string",
    title: "string",
    summary: "string",
    focusAreas: [{ title: "string", reason: "string" }],
    steps: [{
      title: "string",
      minutes: "number",
      instructions: ["string"],
      quickCheck: ["string"],
    }],
    chatPrompt: "string",
  };

  const contextObj = {
    courseKey,
    classId,
    class: cls || null,
    assignments: classAssignments,
    grades: studentGrades,
    today: new Date().toISOString().slice(0, 10),
  };

  const prompt = [
    `Create a single study session plan for the student for this course.`,
    ``,
    `Return ONLY valid JSON (no markdown, no backticks) matching this shape:`,
    JSON.stringify(sessionSchema, null, 2),
    ``,
    `Rules:`,
    `- title: short, action-oriented`,
    `- summary: 1-2 sentences`,
    `- focusAreas: 2-4 items`,
    `- steps: 3-6 steps, each with minutes and 2-4 instructions`,
    `- quickCheck: 2-4 questions per step`,
    `- chatPrompt: a single paragraph the UI can paste into the tutor chat to start the session`,
    `- Use course name and assignment titles when relevant.`,
    ``,
    `Context JSON:`,
    JSON.stringify(contextObj),
  ].join("\n");

  if (SIMULATE_CHAT) {
    const mock = {
      sessionId: `sess_${Date.now()}`,
      courseKey,
      classId,
      title: `Study Session: ${cls?.name || courseKey}`,
      summary: "Simulated study session generated locally.",
      focusAreas: [
        { title: "Key concepts review", reason: "Based on recent assignments and pacing." },
        { title: "Practice + self-check", reason: "Build confidence through short checks." },
      ],
      steps: [
        { title: "Warm-up recall", minutes: 10, instructions: ["List 5 key terms from the last unit."], quickCheck: ["What is one common mistake to avoid?"] },
        { title: "Targeted practice", minutes: 20, instructions: ["Do 3 practice problems aligned to the rubric."], quickCheck: ["Which step felt hardest and why?"] },
        { title: "Wrap-up plan", minutes: 10, instructions: ["Write a 3-point checklist for next submission."], quickCheck: ["What will you do differently next time?"] },
      ],
      chatPrompt: `Start a focused 40-minute study session for ${cls?.name || courseKey}. Ask me questions step-by-step and quiz me briefly after each section.`,
    };
    return res.json(mock);
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
      body: JSON.stringify(buildPayload({ question: prompt, pageContext: JSON.stringify(contextObj), currentView: "tutor-session" })),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: "IBM Orchestra request failed.",
        details: data,
      });
    }

    const answerText = extractAnswer(data);
    const parsed = safeJsonFromText(answerText);
    if (!parsed || typeof parsed !== "object") {
      return res.status(502).json({
        error: "Orchestrate did not return valid JSON for tutor session.",
        expectedShape: sessionSchema,
        rawText: answerText,
      });
    }

    // Ensure required fields exist (soft defaults).
    parsed.sessionId = parsed.sessionId || `sess_${Date.now()}`;
    parsed.courseKey = parsed.courseKey || courseKey;
    parsed.classId = parsed.classId || classId;
    return res.json(parsed);
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
