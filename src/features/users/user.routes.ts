import { Router } from "express";

import { authorize } from "@/core/middleware";

import { UserController } from "./user.controller";

const route = Router();

route.get("/profile", authorize(), UserController.getProfile);
route.delete("/account", authorize(), UserController.deleteAccount);

export const userRoute = route;
