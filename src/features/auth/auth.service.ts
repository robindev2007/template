import { config } from "@/core/config";
import { StatusCodes } from "@/core/constants";
import { prisma } from "@/core/database";
import { assertFound, throwError } from "@/core/utils/app-error";
import { JwtUtils } from "@/core/utils/jwt";
import type { AuthSchema } from "@/features/auth/auth.schema";
import { OtpService } from "@/features/otp/otp.service";
import { OtpType } from "@/features/otp/types";
import { emailQueue } from "@/services/email";

const signup = async (payload: AuthSchema["signup"]) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throwError(StatusCodes.CONFLICT, "Email already registered");
  }

  const password = await Bun.password.hash(payload.password);

  const user = await prisma.user.create({
    data: {
      email: payload.email,
      password,
      name: payload.name ?? null,
    },
  });

  const { code } = await OtpService.create(user.id, OtpType.EmailVerification);

  await emailQueue.add("send-verify-email", {
    to: user.email,
    subject: "Verify your email",
    template: "verify-email",
    props: {
      companyName: config.app.name,
      otp: code,
      expiryMinutes: 10,
    },
  });

  return { message: "Verification email sent" };
};

const verifyEmail = async (payload: AuthSchema["verify-email"]) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  assertFound(user, StatusCodes.NOT_FOUND, "User not found");

  if (user.verified) {
    return { message: "Email already verified" };
  }

  const record = await OtpService.validate(user.id, OtpType.EmailVerification, payload.otp);
  assertFound(record, StatusCodes.BAD_REQUEST, "Invalid or expired OTP");

  await Promise.all([
    OtpService.markUsed(record.id),
    prisma.user.update({ where: { id: user.id }, data: { verified: true } }),
  ]);

  const token = JwtUtils.sign({ userId: user.id, email: user.email, role: user.role });

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

const login = async (payload: AuthSchema["login"]) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  assertFound(user, StatusCodes.UNAUTHORIZED, "Invalid email or password");

  const valid = await Bun.password.verify(payload.password, user.password);
  if (!valid) {
    throwError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const token = JwtUtils.sign({ userId: user.id, email: user.email, role: user.role });

  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
};

export const AuthService = {
  signup,
  verifyEmail,
  login,
};
