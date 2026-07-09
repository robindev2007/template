export interface FilterRecommendationInput {
  filters: string[];
}

export interface EnrichedMovie {
  tmdb: {
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
  };
  platform: {
    yourRating: number | null;
    yourComment: string | null;
    isFavorite: boolean;
    inWatchlist: boolean;
  };
}
