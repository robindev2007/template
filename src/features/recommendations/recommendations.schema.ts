import { z } from "zod";

const FilterRecommendationSchema = z.object({
  body: z.object({
    filters: z.array(z.string()).min(1, "At least one filter is required"),
  }),
});

const MovieIdParamsSchema = z.object({
  params: z.object({
    movieId: z.coerce.number().int().positive(),
  }),
});

export const RecommendationSchema = {
  FilterRecommendationSchema,
  MovieIdParamsSchema,
};
