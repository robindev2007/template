import { workbench } from "@getworkbench/express";
import type { Express } from "express";

import { userQueue } from "@/features/users/user.queue";
import { emailQueue } from "@/services/email";

export function mountQueueDashboard(app: Express) {
  app.use(
    "/jobs",
    workbench({
      queues: [emailQueue, userQueue],
      auth: {
        username: "admin",
        password: "admin",
      },
    }),
  );
}
