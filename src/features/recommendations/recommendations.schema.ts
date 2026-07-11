import { z } from "zod";

const FilterRecommendationSchema = z.object({
  body: z.object({
    filters: z
      .record(z.string(), z.union([z.string(), z.array(z.string())]))
      .refine((obj) => Object.keys(obj).length > 0, "At least one filter is required"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
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
