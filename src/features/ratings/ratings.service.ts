import { StatusCodes } from "@/core/constants";
import { prisma } from "@/core/database";
import { throwError } from "@/core/utils/app-error";

import type { RatingResponse } from "./ratings.types";

const upsert = async (
  userId: string,
  movieId: number,
  rating: number,
  comment?: string,
): Promise<RatingResponse> => {
  const existing = await prisma.rating.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });

  if (existing) {
    return prisma.rating.update({
      where: { id: existing.id },
      data: { rating, comment },
    });
  }

  return prisma.rating.create({
    data: { userId, movieId, rating, comment },
  });
};

const remove = async (userId: string, movieId: number) => {
  const existing = await prisma.rating.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });

  if (!existing) {
    throwError(StatusCodes.NOT_FOUND, "Rating not found.");
  }

  await prisma.rating.delete({ where: { id: existing.id } });
};

const getMyRatings = async (userId: string): Promise<RatingResponse[]> => {
  return prisma.rating.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const RatingsService = { upsert, remove, getMyRatings };
