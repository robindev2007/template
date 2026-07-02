import { logger, logStartup } from "@/core/logger";

import { app } from "./app";
import { config } from "./core";

const PORT = config.app.port;

app.listen(PORT, () => {
  // The logStartup function now safely reads the port pass-in parameter
  logStartup(PORT);
  logger.info(`Ready for connections.`);
});
