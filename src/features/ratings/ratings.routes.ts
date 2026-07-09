import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { RatingsController } from "./ratings.controller";
import { RatingSchema } from "./ratings.schema";

const router = Router();

router.post(
  "/ratings",
  authorize(),
  validateRequest(RatingSchema.RateMovieSchema),
  RatingsController.upsert,
);
router.delete(
  "/ratings/:movieId",
  authorize(),
  validateRequest(RatingSchema.MovieIdParamsSchema),
  RatingsController.remove,
);
router.get("/ratings", authorize(), RatingsController.getMyRatings);

export { router as ratingsRoute };
