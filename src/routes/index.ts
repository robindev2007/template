import { Router } from "express";

import { authRoute } from "@/features/auth/auth.routes";
import { onboardingRoute } from "@/features/onboarding/onboarding.routes";
import { userRoute } from "@/features/users/user.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/", onboardingRoute);

export { router };
