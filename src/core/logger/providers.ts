// src/core/logger/providers.ts
import pino from "pino";

export type LogMetadata = Record<string, unknown>;

export interface ILogger {
  info: <T extends LogMetadata>(message: string, meta?: T) => void;
  error: <T extends LogMetadata>(message: string, meta?: T) => void;
  warn: <T extends LogMetadata>(message: string, meta?: T) => void;
  success: <T extends LogMetadata>(message: string, meta?: T) => void;
}

export const createPinoLogger = (): ILogger => {
  // Setup pino-pretty for development
  const isDev = process.env.NODE_ENV !== "production";

  const logger = pino({
    level: "info",
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  });

  return {
    info: (message, meta) => logger.info(meta as LogMetadata, message),
    error: (message, meta) => logger.error(meta as LogMetadata, message),
    warn: (message, meta) => logger.warn(meta as LogMetadata, message),
    // Map success to info, but include a custom tag in metadata
    success: (message, meta) => logger.info({ ...meta, type: "success" }, `✅ ${message}`),
  };
};
