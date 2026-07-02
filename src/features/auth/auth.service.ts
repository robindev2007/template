import { logger } from "@/core";

import { AuthSchema } from "./auth.schema";

const login = async (payload: AuthSchema["login"]) => {
  logger.error("AuthService.login is not implemented yet", payload);
};

const signup = async (payload: AuthSchema["signup"]) => {
  logger.error("AuthService.signup is not implemented yet", payload);
};

export const AuthService = {
  login,
  signup,
};
