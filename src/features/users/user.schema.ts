import z from "zod";

import { GENRES, WATCH_PREFERENCES, WATCH_PROVIDERS } from "@/core/constants/onboarding";

const genreIds = GENRES.map((g) => g.tmdbId) as [number, ...number[]];
const providerIds = WATCH_PROVIDERS.map((p) => p.providerId) as [number, ...number[]];
const preferenceValues = WATCH_PREFERENCES.map((p) => p.value) as [string, ...string[]];

export const CompleteOnboardingSchema = z.object({
  watchPreference: z.enum(preferenceValues),
  genres: z
    .array(
      z.number().refine((v) => (genreIds as number[]).includes(v), { message: "Invalid genre ID" }),
    )
    .min(1),
  providers: z
    .array(
      z
        .number()
        .refine((v) => (providerIds as number[]).includes(v), { message: "Invalid provider ID" }),
    )
    .min(1),
});

export type UserSchema = {
  "complete-onboarding": z.infer<typeof CompleteOnboardingSchema>;
};

export const UserSchema = {
  CompleteOnboardingSchema,
};
