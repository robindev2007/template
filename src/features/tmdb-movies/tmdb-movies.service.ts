import { config } from "@/core/config";
import { StatusCodes } from "@/core/constants";
import { throwError } from "@/core/utils/app-error";

import type {
  DiscoverFilters,
  TMDBGenre,
  TMDBMovie,
  TMDBMovieDetails,
  TMDBPaginatedResponse,
  TMDBProviderListResponse,
  TMDBWatchProviders,
} from "./tmdb-movies.types";

const BASE = config.tmdb.baseUrl;
const KEY = config.tmdb.apiKey;

async function fetchFromTMDB<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("api_key", KEY);
  url.searchParams.set("language", "en-US");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throwError(StatusCodes.INTERNAL_SERVER_ERROR, `TMDB request failed: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

const discover = async (filters: DiscoverFilters) => {
  const params: Record<string, string | number | boolean | undefined> = { ...filters };
  if (params["include_adult"] === undefined) params["include_adult"] = false;

  return fetchFromTMDB<TMDBPaginatedResponse<TMDBMovie>>("/discover/movie", params);
};

const getById = async (movieId: number) => {
  const movie = fetchFromTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "credits,similar,recommendations",
  });

  return movie;
};

const getAvailability = async (movieId: number) => {
  return fetchFromTMDB<TMDBWatchProviders>(`/movie/${movieId}/watch/providers`);
};

interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

const getMovieGenres = async () => {
  return fetchFromTMDB<TMDBGenreResponse>("/genre/movie/list");
};

const getWatchProviders = async () => {
  const data = await fetchFromTMDB<TMDBProviderListResponse>("/watch/providers/movie");

  return {
    results: data.results.map(({ ...rest }) => rest),
  };
};

export const MoviesService = {
  discover,
  getById,
  getAvailability,
  getMovieGenres,
  getWatchProviders,
};
