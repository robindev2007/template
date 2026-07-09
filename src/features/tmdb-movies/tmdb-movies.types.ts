export interface TMDBMovie {
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
  adult: boolean;
  video: boolean;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  credits: {
    cast: TMDBPerson[];
    crew: TMDBPerson[];
  };
  similar: TMDBPaginatedResponse<TMDBMovie>;
  recommendations: TMDBPaginatedResponse<TMDBMovie>;
}

export interface TMDBPerson {
  id: number;
  name: string;
  known_for_department: string;
  profile_path: string | null;
  character?: string;
  job?: string;
  popularity: number;
}

export interface TMDBWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBWatchProviders {
  id: number;
  results: Record<
    string,
    {
      link: string;
      flatrate?: TMDBWatchProvider[];
      rent?: TMDBWatchProvider[];
      buy?: TMDBWatchProvider[];
      ads?: TMDBWatchProvider[];
    }
  >;
}

export interface DiscoverFilters {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  without_genres?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "vote_count.gte"?: number;
  "runtime.gte"?: number;
  "runtime.lte"?: number;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  "release_date.gte"?: string;
  "release_date.lte"?: string;
  with_original_language?: string;
  region?: string;
  year?: number;
  "with_runtime.gte"?: number;
  "with_runtime.lte"?: number;
  include_adult?: boolean;
  include_video?: boolean;
}
