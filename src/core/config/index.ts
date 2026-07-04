// src/core/config/env.ts

import { env } from "./env";

// Export a grouped object
export const config = {
  db: {
    url: env.DATABASE_URL,

    redisUrl: `redis://${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}/0`,

    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    redisUsername: env.REDIS_USERNAME,
    redisPassword: env.REDIS_PASSWORD,
  },
  storage: {},
  email: {
    smtpHost: env.SMTP_HOST,
    smtpPort: env.SMTP_PORT,
    smtpUser: env.SMTP_USER ?? "",
    smtpPass: env.SMTP_PASS ?? "",
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
  },
  bullboard: {
    user: env.BULL_USER,
    pass: env.BULL_PASS,
    secret: env.BULL_SECRET,
  },
  app: {
    name: env.PROJECT_NAME,
    env: env.NODE_ENV,
    port: env.PORT,
  },
};
