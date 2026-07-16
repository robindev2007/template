import { StatusCodes } from "@/core/constants";
import { GENRES_BY_VALUE, PROVIDERS_BY_NAME } from "@/core/constants/onboarding";
import { prisma } from "@/core/database";
import { throwError } from "@/core/utils/app-error";
import { SessionService } from "@/features/auth/session.service";

import { GenreItem, profileSelect, ProviderItem, type UserProfile } from "./user.dto";
import type { UserSchema } from "./user.schema";

const getProfileById = async (userId: string): Promise<UserProfile> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return {
    ...user,
    favoriteGenres: user.favoriteGenres.map((value) => {
      const genre = GENRES_BY_VALUE[value];
      return { id: genre?.tmdbId ?? null, name: genre?.label ?? value } as GenreItem;
    }),
    favoriteProviders: user.favoriteProviders.map((name) => {
      const provider = PROVIDERS_BY_NAME[name];
      return {
        id: provider?.providerId ?? null,
        name: provider?.name ?? name,
      } as ProviderItem;
    }),
  };
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

const completeOnboarding = async (userId: string, payload: UserSchema["complete-onboarding"]) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, onboardingCompleted: true },
  });

  if (!user) {
    throwError(StatusCodes.NOT_FOUND, "User not found.");
  }

  if (user.onboardingCompleted) {
    throwError(StatusCodes.BAD_REQUEST, "Onboarding already completed.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      watchPreference: payload.watchPreference,
      favoriteGenres: { set: payload.genres.map(String) },
      favoriteProviders: { set: payload.providers.map(String) },
      onboardingCompleted: true,
    },
  });
};

export const UserService = {
  getProfileById,
  deleteAccount,
  completeOnboarding,
};
