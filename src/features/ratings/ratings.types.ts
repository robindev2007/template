export interface RatingResponse {
  id: string;
  movieId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
