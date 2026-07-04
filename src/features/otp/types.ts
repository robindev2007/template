export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;

export const OtpType = {
  EmailVerification: "email_verification",
  PasswordReset: "password_reset",
} as const;

export type OtpType = (typeof OtpType)[keyof typeof OtpType];
