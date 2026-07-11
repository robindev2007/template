import { z } from "zod";

const DiscoverQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    sort_by: z.string().optional(),
    with_genres: z.string().optional(),
    without_genres: z.string().optional(),
    "vote_average.gte": z.coerce.number().min(0).max(10).optional(),
    "vote_average.lte": z.coerce.number().min(0).max(10).optional(),
    "vote_count.gte": z.coerce.number().int().min(0).optional(),
    "runtime.gte": z.coerce.number().int().min(0).optional(),
    "runtime.lte": z.coerce.number().int().min(0).optional(),
    "primary_release_date.gte": z.string().optional(),
    "primary_release_date.lte": z.string().optional(),
    "release_date.gte": z.string().optional(),
    "release_date.lte": z.string().optional(),
    with_original_language: z.string().optional(),
    region: z.string().optional(),
    year: z.coerce.number().int().optional(),
    "with_runtime.gte": z.coerce.number().int().min(0).optional(),
    "with_runtime.lte": z.coerce.number().int().min(0).optional(),
    include_adult: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    include_video: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

const MovieParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Movie ID must be a positive integer"),
  }),
});

const PersonSearchSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});

export const TMDBMovieSchema = {
  DiscoverQuerySchema,
  MovieParamsSchema,
  PersonSearchSchema,
};

export type TMDBMovieSchemaType = {
  discoverQuery: z.infer<typeof DiscoverQuerySchema>["query"];
  movieParams: z.infer<typeof MovieParamsSchema>["params"];
};
