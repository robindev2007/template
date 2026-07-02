import { app } from "./app";
import { config } from "./core";
import { logger } from "./core/logger";

const PORT = config.app.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
