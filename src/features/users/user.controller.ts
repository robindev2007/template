import { sendResponse } from "@/core/utils";
import { catchAsync } from "@/core/utils/catch-async";

import { UserService } from "./user.service";

const getProfile = catchAsync(async (req, res) => {
  const profile = await UserService.getProfileById(req.user!.userId);
  sendResponse.ok(res, "Profile retrieved", profile);
});

const deleteAccount = catchAsync(async (req, res) => {
  await UserService.deleteAccount(req.user!.userId);
  sendResponse.ok(res, "Account deleted successfully.");
});

const completeOnboarding = catchAsync(async (req, res) => {
  await UserService.completeOnboarding(req.user!.userId, req.body);
  sendResponse.ok(res, "Onboarding completed.");
});

export const UserController = { getProfile, deleteAccount, completeOnboarding };
