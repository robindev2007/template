import { z } from "zod";

import { logger } from "@/core/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  PORT: z.coerce.number().default(3000),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // Convert Zod errors to a flattened object for clean logging
  const formattedErrors = parsedEnv.error.issues.map((issue) => issue.message);

  logger.error("❌ Invalid environment variables detected at startup", {
    errors: formattedErrors,
  });

  process.exit(1);
}

export const env = parsedEnv.data;
