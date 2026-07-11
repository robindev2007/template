import { config } from "@/core/config";
import { GENRES_BY_TMDB_ID } from "@/core/constants/onboarding";

export type FilterInput = Record<string, string | string[]>;

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const SERVER_URL = config.app.serverUrl.replace(/\/+$/, "");

function formatImage(path: string | null, size = "original"): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

function resolveServerPath(path: string): string {
  return `${SERVER_URL}${path}`;
}

export interface EnrichedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: { tmdbId: number; value: string; label: string; image: string }[];
  original_language: string;
  popularity: number;
  watch_providers: {
    flatrate?: { provider_id: number; provider_name: string; logo_path: string | null }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string | null }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string | null }[];
    link?: string;
  };
  match_percentage: number;
  yourRating: number | null;
  yourComment: string | null;
  isFavorite: boolean;
  inWatchlist: boolean;
}

export interface PaginatedEnrichedResponse {
  page: number;
  total_pages: number;
  total_results: number;
  results: EnrichedMovie[];
}

export function formatEnrichedMovie(
  movie: {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    original_language: string;
    popularity: number;
  },
  platform: {
    yourRating: number | null;
    yourComment: string | null;
    isFavorite: boolean;
    inWatchlist: boolean;
  },
  watchProviders: {
    flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
    rent?: { provider_id: number; provider_name: string; logo_path: string }[];
    buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    link?: string;
  },
  matchPercentage: number,
): EnrichedMovie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: formatImage(movie.poster_path, "w780"),
    backdrop_path: formatImage(movie.backdrop_path, "w1280"),
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    genres: movie.genre_ids
      .map((id) => GENRES_BY_TMDB_ID[id])
      .filter((g): g is { tmdbId: number; value: string; label: string; image: string } =>
        Boolean(g),
      )
      .map((g) => ({ ...g, image: g.image ? resolveServerPath(g.image) : "" })),
    original_language: movie.original_language,
    popularity: movie.popularity,
    watch_providers: {
      flatrate: watchProviders.flatrate?.map((p) => ({
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        logo_path: formatImage(p.logo_path, "w154"),
      })),
      rent: watchProviders.rent?.map((p) => ({
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        logo_path: formatImage(p.logo_path, "w154"),
      })),
      buy: watchProviders.buy?.map((p) => ({
        provider_id: p.provider_id,
        provider_name: p.provider_name,
        logo_path: formatImage(p.logo_path, "w154"),
      })),
      link: watchProviders.link,
    },
    match_percentage: matchPercentage,
    yourRating: platform.yourRating,
    yourComment: platform.yourComment,
    isFavorite: platform.isFavorite,
    inWatchlist: platform.inWatchlist,
  };
}
