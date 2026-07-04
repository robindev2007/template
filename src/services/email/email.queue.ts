import { Queue } from "bullmq";

import { redisConfig } from "@/core/database/redis";

import type { EmailTemplateName, EmailTemplatePropsMap } from "./email.types";

export type EmailJobData<T extends EmailTemplateName = EmailTemplateName> = {
  to: string;
  subject: string;
  template: T;
  props: EmailTemplatePropsMap[T];
};

export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
