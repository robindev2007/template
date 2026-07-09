import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { WatchlistController } from "./watchlist.controller";
import { WatchlistSchema } from "./watchlist.schema";

const router = Router();

router.post(
  "/watchlist",
  authorize(),
  validateRequest(WatchlistSchema.ToggleWatchlistSchema),
  WatchlistController.toggle,
);
router.get("/watchlist", authorize(), WatchlistController.getMyWatchlist);

export { router as watchlistRoute };
