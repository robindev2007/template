import express from "express";

import { requestLogger } from "@/core/middleware/logger.middleware";
import { router as apiRouter } from "@/routes";

const app = express();

// global middleware (Security, JSON parsing)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

// Mount the entire API router under v1
app.use("/api/v1", apiRouter);

export { app };
