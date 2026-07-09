import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";

import { FavoritesController } from "./favorites.controller";
import { FavoriteSchema } from "./favorites.schema";

const router = Router();

router.post(
  "/favorites",
  authorize(),
  validateRequest(FavoriteSchema.ToggleFavoriteSchema),
  FavoritesController.toggle,
);
router.get("/favorites", authorize(), FavoritesController.getMyFavorites);

export { router as favoritesRoute };
