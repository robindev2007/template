import type { ResetPasswordEmailProps } from "./templates/ResetPasswordEmail";
import type { VerifyEmailProps } from "./templates/VerifyEmail";
import type { WelcomeEmailProps } from "./templates/WelcomeEmail";

export type { WelcomeEmailProps, VerifyEmailProps, ResetPasswordEmailProps };

export type EmailTemplateName = "welcome" | "verify-email" | "reset-password";

export type EmailTemplatePropsMap = {
  welcome: WelcomeEmailProps;
  "verify-email": VerifyEmailProps;
  "reset-password": ResetPasswordEmailProps;
};

export interface SendEmailPayload<T extends EmailTemplateName> {
  to: string;
  subject: string;
  template: T;
  props: EmailTemplatePropsMap[T];
}
