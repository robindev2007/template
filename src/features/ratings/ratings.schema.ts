import { z } from "zod";

const RateMovieSchema = z.object({
  body: z.object({
    movieId: z.number().int().positive(),
    rating: z.number().int().min(1).max(10),
    comment: z.string().max(2000).optional(),
  }),
});

const MovieIdParamsSchema = z.object({
  params: z.object({
    movieId: z.coerce.number().int().positive(),
  }),
});

export const RatingSchema = {
  RateMovieSchema,
  MovieIdParamsSchema,
};
