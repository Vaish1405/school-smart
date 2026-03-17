import express from "express";
import dotenv from "dotenv";
import { createGradeQueue } from "./queue.js";
import { readJsonArray, writeJsonArray, nowIso, makeId } from "./records.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const port = Number(process.env.LISTENER_PORT || 5050);
const host = process.env.LISTENER_HOST || "127.0.0.1";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "dev-secret";

const queue = createGradeQueue();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/webhooks/grade-posted", async (req, res) => {
  const secret = req.header("x-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid webhook secret." });
  }

  const { studentId, classId, assignmentId } = req.body || {};
  if (!studentId || !classId || !assignmentId) {
    return res.status(400).json({ error: "Body must include studentId, classId, assignmentId." });
  }

  const event = {
    id: makeId("ge"),
    type: "grade-posted",
    studentId,
    classId,
    assignmentId,
    receivedAt: nowIso(),
    raw: req.body,
  };

  const events = await readJsonArray("grade_events.json");
  events.push(event);
  await writeJsonArray("grade_events.json", events);

  const job = await queue.add(
    "grade-posted",
    { studentId, classId, assignmentId, gradeEventId: event.id },
    { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
  );

  return res.status(202).json({ ok: true, jobId: job.id, eventId: event.id });
});

app.listen(port, host, () => {
  console.log(`Grade listener running on http://${host}:${port}`);
});

