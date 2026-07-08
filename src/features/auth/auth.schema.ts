import z from "zod";

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
});

const ForgotPasswordSchema = z.object({
  email: z.email(),
});

const ResetPasswordSchema = z.object({
  email: z.email(),
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type AuthSchema = {
  signup: z.infer<typeof SignupSchema>;
  "verify-email": z.infer<typeof VerifyEmailSchema>;
  login: z.infer<typeof LoginSchema>;
  "forgot-password": z.infer<typeof ForgotPasswordSchema>;
  "reset-password": z.infer<typeof ResetPasswordSchema>;
  "change-password": z.infer<typeof ChangePasswordSchema>;
};

export const AuthSchema = {
  SignupSchema,
  VerifyEmailSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
};
