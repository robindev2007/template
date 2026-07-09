import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { WatchlistService } from "./watchlist.service";

const toggle = catchAsync(async (req, res) => {
  const { movieId } = req.body;
  const result = await WatchlistService.toggle(req.user!.userId, movieId);
  const message = result.action === "added" ? "Added to watchlist" : "Removed from watchlist";
  sendResponse.ok(res, message, result);
});

const getMyWatchlist = catchAsync(async (req, res) => {
  const result = await WatchlistService.getMyWatchlist(req.user!.userId);
  sendResponse.ok(res, "Watchlist retrieved", result);
});

export const WatchlistController = { toggle, getMyWatchlist };
