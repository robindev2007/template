import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

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

const searchPerson = catchAsync(async (req, res) => {
  const query = req.query["q"] as string;
  const result = await MoviesService.searchPerson(query);
  sendResponse.ok(res, "Person search results", result);
});

export const MoviesController = {
  discover,
  getById,
  getAvailability,
  searchPerson,
};
