import { logger } from "@/core";

import { AuthSchema } from "./auth.schema";

const login = async (payload: AuthSchema["login"]) => {
  logger.info("AuthService - login", payload);
};

const signup = async (payload: AuthSchema["signup"]) => {
  logger.info("AuthService - signup", payload);
};

export const AuthService = {
  login,
  signup,
};
