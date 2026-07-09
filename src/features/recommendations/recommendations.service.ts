import { prisma } from "@/core/database";
import { AVAILABLE_FILTERS } from "@/features/tmdb-movies/available-filters";
import { MoviesService } from "@/features/tmdb-movies/tmdb-movies.service";

import type { EnrichedMovie } from "./recommendations.types";

const FLAT_OPTIONS = AVAILABLE_FILTERS.flatMap((g) => g.options);

function lookupTmdbParams(filterValues: string[]): Record<string, string | number | boolean> {
  const merged: Record<string, string | number | boolean> = {};

  for (const value of filterValues) {
    const option = FLAT_OPTIONS.find((o) => o.value === value);
    if (option?.tmdbParams) {
      for (const [key, val] of Object.entries(option.tmdbParams)) {
        merged[key] = val;
      }
    }
  }

  return merged;
}

async function enrichMovies(
  userId: string,
  movies: { id: number }[],
): Promise<EnrichedMovie["platform"][]> {
  const movieIds = movies.map((m) => m.id);

  const [ratings, favorites, watchlist] = await Promise.all([
    prisma.rating.findMany({ where: { userId, movieId: { in: movieIds } } }),
    prisma.movieListItem.findMany({
      where: { userId, movieId: { in: movieIds }, type: "FAVORITE" },
    }),
    prisma.movieListItem.findMany({
      where: { userId, movieId: { in: movieIds }, type: "WATCHLIST" },
    }),
  ]);

  const ratingMap = new Map(ratings.map((r) => [r.movieId, r]));
  const favoriteSet = new Set(favorites.map((f) => f.movieId));
  const watchlistSet = new Set(watchlist.map((w) => w.movieId));

  return movies.map((m) => ({
    yourRating: ratingMap.get(m.id)?.rating ?? null,
    yourComment: ratingMap.get(m.id)?.comment ?? null,
    isFavorite: favoriteSet.has(m.id),
    inWatchlist: watchlistSet.has(m.id),
  }));
}

const fromFilters = async (userId: string, filterValues: string[]): Promise<EnrichedMovie[]> => {
  const params = lookupTmdbParams(filterValues);
  const result = await MoviesService.discover(params as Record<string, string>);
  const platform = await enrichMovies(userId, result.results);

  return result.results.map((movie, i) => ({
    tmdb: movie,
    platform: platform[i]!,
  }));
};

const personalized = async (userId: string): Promise<EnrichedMovie[]> => {
  const [highRated, favorites] = await Promise.all([
    prisma.rating.findMany({
      where: { userId, rating: { gte: 7 } },
      orderBy: { rating: "desc" },
      take: 5,
    }),
    prisma.movieListItem.findMany({ where: { userId, type: "FAVORITE" }, take: 5 }),
  ]);

  const seedIds = [
    ...new Set([...highRated.map((r) => r.movieId), ...favorites.map((f) => f.movieId)]),
  ];

  if (seedIds.length === 0) {
    const trending = await MoviesService.discover({ sort_by: "popularity.desc" } as Record<
      string,
      string
    >);
    const platform = await enrichMovies(userId, trending.results);
    return trending.results.map((movie, i) => ({ tmdb: movie, platform: platform[i]! }));
  }

  const allRecs = await Promise.all(
    seedIds
      .slice(0, 5)
      .map((id) => MoviesService.getById(id).then((m) => m.recommendations.results)),
  );

  const seen = new Set<number>(seedIds);
  const freq = new Map<number, number>();
  const movieMap = new Map<number, (typeof allRecs)[number][number]>();

  for (const list of allRecs) {
    for (const movie of list) {
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      freq.set(movie.id, (freq.get(movie.id) ?? 0) + 1);
      movieMap.set(movie.id, movie);
    }
  }

  const sorted = [...movieMap.values()]
    .sort((a, b) => (freq.get(b.id) ?? 0) - (freq.get(a.id) ?? 0))
    .slice(0, 20);
  const platform = await enrichMovies(userId, sorted);

  return sorted.map((movie, i) => ({ tmdb: movie, platform: platform[i]! }));
};

const similarTo = async (userId: string, movieId: number): Promise<EnrichedMovie[]> => {
  const movie = await MoviesService.getById(movieId);
  const platform = await enrichMovies(userId, movie.recommendations.results);

  return movie.recommendations.results.map((m, i) => ({
    tmdb: m,
    platform: platform[i]!,
  }));
};

export const RecommendationsService = {
  fromFilters,
  personalized,
  similarTo,
};
