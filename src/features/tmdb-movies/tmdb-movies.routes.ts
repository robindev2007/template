import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { MoviesController } from "./tmdb-movies.controller";
import { TMDBMovieSchema } from "./tmdb-movies.schema";

const router = Router();

router.get(
  "/discover",
  authorize(),
  validateRequest(TMDBMovieSchema.DiscoverQuerySchema),
  MoviesController.discover,
);

router.get("/genres/movie", authorize(), MoviesController.getGenres);

router.get("/watch/providers", authorize(), MoviesController.getWatchProviders);
router.get("/available-filters", authorize(), MoviesController.getAvailableFilters);

router.get(
  "/movies/:id",
  authorize(),
  validateRequest(TMDBMovieSchema.MovieParamsSchema),
  MoviesController.getById,
);

router.get(
  "/movies/:id/availability",
  authorize(),
  validateRequest(TMDBMovieSchema.MovieParamsSchema),
  MoviesController.getAvailability,
);

export { router as moviesRoute };
