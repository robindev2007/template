import { Router } from "express";

import { authRoute } from "@/features/auth/auth.routes";
import { favoritesRoute } from "@/features/favorites/favorites.routes";
import { onboardingRoute } from "@/features/onboarding/onboarding.routes";
import { ratingsRoute } from "@/features/ratings/ratings.routes";
import { recommendationsRoute } from "@/features/recommendations/recommendations.routes";
import { moviesRoute } from "@/features/tmdb-movies/tmdb-movies.routes";
import { userRoute } from "@/features/users/user.routes";
import { watchlistRoute } from "@/features/watchlist/watchlist.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/system", onboardingRoute);
router.use("/tmdb-movies", moviesRoute);
router.use("/ratings", ratingsRoute);
router.use("/favorites", favoritesRoute);
router.use("/watchlist", watchlistRoute);
router.use("/recommendations", recommendationsRoute);

export { router };
