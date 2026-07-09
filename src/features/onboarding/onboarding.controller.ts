import { GENRES, WATCH_PREFERENCES } from "@/core/constants/onboarding";
import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

const getOnboardingData = catchAsync(async (_req, res) => {
  const data = {
    watchPreferences: WATCH_PREFERENCES.map(({ icon: _, ...rest }) => rest),
    genres: GENRES.map(({ icon: _, ...rest }) => rest),
  };

  sendResponse.ok(res, "Onboarding data retrieved", data);
});

export const OnboardingController = { getOnboardingData };
