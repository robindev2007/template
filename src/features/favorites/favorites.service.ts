import { prisma } from "@/core/database";

import type { FavoriteResponse } from "./favorites.types";

const toggle = async (
  userId: string,
  movieId: number,
): Promise<{ action: "added" | "removed"; item: FavoriteResponse | null }> => {
  const existing = await prisma.movieListItem.findUnique({
    where: { userId_movieId_type: { userId, movieId, type: "FAVORITE" } },
  });

  if (existing) {
    await prisma.movieListItem.delete({ where: { id: existing.id } });
    return { action: "removed", item: null };
  }

  const item = await prisma.movieListItem.create({
    data: { userId, movieId, type: "FAVORITE" },
  });

  return { action: "added", item };
};

const getMyFavorites = async (userId: string): Promise<FavoriteResponse[]> => {
  return prisma.movieListItem.findMany({
    where: { userId, type: "FAVORITE" },
    orderBy: { createdAt: "desc" },
  });
};

export const FavoritesService = { toggle, getMyFavorites };
