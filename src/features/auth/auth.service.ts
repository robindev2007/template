import bcrypt from "bcrypt";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { config } from "@/core/config";
import { StatusCodes } from "@/core/constants";
import { prisma } from "@/core/database";
import { logger } from "@/core/logger";
import { throwError } from "@/core/utils/app-error";
import { JwtUtils } from "@/core/utils/jwt";
import { emailQueue } from "@/services/email";

import type { AuthSchema } from "./auth.schema";
import { SessionService } from "./session.service";
import { VerificationTokenService } from "./verification-token.service";

const googleJWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

async function verifyGoogleToken(idToken: string) {
  if (!config.auth.googleClientId) {
    throwError(StatusCodes.INTERNAL_SERVER_ERROR, "Google login is not configured.");
  }

  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: ["accounts.google.com", "https://accounts.google.com"],
    audience: config.auth.googleClientId,
  });

  return payload;
}

async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.app.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await emailQueue.add("send-verify-email", {
    to: email,
    subject: "Verify your email",
    template: "verify-email",
    props: {
      companyName: config.app.name,
      verifyUrl: url,
      expiryMinutes: config.auth.tokenExpiryMinutes,
    },
  });

  return url;
}

async function sendResetPasswordEmail(email: string, userName: string, token: string) {
  const url = `${config.app.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await emailQueue.add("send-reset-password-email", {
    to: email,
    subject: "Reset your password",
    template: "reset-password",
    props: {
      companyName: config.app.name,
      userName,
      resetUrl: url,
      expiryMinutes: config.auth.tokenExpiryMinutes,
    },
  });
}

const signup = async (payload: AuthSchema["signup"]) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    if (existing.deletedAt) {
      throwError(StatusCodes.BAD_REQUEST, "This account has been deactivated.");
    }

    if (existing.verified) {
      throwError(StatusCodes.BAD_REQUEST, "Email already exists. Please login instead.");
    }

    const { token } = await VerificationTokenService.create(
      existing.id,
      "magic_link",
      config.auth.tokenExpiryMinutes,
    );

    const url = await sendVerificationEmail(existing.email, token);

    if (config.app.env === "development") {
      return { verificationUrl: url };
    }

    return;
  }

  const password = await bcrypt.hash(payload.password, 12);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password,
      name: payload.name ?? null,
    },
  });

  logger.info("New user created", { userId: user.id });

  const { token } = await VerificationTokenService.create(
    user.id,
    "magic_link",
    config.auth.tokenExpiryMinutes,
  );

  const url = await sendVerificationEmail(user.email, token);

  if (config.app.env === "development") {
    return { verificationUrl: url };
  }
};

const verifyEmail = async (payload: AuthSchema["verify-email"]) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link.");
  }

  if (user!.verified) {
    throwError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link.");
  }

  const record = await VerificationTokenService.validate(user!.id, "magic_link", payload.token);

  if (!record) {
    throwError(StatusCodes.BAD_REQUEST, "Invalid or expired verification link.");
  }

  await prisma.user.update({
    where: { id: user!.id },
    data: { verified: true },
  });

  const session = await SessionService.create(user!.id);

  const jwt = await JwtUtils.sign({
    userId: user!.id,
    email: user!.email,
    role: user!.role,
    sessionId: session.id,
  });

  await emailQueue.add("send-welcome-email", {
    to: user!.email,
    subject: "Welcome!",
    template: "welcome",
    props: {
      companyName: config.app.name,
      userName: user!.name ?? "there",
    },
  });

  return {
    token: jwt,
    session: { id: session.id, token: session.token, expiresAt: session.expiresAt },
    user: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
    },
  };
};

const login = async (payload: AuthSchema["login"], deviceType?: "web" | "android" | "ios") => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  if (user.deletedAt) {
    throwError(StatusCodes.UNAUTHORIZED, "This account has been deactivated.");
  }

  if (!user!.password) {
    throwError(
      StatusCodes.UNAUTHORIZED,
      "This account uses Google login. Please sign in with Google.",
    );
  }

  const valid = await bcrypt.compare(payload.password, user!.password);

  if (!valid) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  if (!user!.verified) {
    const { token } = await VerificationTokenService.create(
      user!.id,
      "magic_link",
      config.auth.tokenExpiryMinutes,
    );

    await sendVerificationEmail(user!.email, token);

    return { redirectToVerifyPage: true };
  }

  const session = await SessionService.create(user!.id, {
    fcmToken: payload.fcmToken,
    deviceType,
  });

  const token = await JwtUtils.sign({
    userId: user!.id,
    email: user!.email,
    role: user!.role,
    sessionId: session.id,
  });

  return {
    token,
    session: { id: session.id, token: session.token, expiresAt: session.expiresAt },
    user: {
      id: user!.id,
      email: user!.email,
      name: user!.name,
      role: user!.role,
    },
  };
};

const forgotPassword = async (payload: AuthSchema["forgot-password"]) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "Email not found.");
  }

  if (!user.verified) {
    throwError(StatusCodes.BAD_REQUEST, "Email not verified.");
  }

  const { token } = await VerificationTokenService.create(
    user.id,
    "reset_password",
    config.auth.tokenExpiryMinutes,
  );

  await sendResetPasswordEmail(user.email, user.name ?? "User", token);
};

const resendVerification = async (payload: AuthSchema["resend-verification"]) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "Email not found.");
  }

  if (user.verified) {
    throwError(StatusCodes.BAD_REQUEST, "Email already verified.");
  }

  const { token } = await VerificationTokenService.create(
    user.id,
    "magic_link",
    config.auth.tokenExpiryMinutes,
  );

  const url = await sendVerificationEmail(user.email, token);

  if (config.app.env === "development") {
    return { verificationUrl: url };
  }
};

const resetPassword = async (payload: AuthSchema["reset-password"]) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.BAD_REQUEST, "Invalid or expired reset link.");
  }

  const record = await VerificationTokenService.validate(user!.id, "reset_password", payload.token);

  if (!record) {
    throwError(StatusCodes.BAD_REQUEST, "Invalid or expired reset link.");
  }

  const password = await bcrypt.hash(payload.password, 12);

  await prisma.user.update({
    where: { id: user!.id },
    data: { password },
  });

  await SessionService.deleteAllForUser(user!.id);

  logger.info("Password reset successfully", { userId: user!.id });
};

const changePassword = async (userId: string, payload: AuthSchema["change-password"]) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid credentials.");
  }

  if (!user!.password) {
    throwError(StatusCodes.UNAUTHORIZED, "This account uses Google login. Cannot change password.");
  }

  const valid = await bcrypt.compare(payload.currentPassword, user!.password);

  if (!valid) {
    throwError(StatusCodes.UNAUTHORIZED, "Current password is incorrect.");
  }

  const password = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password },
  });

  await SessionService.deleteAllForUser(userId);

  logger.info("Password changed successfully", { userId });
};

const googleLogin = async (
  payload: AuthSchema["google-login"],
  deviceType?: "web" | "android" | "ios",
) => {
  const googlePayload = await verifyGoogleToken(payload.idToken);
  const email = googlePayload["email"] as string | undefined;
  const name = googlePayload["name"] as string | undefined;

  if (!email) {
    throwError(StatusCodes.BAD_REQUEST, "Google account has no email.");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (user.deletedAt) {
      throwError(StatusCodes.BAD_REQUEST, "This account has been deactivated.");
    }

    if (!user.provider) {
      throwError(
        StatusCodes.CONFLICT,
        "This email is already registered with email and password. Please login using your email and password.",
      );
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        provider: "GOOGLE",
        verified: true,
      },
    });

    logger.info("New user created via Google", { userId: user.id });
  }

  const session = await SessionService.create(user.id, {
    fcmToken: payload.fcmToken,
    deviceType,
  });

  const token = await JwtUtils.sign({
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });

  return {
    token,
    session: { id: session.id, token: session.token, expiresAt: session.expiresAt },
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

const signout = async (userId: string, sessionId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session || session.userId !== userId) {
    throwError(StatusCodes.NOT_FOUND, "Session not found.");
  }

  await SessionService.deleteById(sessionId);

  logger.info("User signed out", { userId, sessionId });
};

export const AuthService = {
  signup,
  verifyEmail,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  signout,
  resendVerification,
};
