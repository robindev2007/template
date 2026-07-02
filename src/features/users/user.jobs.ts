import { Worker } from "bullmq";

import { redisConfig } from "@/core/database/redis";

// 2. The Worker logic (This runs in your worker.ts process)
export const setupUserWorker = () => {
  new Worker(
    "user-tasks",
    async (job) => {
      if (job.name === "send-welcome-email") {
        // Perform heavy logic here
      }
    },
    {
      connection: redisConfig,
    },
  );
};
