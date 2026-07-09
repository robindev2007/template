import { z } from "zod";

const ToggleWatchlistSchema = z.object({
  body: z.object({
    movieId: z.number().int().positive(),
  }),
});

export const WatchlistSchema = { ToggleWatchlistSchema };
