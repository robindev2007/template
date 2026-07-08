import jwt from "jsonwebtoken";

import { config } from "@/core/config";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

const sign = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn as string & jwt.SignOptions["expiresIn"],
  });
};

const verify = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
};

export const JwtUtils = { sign, verify };
