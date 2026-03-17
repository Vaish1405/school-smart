import { nowIso } from "./records.js";

// Default: mock generator (works without Watsonx Orchestrate credentials)
function buildMockGuide({ student, cls, assignment, missedCriteria, pointsLost }) {
  const name = student ? `${student.firstName} ${student.lastName}` : "Student";
  const missedLines = missedCriteria.length
    ? missedCriteria.map((c) => `- ${c.label} (${c.points} pts)`).join("\n")
    : "- No specific rubric criteria identified.";

  return [
    `Study Guide for ${name}`,
    ``,
    `Class: ${cls?.name || "Unknown class"}`,
    `Assignment: ${assignment?.title || "Unknown assignment"}`,
    ``,
    `You missed ${pointsLost} point(s). Focus on these rubric areas:`,
    missedLines,
    ``,
    `Quick practice:`,
    `- Re-read the assignment instructions and highlight required elements.`,
    `- Rework 2 similar problems or examples from your notes.`,
    `- Write a short checklist you can use before submitting next time.`,
    ``,
    `Generated at ${nowIso()}.`,
  ].join("\n");
}

async function callWxoChatCompletion({ prompt }) {
  const API_BASE = process.env.WXO_API_BASE; // e.g. https://{api_endpoint}/api
  const USERNAME = process.env.WXO_USERNAME;
  const PASSWORD = process.env.WXO_PASSWORD;
  const IAM_API_KEY = process.env.WXO_IAM_APIKEY || process.env.WXO_API_KEY || process.env.IBM_CLOUD_API_KEY;
  const IAM_TOKEN_URL = process.env.WXO_IAM_TOKEN_URL || "https://iam.cloud.ibm.com/identity/token";
  const TENANT_ID = process.env.WXO_TENANT_ID || "";
  const MODEL = process.env.WXO_MODEL || "gpt-4o-mini";

  if (!API_BASE) return null;

  // Auth options (prefer IAM API key for SSO tenants)
  let token = "";

  if (IAM_API_KEY) {
    const body = new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: IAM_API_KEY,
    });

    const tokenRes = await fetch(IAM_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    token = tokenData?.access_token || "";
    if (!tokenRes.ok || !token) return null;
  } else if (USERNAME && PASSWORD) {
    // Fallback: password grant (some deployments support this, many SSO tenants do not)
    const tokenRes = await fetch(`${API_BASE}/v1/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: USERNAME,
        password: PASSWORD,
        grant_type: "password",
      }),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    token = tokenData?.access_token || "";
    if (!tokenRes.ok || !token) return null;
  } else {
    return null;
  }

  const chatRes = await fetch(`${API_BASE}/v1/completions/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(TENANT_ID ? { "x-ibm-wo-tenant-id": TENANT_ID } : {}),
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "You write concise, student-friendly study guides." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  const chatData = await chatRes.json().catch(() => ({}));
  if (!chatRes.ok) return null;
  const content = chatData?.content;
  if (typeof content === "string" && content.trim()) return content.trim();

  return null;
}

export async function generateStudyGuide({
  student,
  cls,
  assignment,
  rubric,
  missedCriteria,
  pointsLost,
}) {
  const mode = (process.env.GUIDE_GENERATOR || "mock").toLowerCase();
  if (mode !== "wxo") {
    return { mode: "mock", content: buildMockGuide({ student, cls, assignment, missedCriteria, pointsLost }) };
  }

  const criteriaText = (rubric?.criteria || [])
    .map((c) => `- ${c.label} (${c.points} pts)`)
    .join("\n");
  const missedText = (missedCriteria || [])
    .map((c) => `- ${c.label} (${c.points} pts)`)
    .join("\n");

  const prompt = [
    `Create a study guide for a student based on a graded assignment.`,
    ``,
    `Class: ${cls?.name || ""}`,
    `Assignment: ${assignment?.title || ""}`,
    `Assignment description: ${assignment?.description || ""}`,
    ``,
    `Rubric criteria:\n${criteriaText || "- (none)"}`,
    ``,
    `Points lost: ${pointsLost}`,
    `Missed criteria:\n${missedText || "- (unknown)"}`,
    ``,
    `Requirements:`,
    `- Keep it under 250 words.`,
    `- Include 3 bullet-point action steps.`,
    `- Include 3 short practice questions (no answers).`,
    `- Use friendly, encouraging tone.`,
  ].join("\n");

  const content = await callWxoChatCompletion({ prompt });
  if (content) return { mode: "wxo", content };

  return { mode: "mock", content: buildMockGuide({ student, cls, assignment, missedCriteria, pointsLost }) };
}

