import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { RatingsController } from "./ratings.controller";
import { RatingSchema } from "./ratings.schema";

const router = Router();

router.post(
  "/",
  authorize(),
  validateRequest(RatingSchema.RateMovieSchema),
  RatingsController.upsert,
);

router.delete(
  "/:movieId",
  authorize(),
  validateRequest(RatingSchema.MovieIdParamsSchema),
  RatingsController.remove,
);

router.get("/", authorize(), RatingsController.getMyRatings);

export { router as ratingsRoute };
