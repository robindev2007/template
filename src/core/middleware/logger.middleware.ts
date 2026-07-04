import type { NextFunction, Request, Response } from "express";

import { logger } from "@/core/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    const err = res.locals?.["error"] as { message: string; stack?: string } | undefined;

    const msg = [
      `${req.method} ${req.originalUrl || req.url}`,
      `${status}`,
      `${duration}ms`,
      req.ip,
      err?.message,
    ]
      .filter(Boolean)
      .join(" — ");

    if (status >= 500) {
      logger.error(msg);
    } else if (status >= 400) {
      logger.warn(msg);
    } else {
      logger.info(msg);
    }

    if (err?.stack) {
      logger.error(`TRACE:\n${err.stack}`);
    }
  });

  next();
};
