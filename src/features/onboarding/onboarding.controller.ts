import { config } from "@/core/config";
import { GENRES_BY_TMDB_ID, WATCH_PREFERENCES, WATCH_PROVIDERS } from "@/core/constants/onboarding";
import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";
import { MoviesService } from "@/features/tmdb-movies/tmdb-movies.service";

const getOnboardingData = catchAsync(async (_req, res) => {
  const baseUrl = config.app.serverUrl.replace(/\/+$/, "");
  const buildImage = (path: string) => `${baseUrl}${path}`;

  const { genres: tmdbGenres } = await MoviesService.getMovieGenres();

  const data = {
    baseUrl,
    watchPreferences: WATCH_PREFERENCES.map(({ ...rest }) => ({
      ...rest,
      image: buildImage(rest.image),
    })),
    genres: tmdbGenres.map((g) => {
      const mapped = GENRES_BY_TMDB_ID[g.id];
      return {
        value: mapped?.value ?? g.name.toLowerCase().replace(/\s+/g, "-"),
        label: g.name,
        image: mapped?.image ? buildImage(mapped.image) : "",
      };
    }),
    watchProviders: WATCH_PROVIDERS,
  };

  sendResponse.ok(res, "Onboarding data retrieved", data);
});

export const OnboardingController = { getOnboardingData };
