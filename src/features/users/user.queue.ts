import { Queue } from "bullmq";

import { redisConfig } from "@/core/database/redis";

// 1. The Queue definition
export const userQueue = new Queue("user-tasks", { connection: redisConfig });
