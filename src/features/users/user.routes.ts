import { Router } from "express";

import { authorize, validateBody } from "@/core/middleware";

import { UserController } from "./user.controller";
import { UserSchema } from "./user.schema";

const route = Router();

route.get("/profile", authorize(), UserController.getProfile);
route.delete("/account", authorize(), UserController.deleteAccount);
route.post(
  "/onboarding",
  authorize(),
  validateBody(UserSchema.CompleteOnboardingSchema),
  UserController.completeOnboarding,
);

export const userRoute = route;
