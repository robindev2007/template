import z from "zod";

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

export const VerifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthSchema = {
  signup: z.infer<typeof SignupSchema>;
  "verify-email": z.infer<typeof VerifyEmailSchema>;
  login: z.infer<typeof LoginSchema>;
};
