import z from "zod";

const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
});

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
});

export type AuthSchema = {
  signup: z.infer<typeof SignupSchema>;
  login: z.infer<typeof LoginSchema>;
};

export const AuthSchema = {
  signup: SignupSchema,
  login: LoginSchema,
};
