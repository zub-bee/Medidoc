import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import db from "../configs/db";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export function requireOrganizationAccess(paramName: string = "patientId") {
  return async (
    req: UserRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      //this is from which ever middleware function runs before this one, req org or req prac access
      const organizationId =
        req.admin?.organizationId ?? req.practitioner?.organizationId;

      if (!organizationId) {
        return next(ApiError.forbidden("Organization affiliation required"));
      }

      const patientId = req.params[paramName];

      if (!patientId || typeof patientId !== "string") {
        return next(ApiError.badRequest(`Missing ${paramName} in request`));
      }

      const [grant] = await db
        .select()
        .from(organization_access)
        .where(
          and(
            eq(organization_access.patientId, patientId),
            eq(organization_access.organizationId, organizationId),
            eq(organization_access.status, "active")
          )
        )
        .limit(1);

      if (!grant) {
        return next(
          ApiError.forbidden(
            "Your organization does not have active access to this patient's record"
          )
        );
      }

      return next();
    } catch (err) {
      return next(ApiError.server("Something went wrong"));
    }
  };
}
