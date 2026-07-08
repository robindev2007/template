import type { NextFunction, Request, Response } from "express";

import { sendResponse } from "@/core/utils";

import { AuthService } from "./auth.service";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.signup(req.body);
    sendResponse.created(res, "Check your email for the verification link.");
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
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

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);

    if ("redirectToSuccessPage" in result) {
      sendResponse.ok(res, "Please verify your email address. A new link has been sent.", result);
      return;
    }

    sendResponse.ok(res, "Login successful", result);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.forgotPassword(req.body);
    sendResponse.ok(res, "Password reset link sent.");
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.resetPassword(req.body);
    sendResponse.ok(res, "Password reset successfully. Please log in.");
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AuthService.changePassword(req.user!.userId, req.body);
    sendResponse.ok(res, "Password changed successfully.");
  } catch (err) {
    next(err);
  }
};

export const AuthController = {
  signup,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
