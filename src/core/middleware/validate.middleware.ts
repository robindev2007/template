import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

import { logger } from "@/core/logger";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logger.warn("Validation failed", { errors: result.error.issues });
      return res.status(400).json({ error: "Validation Error", details: result.error.issues });
    }

    req.body = result.data;
    next();
  };
