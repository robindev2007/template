import type { Request } from "express";

import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { AuthService } from "./auth.service";

function detectDeviceType(req: Request): "web" | "android" | "ios" | undefined {
  const ua = (req.headers["user-agent"] ?? "").toLowerCase();

  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";

  return "web";
}

const signup = catchAsync(async (req, res) => {
  const data = await AuthService.signup(req.body);
  sendResponse.created(res, "Check your email for the verification link.", data);
});

const verifyEmail = catchAsync(async (req, res) => {
  const body = {
    email: req.body?.["email"] ?? (req.query["email"] as string),
    token: req.body?.["token"] ?? (req.query["token"] as string),
  };
  const result = await AuthService.verifyEmail(body);
  sendResponse.ok(res, "Email verified successfully", result);
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body, detectDeviceType(req));

  if ("redirectToVerifyPage" in result) {
    sendResponse.ok(res, "Please verify your email address. A new link has been sent.", result);
    return;
  }

  sendResponse.ok(res, "Login successful", result);
});

const resendVerification = catchAsync(async (req, res) => {
  const data = await AuthService.resendVerification(req.body);
  sendResponse.ok(res, "Verification link sent.", data);
});

const forgotPassword = catchAsync(async (req, res) => {
  await AuthService.forgotPassword(req.body);
  sendResponse.ok(res, "Password reset link sent.");
});

const resetPassword = catchAsync(async (req, res) => {
  await AuthService.resetPassword(req.body);
  sendResponse.ok(res, "Password reset successfully. Please log in.");
});

const changePassword = catchAsync(async (req, res) => {
  await AuthService.changePassword(req.user!.userId, req.body);
  sendResponse.ok(res, "Password changed successfully.");
});

const googleLogin = catchAsync(async (req, res) => {
  const result = await AuthService.googleLogin(req.body, detectDeviceType(req));
  sendResponse.ok(res, "Google login successful", result);
});

const signout = catchAsync(async (req, res) => {
  await AuthService.signout(req.user!.userId, req.user!.sessionId!);
  sendResponse.ok(res, "Signed out successfully.");
});

export const AuthController = {
  signup,
  verifyEmail,
  login,
  googleLogin,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  signout,
};
