import type { NextFunction, Request, Response } from "express";

import { sendResponse } from "@/core/utils";

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendResponse.unauthorized(res);
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      sendResponse.forbidden(res, "Insufficient permissions");
      return;
    }

    next();
  };
};
