import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { RecommendationsService } from "./recommendations.service";

const fromFilters = catchAsync(async (req, res) => {
  const { filters } = req.body;
  const page = Number(req.query["page"]) || 1;
  const result = await RecommendationsService.fromFilters(req.user!.userId, filters, page);
  sendResponse.paginated(
    res,
    result.results,
    { page: result.page, limit: 20, total: result.total_results },
    "Filter recommendations retrieved",
  );
});

const personalized = catchAsync(async (req, res) => {
  const result = await RecommendationsService.personalized(req.user!.userId);
  sendResponse.ok(res, "Personalized recommendations retrieved", result);
});

const similarTo = catchAsync(async (req, res) => {
  const movieId = Number(req.params["movieId"]);
  const result = await RecommendationsService.similarTo(req.user!.userId, movieId);
  sendResponse.ok(res, "Similar recommendations retrieved", result);
});

export const RecommendationsController = {
  fromFilters,
  personalized,
  similarTo,
};
