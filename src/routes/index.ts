// src/routes/index.ts
import { Router } from "express";

import { authRoute } from "@/features/auth/auth.routes";

const router = Router();

router.use("/auth", authRoute);

export { router };
