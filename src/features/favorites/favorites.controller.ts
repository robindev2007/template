import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { FavoritesService } from "./favorites.service";

const toggle = catchAsync(async (req, res) => {
  const { movieId } = req.body;
  const result = await FavoritesService.toggle(req.user!.userId, movieId);
  const message = result.action === "added" ? "Added to favorites" : "Removed from favorites";
  sendResponse.ok(res, message, result);
});

const getMyFavorites = catchAsync(async (req, res) => {
  const result = await FavoritesService.getMyFavorites(req.user!.userId);
  sendResponse.ok(res, "Favorites retrieved", result);
});

export const FavoritesController = { toggle, getMyFavorites };
