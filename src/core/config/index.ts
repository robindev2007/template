// src/core/config/env.ts

import { env } from "./env";

// Export a grouped object
export const config = {
  db: {
    url: env.DATABASE_URL,
    redisUrl: "",
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    redisPassword: env.REDIS_PASSWORD,
  },
  storage: {},
  app: {
    name: env.PROJECT_NAME,
    env: env.NODE_ENV,
    port: env.PORT,
  },
};
