import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export function createRedisConnection() {
  return new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
}

export function createGradeQueue() {
  const connection = createRedisConnection();
  return new Queue("grade-posted", { connection });
}

