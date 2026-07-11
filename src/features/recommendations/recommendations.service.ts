import { prisma } from "@/core/database";
import { AVAILABLE_FILTERS } from "@/features/tmdb-movies/available-filters";
import { MoviesService } from "@/features/tmdb-movies/tmdb-movies.service";

import type {
  EnrichedMovie,
  FilterInput,
  PaginatedEnrichedResponse,
} from "./recommendations.types";
import { formatEnrichedMovie } from "./recommendations.types";

function toArray(val: string | string[]): string[] {
  return Array.isArray(val) ? val : [val];
}

async function resolveTextFilters(
  filters: FilterInput,
): Promise<Record<string, string | number | boolean>> {
  const params: Record<string, string | number | boolean> = {};

  for (const [groupId, rawValue] of Object.entries(filters)) {
    const group = AVAILABLE_FILTERS.find((g) => g.id === groupId);
    if (!group || group.type !== "text") continue;

    const option = group.options[0];
    if (!option) continue;

    const names = toArray(rawValue);
    const ids: number[] = [];

    for (const name of names) {
      const result = await MoviesService.searchPerson(name);
      const first = result.results[0];
      if (first) {
        ids.push(first.id);
      }
    }

    if (ids.length > 0) {
      params[option.value] = ids.join(",");
    }
  }

  return params;
}

const COMMA_KEYS = new Set(["with_genres", "without_genres"]);
const PIPE_KEYS = new Set(["with_watch_providers"]);

function mergeParam(
  merged: Record<string, string | number | boolean>,
  key: string,
  val: string | number | boolean,
) {
  if (COMMA_KEYS.has(key) && typeof val === "string" && typeof merged[key] === "string") {
    merged[key] = `${merged[key]},${val}`;
  } else if (PIPE_KEYS.has(key) && typeof val === "string" && typeof merged[key] === "string") {
    merged[key] = `${merged[key]}|${val}`;
  } else {
    merged[key] = val;
  }
}

async function lookupTmdbParams(
  filters: FilterInput,
): Promise<Record<string, string | number | boolean>> {
  const merged: Record<string, string | boolean> = {
    sort_by: "popularity.desc",
  };

  for (const [groupId, rawValue] of Object.entries(filters)) {
    const group = AVAILABLE_FILTERS.find((g) => g.id === groupId);
    if (!group) continue;

    if (group.type === "text") continue;

    const values = toArray(rawValue);

    for (const value of values) {
      const option = group.options.find((o) => o.value === value);
      if (option?.tmdbParams) {
        for (const [key, val] of Object.entries(option.tmdbParams)) {
          mergeParam(merged, key, val);
        }
      }
    }
  }

  const textParams = await resolveTextFilters(filters);
  for (const [key, val] of Object.entries(textParams)) {
    mergeParam(merged, key, val);
  }

  return merged;
}

function detectMediaType(filters: FilterInput): "movie" | "tv" | undefined {
  const val = filters["media-type"];
  if (!val) return undefined;
  const value = toArray(val)[0];
  if (value === "tv") return "tv";
  if (value === "movie" || value === "either") return "movie";
  return undefined;
}

async function enrichMovies(
  userId: string,
  movies: { id: number }[],
): Promise<
  {
    yourRating: number | null;
    yourComment: string | null;
    isFavorite: boolean;
    inWatchlist: boolean;
  }[]
