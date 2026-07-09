import { z } from "zod";

const ToggleFavoriteSchema = z.object({
  body: z.object({
    movieId: z.number().int().positive(),
  }),
});

export const FavoriteSchema = { ToggleFavoriteSchema };
