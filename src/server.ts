import { logger, logStartup } from "@/core/logger";

import { app } from "./app";
import { config } from "./core";

const g = globalThis as unknown as { __server_listening__?: boolean };
const PORT = config.app.port;

if (!g.__server_listening__) {
  g.__server_listening__ = true;

  app.listen(PORT, () => {
    logStartup(PORT);
    logger.info(`Ready for connections.`);
  });
}