> {
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

type WatchProviderResult = {
  flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
  rent?: { provider_id: number; provider_name: string; logo_path: string }[];
  buy?: { provider_id: number; provider_name: string; logo_path: string }[];
  link?: string;
};

async function fetchWatchProviders(movieIds: number[]): Promise<Map<number, WatchProviderResult>> {
  const results = await Promise.all(
    movieIds.map((id) => MoviesService.getAvailability(id).catch(() => null)),
  );

  const map = new Map<number, WatchProviderResult>();
  const US = "US";

  for (let i = 0; i < movieIds.length; i++) {
    const data = results[i];
    if (!data) {
      map.set(movieIds[i]!, {});
      continue;
    }
    const country = data.results[US];
    map.set(movieIds[i]!, {
      flatrate: country?.flatrate,
      rent: country?.rent,
      buy: country?.buy,
      link: country?.link,
    });
  }

  return map;
}

type CheckableMovie = {
  genre_ids: number[];
  original_language: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  popularity: number;
  adult: boolean;
  watchProviders: {
    flatrate?: { provider_id: number }[];
    rent?: { provider_id: number }[];
    buy?: { provider_id: number }[];
  };
};

function scoreGroup(groupId: string, values: string[], movie: CheckableMovie): number | null {
  const group = AVAILABLE_FILTERS.find((g) => g.id === groupId);
  if (!group) return null;

  if (group.type === "text") return null;

  const totalMovieGenres = movie.genre_ids.length || 1;

  switch (groupId) {
    case "genres": {
      const requested = values.map(Number);
      if (requested.length === 0) return null;
      const matched = requested.filter((g) => movie.genre_ids.includes(g));
      return (matched.length / totalMovieGenres) * 100;
    }
    case "avoid": {
      const excluded = values
        .map((v) => group.options.find((o) => o.value === v))
        .flatMap((o) => {
          const genres = o?.tmdbParams?.["without_genres"];
          return genres ? String(genres).split(",").map(Number) : [];
        });
      if (excluded.length === 0) return null;
      const hit = excluded.filter((g) => movie.genre_ids.includes(g));
      return ((totalMovieGenres - hit.length) / totalMovieGenres) * 100;
    }
    case "who-is-watching":
    case "mood":
    case "tonight-mood": {
      const required = values
        .map((v) => group.options.find((o) => o.value === v))
        .flatMap((o) => {
          const genres = o?.tmdbParams?.["with_genres"];
          return genres ? String(genres).split(",").map(Number) : [];
        });
      if (required.length === 0) return null;
      const matched = required.filter((g) => movie.genre_ids.includes(g));
      return (matched.length / totalMovieGenres) * 100;
    }
    case "streaming": {
      const selectedIds = values.map(Number);
      const allProviderIds = new Set<number>();
      for (const p of movie.watchProviders.flatrate ?? []) allProviderIds.add(p.provider_id);
      for (const p of movie.watchProviders.rent ?? []) allProviderIds.add(p.provider_id);
      for (const p of movie.watchProviders.buy ?? []) allProviderIds.add(p.provider_id);
      const matched = selectedIds.filter((id) => allProviderIds.has(id));
      return (matched.length / selectedIds.length) * 100;
    }
    case "language": {
      const lang = values[0];
      if (!lang || lang === "any") return null;
      return movie.original_language === lang ? 100 : 0;
    }
    case "decade": {
      const option = group.options.find((o) => o.value === values[0]);
      const gte = option?.tmdbParams?.["primary_release_date.gte"];
      const lte = option?.tmdbParams?.["primary_release_date.lte"];
      if (!gte) return null;
      if (values[0] === "recent") {
        const year = Number(movie?.release_date?.slice(0, 4));
        const score = Math.min(100, Math.max(0, (year - 2020) * 20 + 20));
        return score;
      }
      if (lte) {
        return movie.release_date >= String(gte) && movie.release_date <= String(lte) ? 100 : 0;
      }
      return movie.release_date >= String(gte) ? 100 : 0;
    }
    case "award-winning": {
      if (values[0] === "yes") {
        const ratingScore = Math.min(100, (movie.vote_average / 10) * 100);
        const votesScore = Math.min(100, (movie.vote_count / 5000) * 100);
        return Math.round(ratingScore * 0.6 + votesScore * 0.4);
      }
      return null;
    }
    case "pace": {
      if (values[0] === "slow") {
        const ratingScore = Math.min(100, (movie.vote_average / 10) * 100);
        const votesConfidence = Math.min(1, movie.vote_count / 2000);
        return Math.round(ratingScore * (0.7 + votesConfidence * 0.3));
      }
      if (values[0] === "fast") {
        return Math.min(100, (movie.popularity / 100) * 100);
      }
      return null;
    }
    case "media-type": {
      if (values[0] === "anime") {
        return movie.original_language === "ja" ? 100 : 0;
      }
      if (values[0] === "documentary") {
        return movie.genre_ids.includes(99) ? 100 : 0;
      }
      return null;
    }
    default:
      return null;
  }
}

function calculateMatchPercentage(movie: CheckableMovie, filters: FilterInput): number {
  const groupScores: number[] = [];

  for (const [groupId, rawValue] of Object.entries(filters)) {
    const values = toArray(rawValue);
    const score = scoreGroup(groupId, values, movie);
    if (score !== null) groupScores.push(score);
  }

  if (groupScores.length === 0) return 100;

  const total = groupScores.reduce((a, b) => a + b, 0);
  return Math.round(total / groupScores.length);
}

const fromFilters = async (
  userId: string,
  filters: FilterInput,
  page = 1,
): Promise<PaginatedEnrichedResponse> => {
  const params = await lookupTmdbParams(filters);
  const mediaType = detectMediaType(filters);

  params["page"] = page;

  const result = await MoviesService.discover(params as Record<string, string>, mediaType);
  const [platform, providers] = await Promise.all([
    enrichMovies(userId, result.results),
    fetchWatchProviders(result.results.map((m) => m.id)),
  ]);

  return {
    page: result.page,
    total_pages: result.total_pages,
    total_results: result.total_results,
    results: result.results.map((movie, i) => {
      const wp = providers.get(movie.id)!;
      const checkable: CheckableMovie = {
        genre_ids: movie.genre_ids,
        original_language: movie.original_language,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        release_date: movie.release_date,
        popularity: movie.popularity,
        adult: movie.adult,
        watchProviders: {
          flatrate: wp.flatrate?.map((p) => ({ provider_id: p.provider_id })),
          rent: wp.rent?.map((p) => ({ provider_id: p.provider_id })),
          buy: wp.buy?.map((p) => ({ provider_id: p.provider_id })),
        },
      };
      return formatEnrichedMovie(
        movie,
        platform[i]!,
        wp,
        calculateMatchPercentage(checkable, filters),
      );
    }),
  };
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
    const [platform, providers] = await Promise.all([
      enrichMovies(userId, trending.results),
      fetchWatchProviders(trending.results.map((m) => m.id)),
    ]);
    return trending.results.map((movie, i) =>
      formatEnrichedMovie(movie, platform[i]!, providers.get(movie.id)!, 0),
    );
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
  const [platform, providers] = await Promise.all([
    enrichMovies(userId, sorted),
    fetchWatchProviders(sorted.map((m) => m.id)),
  ]);

  return sorted.map((movie, i) =>
    formatEnrichedMovie(movie, platform[i]!, providers.get(movie.id)!, 0),
  );
};

const similarTo = async (userId: string, movieId: number): Promise<EnrichedMovie[]> => {
  const movie = await MoviesService.getById(movieId);
  const [platform, providers] = await Promise.all([
    enrichMovies(userId, movie.recommendations.results),
    fetchWatchProviders(movie.recommendations.results.map((m) => m.id)),
  ]);

  return movie.recommendations.results.map((m, i) =>
    formatEnrichedMovie(m, platform[i]!, providers.get(m.id)!, 0),
  );
};

export const RecommendationsService = {
  fromFilters,
  personalized,
  similarTo,
};
