import { Router } from "express";

import { authorize } from "@/core/middleware";

import { OnboardingController } from "./onboarding.controller";

const route = Router();

route.get("/app-data", authorize(), OnboardingController.getAppData);

export const onboardingRoute = route;
