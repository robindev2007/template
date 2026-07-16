import { env } from "./env";

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
  tmdb: {
    apiKey: env.TMDB_API_KEY,
    baseUrl: env.TMDB_BASE_URL,
  },
  auth: {
    googleClientId: env.GOOGLE_CLIENT_ID,
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    tokenExpiryMinutes: env.TOKEN_EXPIRY_MINUTES,
    sessionExpiryDays: env.SESSION_EXPIRY_DAYS,
  },
  queueDashboard: {
    user: env.QUEUE_DASHBOARD_USER,
    pass: env.QUEUE_DASHBOARD_PASS,
    secret: env.QUEUE_DASHBOARD_SECRET,
  },
  app: {
    name: env.PROJECT_NAME,
    env: env.NODE_ENV,
    port: env.PORT,
    serverUrl: env.SERVER_URL,
    frontendUrl: env.FRONTEND_URL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    authWindowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
    authMax: env.RATE_LIMIT_AUTH_MAX,
  },
};
