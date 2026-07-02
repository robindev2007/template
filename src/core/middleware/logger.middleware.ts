import { NextFunction, Request, Response } from "express";

import { logger } from "@/core/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(`HTTP ${req.method} ${req.url}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
