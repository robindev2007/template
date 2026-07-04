import { randomInt } from "node:crypto";

import { prisma } from "@/core/database";

import { OTP_EXPIRY_MINUTES } from "./types";
import type { OtpType } from "./types";

type OtpPayload = {
  code: string;
  expiresAt: Date;
};

const generate = (): OtpPayload => {
  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return { code, expiresAt };
};

const create = async (userId: string, type: OtpType) => {
  const { code, expiresAt } = generate();

  await prisma.otpCode.create({
    data: { code, userId, type, expiresAt },
  });

  return { code, expiresAt };
};

const validate = async (userId: string, type: OtpType, code: string) => {
  const record = await prisma.otpCode.findFirst({
    where: { userId, type, code, used: false, expiresAt: { gt: new Date() } },
  });

  return record;
};

const markUsed = async (id: string) => {
  await prisma.otpCode.update({ where: { id }, data: { used: true } });
};

export const OtpService = {
  generate,
  create,
  validate,
  markUsed,
};
