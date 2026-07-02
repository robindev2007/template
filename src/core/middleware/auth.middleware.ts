import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Later: add JWT verification logic here
  next();
};
