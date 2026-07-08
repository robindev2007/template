import type { NextFunction, Request, Response } from "express";

import { sendResponse } from "@/core/utils";
import { JwtUtils } from "@/core/utils/jwt";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];

  if (!header?.startsWith("Bearer ")) {
    sendResponse.unauthorized(res, "Authentication required.");
    return;
  }

  const token = header.split(" ")[1]!;
  const payload = JwtUtils.verify(token);

  if (!payload) {
    sendResponse.unauthorized(res, "Invalid or expired token.");
    return;
  }

  req.user = payload;
  next();
};
