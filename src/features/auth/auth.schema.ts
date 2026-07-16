import z from "zod";

export const DeviceType = z.enum(["web", "android", "ios"]);

const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

const VerifyEmailSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  fcmToken: z.string().optional(),
});

const ForgotPasswordSchema = z.object({
  email: z.email(),
});

const ResetPasswordSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const ResendVerificationSchema = z.object({
  email: z.email(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const GoogleLoginSchema = z.object({
  idToken: z.string().min(1),
  fcmToken: z.string().optional(),
});

const SignoutSchema = z.object({});

export type AuthSchema = {
  signup: z.infer<typeof SignupSchema>;
  "verify-email": z.infer<typeof VerifyEmailSchema>;
  login: z.infer<typeof LoginSchema>;
  "forgot-password": z.infer<typeof ForgotPasswordSchema>;
  "reset-password": z.infer<typeof ResetPasswordSchema>;
  "change-password": z.infer<typeof ChangePasswordSchema>;
  "google-login": z.infer<typeof GoogleLoginSchema>;
  "resend-verification": z.infer<typeof ResendVerificationSchema>;
  signout: z.infer<typeof SignoutSchema>;
};

export const AuthSchema = {
  SignupSchema,
  VerifyEmailSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  GoogleLoginSchema,
  ResendVerificationSchema,
  SignoutSchema,
};
