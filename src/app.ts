import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { config } from "@/core/config";
import { globalErrorHandler } from "@/core/middleware/error.middleware";
import { requestLogger } from "@/core/middleware/logger.middleware";
import { sendResponse } from "@/core/utils";
import { mountBullBoard } from "@/features/bullboard";
import { router as apiRouter } from "@/routes";

import { MoviesService } from "./features/tmdb-movies/tmdb-movies.service";

const app = express();

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", config.cors.origin],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/public", express.static("public"));
app.use(express.static("public"));

app.use(requestLogger);

mountBullBoard(app);

app.get("/", async (req, res) => {
  const movies = await MoviesService.discover({});

  sendResponse.ok(res, "Welcome to the API", movies);
});

app.use("/api/v1", apiRouter);

app.use((_req, res) => {
  sendResponse.notFound(res, "Route not found", {
    route: _req.originalUrl,
    timeStamp: new Date().toISOString(),
  });
});

app.use(globalErrorHandler);

export { app };
