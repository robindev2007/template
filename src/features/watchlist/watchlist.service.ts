import { prisma } from "@/core/database";

import type { WatchlistResponse } from "./watchlist.types";

const toggle = async (
  userId: string,
  movieId: number,
): Promise<{ action: "added" | "removed"; item: WatchlistResponse | null }> => {
  const existing = await prisma.movieListItem.findUnique({
    where: { userId_movieId_type: { userId, movieId, type: "WATCHLIST" } },
  });

  if (existing) {
    await prisma.movieListItem.delete({ where: { id: existing.id } });
    return { action: "removed", item: null };
  }

  const item = await prisma.movieListItem.create({
    data: { userId, movieId, type: "WATCHLIST" },
  });

  return { action: "added", item };
};

const getMyWatchlist = async (userId: string): Promise<WatchlistResponse[]> => {
  return prisma.movieListItem.findMany({
    where: { userId, type: "WATCHLIST" },
    orderBy: { createdAt: "desc" },
  });
};

export const WatchlistService = { toggle, getMyWatchlist };
