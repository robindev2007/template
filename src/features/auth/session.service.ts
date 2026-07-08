import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/core/database";

const SESSION_TOKEN_BYTES = 32;

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const SessionService = {
  async create(userId: string, opts?: { userAgent?: string; ipAddress?: string }) {
    const raw = randomBytes(SESSION_TOKEN_BYTES).toString("hex");
    const refreshRaw = randomBytes(SESSION_TOKEN_BYTES).toString("hex");

    const session = await prisma.session.create({
      data: {
        userId,
        token: hashToken(raw),
        refreshToken: hashToken(refreshRaw),
        userAgent: opts?.userAgent,
        ipAddress: opts?.ipAddress,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { id: session.id, token: raw, refreshToken: refreshRaw, expiresAt: session.expiresAt };
  },

  async findByToken(rawToken: string) {
    const hash = hashToken(rawToken);

    const session = await prisma.session.findFirst({
      where: { token: hash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) return null;

    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return session;
  },

  async delete(rawToken: string) {
    const hash = hashToken(rawToken);
    await prisma.session.deleteMany({ where: { token: hash } });
  },

  async deleteAllForUser(userId: string) {
    await prisma.session.deleteMany({ where: { userId } });
  },
};
