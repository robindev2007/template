import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { AVAILABLE_FILTERS } from "./available-filters";
import { MoviesService } from "./tmdb-movies.service";
import type { DiscoverFilters } from "./tmdb-movies.types";

const discover = catchAsync(async (req, res) => {
  const filters = req.query as unknown as DiscoverFilters;
  const result = await MoviesService.discover(filters);
  sendResponse.ok(res, "Movies retrieved", result);
});

const getById = catchAsync(async (req, res) => {
  const movieId = Number(req.params["id"]);
  const result = await MoviesService.getById(movieId);
  sendResponse.ok(res, "Movie details retrieved", result);
});

const getAvailability = catchAsync(async (req, res) => {
  const movieId = Number(req.params["id"]);
  const result = await MoviesService.getAvailability(movieId);
  sendResponse.ok(res, "Availability retrieved", result);
});

const getGenres = catchAsync(async (_req, res) => {
  const result = await MoviesService.getMovieGenres();
  sendResponse.ok(res, "Movie genres retrieved", result);
});

const getWatchProviders = catchAsync(async (_req, res) => {
  const result = await MoviesService.getWatchProviders();
  sendResponse.ok(res, "Watch providers retrieved", result);
});

const getAvailableFilters = catchAsync(async (_req, res) => {
  sendResponse.ok(res, "Available filters retrieved", AVAILABLE_FILTERS);
});

export const MoviesController = {
  discover,
  getById,
  getAvailability,
  getGenres,
  getWatchProviders,
  getAvailableFilters,
};
