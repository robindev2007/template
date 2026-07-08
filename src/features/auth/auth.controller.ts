import type { NextFunction, Request, Response } from "express";

import { sendResponse } from "@/core/utils";

import { AuthService } from "./auth.service";

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.signup(req.body);
    sendResponse.created(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = {
      email: req.body?.["email"] ?? (req.query["email"] as string),
      token: req.body?.["token"] ?? (req.query["token"] as string),
    };
    const result = await AuthService.verifyEmail(body);
    sendResponse.ok(res, "Email verified successfully", result);
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
