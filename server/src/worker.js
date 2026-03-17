import dotenv from "dotenv";
import { Worker } from "bullmq";
import { createRedisConnection } from "./queue.js";
import { readJsonArray, writeJsonArray, nowIso, makeId } from "./records.js";
import { generateStudyGuide } from "./wxo.js";

dotenv.config();

function sumPoints(criteria = []) {
  return criteria.reduce((acc, c) => acc + Number(c.points || 0), 0);
}

function pickMissedCriteria({ rubric, pointsLost }) {
  const criteria = Array.isArray(rubric?.criteria) ? rubric.criteria : [];
  if (!criteria.length || pointsLost <= 0) return [];

  // Deterministic heuristic: mark criteria missed from smallest-to-largest until pointsLost is covered.
  const sorted = [...criteria].sort((a, b) => Number(a.points || 0) - Number(b.points || 0));
  const missed = [];
  let remaining = pointsLost;

  for (const c of sorted) {
    if (remaining <= 0) break;
    missed.push(c);
    remaining -= Number(c.points || 0);
  }

  return missed;
}

async function processGradePosted(job) {
  const { studentId, classId, assignmentId, gradeEventId } = job.data || {};
  if (!studentId || !classId || !assignmentId) {
    throw new Error("Job missing studentId/classId/assignmentId.");
  }

  const [students, classes, assignments, rubrics, assignmentGrades] = await Promise.all([
    readJsonArray("students.json"),
    readJsonArray("classes.json"),
    readJsonArray("assignments.json"),
    readJsonArray("rubrics.json"),
    readJsonArray("assignment_grades.json"),
  ]);

  const student = students.find((s) => s.id === studentId) || null;
  const cls = classes.find((c) => c.id === classId) || null;
  const assignment = assignments.find((a) => a.id === assignmentId) || null;
  const rubric = rubrics.find((r) => r.assignmentId === assignmentId) || null;
  const gradeRow = assignmentGrades.find((g) => g.studentId === studentId && g.assignmentId === assignmentId) || null;

  const pointsPossible = Number(assignment?.pointsPossible ?? sumPoints(rubric?.criteria));
  const pointsEarned = gradeRow?.pointsEarned == null ? null : Number(gradeRow.pointsEarned);
  const pointsLost = pointsEarned == null ? 0 : Math.max(0, pointsPossible - pointsEarned);
  const missedCriteria = pickMissedCriteria({ rubric, pointsLost });

  const { mode, content } = await generateStudyGuide({
    student,
    cls,
    assignment,
    rubric,
    missedCriteria,
    pointsLost,
  });

  const guide = {
    id: makeId("sg"),
    studentId,
    classId,
    assignmentId,
    gradeEventId: gradeEventId || null,
    createdAt: nowIso(),
    generator: mode,
    pointsEarned,
    pointsPossible,
    pointsLost,
    missedCriteriaIds: missedCriteria.map((c) => c.id),
    content,
  };

  const guides = await readJsonArray("study_guides.json");
  guides.unshift(guide);
  await writeJsonArray("study_guides.json", guides);

  const notification = {
    id: makeId("ntf"),
    studentId,
    classId,
    assignmentId,
    studyGuideId: guide.id,
    createdAt: nowIso(),
    title: `New study guide: ${assignment?.title || "Assignment"}`,
    body: pointsLost
      ? `A study guide was generated based on ${pointsLost} point(s) lost. Click to review.`
      : "A study guide was generated. Click to review.",
    read: false,
  };

  const notifications = await readJsonArray("notifications.json");
  notifications.unshift(notification);
  await writeJsonArray("notifications.json", notifications);

  return { guideId: guide.id, notificationId: notification.id };
}

const connection = createRedisConnection();

const worker = new Worker(
  "grade-posted",
  async (job) => {
    if (job.name === "grade-posted") return await processGradePosted(job);
    throw new Error(`Unknown job: ${job.name}`);
  },
  { connection, concurrency: 2 }
);

worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});

console.log("Worker started; waiting for grade-posted jobs...");

