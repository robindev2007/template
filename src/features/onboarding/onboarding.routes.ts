import { Router } from "express";

import { authorize } from "@/core/middleware";

import { OnboardingController } from "./onboarding.controller";

const route = Router();

route.get("/onboarding", authorize(), OnboardingController.getOnboardingData);

export const onboardingRoute = route;
