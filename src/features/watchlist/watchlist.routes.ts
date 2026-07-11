import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { WatchlistController } from "./watchlist.controller";
import { WatchlistSchema } from "./watchlist.schema";

const router = Router();

router.post(
  "/",
  authorize(),
  validateRequest(WatchlistSchema.ToggleWatchlistSchema),
  WatchlistController.toggle,
);
router.get("/", authorize(), WatchlistController.getMyWatchlist);

export { router as watchlistRoute };
