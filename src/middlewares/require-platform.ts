import { NextFunction, Response } from "express";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export function requirePlatform(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user?._id || req.user.role !== "platform") {
    return next(ApiError.forbidden("Platform access required"));
  }

  next();
}
