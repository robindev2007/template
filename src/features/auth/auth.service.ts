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

const GENERIC_SUCCESS = "If an account with that email exists, a verification link has been sent.";

async function sendVerificationEmail(email: string, token: string) {
  const url = `${config.app.serverUrl}/api/v1/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

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
}

const signup = async (payload: AuthSchema["signup"]) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    if (existing.verified) {
      logger.info("Signup attempt for existing verified email", { email: payload.email });
      return { message: GENERIC_SUCCESS };
    }

    const { token } = await VerificationTokenService.create(
      existing.id,
      "magic_link",
      config.auth.tokenExpiryMinutes,
    );

    await sendVerificationEmail(existing.email, token);

    return { message: GENERIC_SUCCESS };
  }

  const password = await Bun.password.hash(payload.password);

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

  await sendVerificationEmail(user.email, token);

  return { message: GENERIC_SUCCESS };
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

  const jwt = JwtUtils.sign({
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

const login = async (payload: AuthSchema["login"]) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  const valid = await Bun.password.verify(payload.password, user!.password);

  if (!valid) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
  }

  if (!user!.verified) {
    throwError(StatusCodes.FORBIDDEN, "Please verify your email address before signing in.");
  }

  const session = await SessionService.create(user!.id);

  const token = JwtUtils.sign({
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

export const AuthService = { signup, verifyEmail, login };
