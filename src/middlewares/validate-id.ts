import { ApiError } from "../utils/api-error";
import { NextFunction, Request, Response } from "express";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateObjectId = (paramName: string = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value =
      req?.params[paramName] || req?.body[paramName] || req?.query[paramName];
    if (
      !value ||
      typeof value !== "string" ||
      value.trim().length === 0 ||
      !UUID_REGEX.test(value)
    ) {
      throw ApiError.badRequest(`Invalid ${paramName}`);
    }

    next();
  };
};
