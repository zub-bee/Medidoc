import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import db from "../configs/db";
import { practitioner_access } from "../drizzle/schemas/practitioner-access.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export function requirePractitionerAccess(paramName: string = "patientId") {
  return async (
    req: UserRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.practitioner) {
        return next(ApiError.forbidden("Practitioner access required"));
      }

      const patientId = req.params[paramName];

      if (!patientId || typeof patientId !== "string") {
        return next(ApiError.badRequest(`Missing ${paramName} in request`));
      }

      const [grant] = await db
        .select()
        .from(practitioner_access)
        .where(
          and(
            eq(practitioner_access.patientId, patientId),
            eq(practitioner_access.practitionerId, req.practitioner.id),
            eq(practitioner_access.status, "active")
          )
        )
        .limit(1);

      if (!grant) {
        return next(
          ApiError.forbidden(
            "You do not have active access to this patient's record"
          )
        );
      }

      return next();
    } catch (err) {
      return next(ApiError.server("Something went wrong"));
    }
  };
}
