import cookieParser from "cookie-parser";
import express from "express";

import { globalErrorHandler } from "@/core/middleware/error.middleware";
import { requestLogger } from "@/core/middleware/logger.middleware";
import { router as apiRouter } from "@/routes";

import { sendResponse } from "./core/utils";
import { mountBullBoard } from "./features/bullboard";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/public", express.static("public"));
app.use(express.static("public"));

app.use(requestLogger);

mountBullBoard(app);

app.get("/", (req, res) => {
  sendResponse.ok(res, "Welcome to the API");
});

app.use("/api/v1", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, statusCode: 404, message: "Route not found" });
});

app.use(globalErrorHandler);

export { app };
