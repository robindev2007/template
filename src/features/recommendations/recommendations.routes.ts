import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { RecommendationsController } from "./recommendations.controller";
import { RecommendationSchema } from "./recommendations.schema";

const router = Router();

router.post(
  "/filter",
  authorize(),
  validateRequest(RecommendationSchema.FilterRecommendationSchema),
  RecommendationsController.fromFilters,
);
router.get("/personalized", authorize(), RecommendationsController.personalized);
router.get(
  "/similar/:movieId",
  authorize(),
  validateRequest(RecommendationSchema.MovieIdParamsSchema),
  RecommendationsController.similarTo,
);

export { router as recommendationsRoute };
