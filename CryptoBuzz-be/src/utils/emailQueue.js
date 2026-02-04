import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  username: process.env.REDIS_USERNAME || "default",
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

const queueName = "criptobuzz-email-queue";

const emailQueue = new Queue(queueName, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: 60000,
  },
});

redisConnection.on("connect", () => {
  // Redis connected for email queue
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error in email queue:", err);
});

export const addEmailJob = async (jobName, payload) => {
  try {
    await emailQueue.add(jobName, { jobName, payload });
  } catch (error) {
    console.error(`Error adding job "${jobName}" to email queue:`, error);
  }
};

export const closeEmailQueue = async () => {
  try {
    await emailQueue.close();
    await redisConnection.quit();
  } catch (error) {
    console.error("Error during email queue shutdown:", error);
  }
};

