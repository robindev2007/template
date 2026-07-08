import { Router } from "express";

import { authLimiter, isAuthenticated, validateBody } from "@/core/middleware";

import { AuthController } from "./auth.controller";
import { AuthSchema } from "./auth.schema";

const route = Router();

route.post("/signup", authLimiter, validateBody(AuthSchema.SignupSchema), AuthController.signup);

route.post(
  "/verify-email",
  authLimiter,
  validateBody(AuthSchema.VerifyEmailSchema),
  AuthController.verifyEmail,
);

route.get("/verify-email", authLimiter, AuthController.verifyEmail);

route.post("/login", authLimiter, validateBody(AuthSchema.LoginSchema), AuthController.login);

route.post(
  "/forgot-password",
  authLimiter,
  validateBody(AuthSchema.ForgotPasswordSchema),
  AuthController.forgotPassword,
);

route.post(
  "/reset-password",
  authLimiter,
  validateBody(AuthSchema.ResetPasswordSchema),
  AuthController.resetPassword,
);

route.post(
  "/change-password",
  authLimiter,
  isAuthenticated,
  validateBody(AuthSchema.ChangePasswordSchema),
  AuthController.changePassword,
);

export const authRoute = route;
