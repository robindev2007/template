import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/core/database";
import { TokenType } from "@/prisma/enums";

export type { TokenType };

const TOKEN_BYTES = 32;

function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export const VerificationTokenService = {
  async create(userId: string, type: TokenType, expiryMinutes: number) {
    const now = new Date();

    await prisma.verificationToken.updateMany({
      where: { userId, type, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    });

    const { raw, hash } = generateToken();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);

    await prisma.verificationToken.create({
      data: { token: hash, type, userId, expiresAt },
    });

    return { token: raw, expiresAt };
  },

  async validate(userId: string, type: TokenType, rawToken: string) {
    const hash = createHash("sha256").update(rawToken).digest("hex");

    const record = await prisma.verificationToken.findFirst({
      where: { token: hash, userId, type, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!record) return null;

    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return record;
  },
};
