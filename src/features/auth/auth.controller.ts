import type { NextFunction, Request, Response } from "express";

import { sendResponse } from "@/core/utils";

import { AuthService } from "./auth.service";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.signup(req.body);
    sendResponse.created(res, "Verification email sent", result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.verifyEmail(req.body);
    sendResponse.ok(res, "Email verified", result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);
    sendResponse.ok(res, "Login successful", result);
  } catch (err) {
    next(err);
  }
};
