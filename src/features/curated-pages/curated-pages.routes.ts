import { Router } from "express";

import { authorize, validateRequest } from "@/core/middleware";
import { Role } from "@/prisma/enums";

import { CuratedPagesController } from "./curated-pages.controller";
import { CuratedPageSchema } from "./curated-pages.schema";

const router = Router();

router.post(
  "/",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.CreatePageSchema),
  CuratedPagesController.create,
);

router.get("/", authorize(Role.ADMIN), CuratedPagesController.list);

router.get(
  "/:id",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.PageIdParamsSchema),
  CuratedPagesController.getById,
);

router.put(
  "/:id",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.UpdatePageSchema),
  CuratedPagesController.update,
);

router.delete(
  "/:id",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.PageIdParamsSchema),
  CuratedPagesController.remove,
);

router.post(
  "/:id/items",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.AddItemsSchema),
  CuratedPagesController.addItems,
);

router.delete("/:id/items/:itemId", authorize(Role.ADMIN), CuratedPagesController.removeItem);

router.put(
  "/:id/items/reorder",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.ReorderItemsSchema),
  CuratedPagesController.reorderItems,
);

router.post(
  "/:id/publish",
  authorize(Role.ADMIN),
  validateRequest(CuratedPageSchema.PublishSchema),
  CuratedPagesController.publish,
);

export { router as curatedPagesRoute };
