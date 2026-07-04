declare namespace Express {
  interface Request {
    user?: import("../core/middleware/identify.middleware").AuthUser;
  }
}
