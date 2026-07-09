import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { RatingsService } from "./ratings.service";

const upsert = catchAsync(async (req, res) => {
  const { movieId, rating, comment } = req.body;
  const result = await RatingsService.upsert(req.user!.userId, movieId, rating, comment);
  sendResponse.ok(res, "Movie rated", result);
});

const remove = catchAsync(async (req, res) => {
  const movieId = Number(req.params["movieId"]);
  await RatingsService.remove(req.user!.userId, movieId);
  sendResponse.ok(res, "Rating removed");
});

const getMyRatings = catchAsync(async (req, res) => {
  const result = await RatingsService.getMyRatings(req.user!.userId);
  sendResponse.ok(res, "My ratings retrieved", result);
});

export const RatingsController = { upsert, remove, getMyRatings };
