import type { Response } from "express";

import { StatusCodes } from "@/core/constants";
import type { T_Meta } from "@/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  meta?: T_Meta;
};

export const send = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: T_Meta,
) => {
  const body: ApiResponse<T> = { success: statusCode < 400, message };
  if (data !== undefined) body.data = data;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
};

const ok = <T>(res: Response, message = "Success", data?: T) =>
  send(res, StatusCodes.OK, message, data);

const created = <T>(res: Response, message = "Created", data?: T) =>
  send(res, StatusCodes.CREATED, message, data);

const paginated = <T>(res: Response, data: T[], meta: T_Meta, message = "Success") =>
  send(res, StatusCodes.OK, message, data, meta);

const noContent = (res: Response) => res.status(StatusCodes.NO_CONTENT).send();

const badRequest = (res: Response, message = "Bad request") =>
  send(res, StatusCodes.BAD_REQUEST, message);

const unauthorized = (res: Response, message = "Unauthorized") =>
  send(res, StatusCodes.UNAUTHORIZED, message);

const forbidden = (res: Response, message = "Forbidden") =>
  send(res, StatusCodes.FORBIDDEN, message);

const notFound = (res: Response, message = "Resource not found") =>
  send(res, StatusCodes.NOT_FOUND, message);

const validationError = <T>(res: Response, errors?: T, message = "Validation failed") =>
  send(res, StatusCodes.UNPROCESSABLE_ENTITY, message, errors);

const tooManyRequests = (res: Response, message = "Too many requests") =>
  send(res, StatusCodes.TOO_MANY_REQUESTS, message);

const error_ = <T>(
  res: Response,
  message = "Internal server error",
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  data?: T,
) => send(res, statusCode, message, data);

export const sendResponse = {
  ok,
  created,
  paginated,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  tooManyRequests,
  error: error_,
};
