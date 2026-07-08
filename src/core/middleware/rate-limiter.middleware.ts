import type { Request } from "express";
import { rateLimit } from "express-rate-limit";

import { config } from "@/core/config";

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email as string | undefined;
    return email ? `auth:${email}` : (req.ip ?? "unknown");
  },
  message: {
    success: false,
    statusCode: 429,
    message: "Too many attempts. Please try again later.",
  },
});
