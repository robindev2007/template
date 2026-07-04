import { Router } from "express";

import { authorize, identify, validateBody } from "@/core/middleware";

import { login, signup, verifyEmail } from "./auth.controller";
import { LoginSchema, SignupSchema, VerifyEmailSchema } from "./auth.schema";

const route = Router();

route.post("/signup", validateBody(SignupSchema), signup);
route.post("/verify-email", validateBody(VerifyEmailSchema), verifyEmail);
route.post("/login", validateBody(LoginSchema), login);

route.get("/me", identify, (req, res) => {
  res.json({ user: req.user });
});

route.get("/admin", identify, authorize("admin"), (_req, res) => {
  res.json({ message: "Admin only" });
});

export const authRoute = route;
