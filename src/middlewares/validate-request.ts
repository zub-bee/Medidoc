import { Request, Response, NextFunction } from "express";
import z, { ZodError, type ZodObject, ZodRawShape } from "zod";

import { ApiError } from "../utils/api-error";

export const validateRequest = (
  schema: ZodObject<ZodRawShape>,
  source: "body" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req[source] = schema.parse(req[source]);

      next();
    } catch (error) {
      if (!(error instanceof ZodError)) {
        return next(error);
      }

      return next(
        ApiError.badRequest(
          "Invalid request data",
          z.flattenError(error).fieldErrors || z.flattenError(error)
        )
      );
    }
  };
};
