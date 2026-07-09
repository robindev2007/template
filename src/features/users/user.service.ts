import { StatusCodes } from "@/core/constants";
import { prisma } from "@/core/database";
import { throwError } from "@/core/utils/app-error";
import { SessionService } from "@/features/auth/session.service";

import { profileSelect, type UserProfile } from "./user.dto";

const getProfileById = async (userId: string): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return user;
};

const deleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "User not found.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  await SessionService.deleteAllForUser(userId);
};

export const UserService = {
  getProfileById,
  deleteAccount,
};
