import { Worker } from "bullmq";
import { createElement, type FunctionComponent } from "react";

import { redisConfig } from "@/core/database/redis";

import { EMAIL_CONFIG } from "./email.constants";
import type { EmailJobData } from "./email.queue";
import { renderEmailToHtml, renderEmailToPlainText } from "./email.renderer";
import type {
  EmailTemplateName,
  EmailTemplatePropsMap,
  ResetPasswordEmailProps,
  VerifyEmailProps,
  WelcomeEmailProps,
} from "./email.types";
import { sendEmailViaProvider } from "./providers/nodemailer.provider";
import { ResetPasswordEmail } from "./templates/ResetPasswordEmail";
import { VerifyEmail } from "./templates/VerifyEmail";
import { WelcomeEmail } from "./templates/WelcomeEmail";

const templateComponentMap: {
  [K in EmailTemplateName]: (props: EmailTemplatePropsMap[K]) => React.JSX.Element;
} = {
  welcome: WelcomeEmail as (props: WelcomeEmailProps) => React.JSX.Element,
  "verify-email": VerifyEmail as (props: VerifyEmailProps) => React.JSX.Element,
  "reset-password": ResetPasswordEmail as (props: ResetPasswordEmailProps) => React.JSX.Element,
};

export const setupEmailWorker = () => {
  new Worker<EmailJobData>(
    "email",
    async (job) => {
      const { to, subject, template, props } = job.data;

      const Component = templateComponentMap[template] as FunctionComponent;
      const element = createElement(Component, props as unknown as Record<string, unknown>);

      const [html, text] = await Promise.all([
        renderEmailToHtml(element),
        renderEmailToPlainText(element),
      ]);

      await sendEmailViaProvider({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
        text,
      });
    },
    {
      connection: redisConfig,
    },
  );
};
