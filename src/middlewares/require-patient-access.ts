import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import db from "../configs/db";
import { admins } from "../drizzle/schemas/admins.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { practitioner_access } from "../drizzle/schemas/practitioner-access.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

export function requirePatientAccess(paramName: string = "patientId") {
  return async (
    req: UserRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        return next(ApiError.forbidden("Authentication required"));
      }

      const patientId = req.params[paramName];
      if (!patientId || typeof patientId !== "string") {
        return next(ApiError.badRequest(`Missing ${paramName} in request`));
      }

      let organizationId: string | undefined;

      if (req.user.role === "admin" || req.user.role === "provider") {
        const [admin] = await db
          .select()
          .from(admins)
          .where(eq(admins.userId, req.user._id))
          .limit(1);

        if (!admin || admin.status !== "verified") {
          return next(ApiError.forbidden("Admin access required"));
        }

        req.admin = { id: admin.id, organizationId: admin.organizationId };
        organizationId = admin.organizationId;
      } else if (req.user.role === "practitioner") {
        const [practitioner] = await db
          .select()
          .from(practitioners)
          .where(eq(practitioners.userId, req.user._id))
          .limit(1);

        if (!practitioner) {
          return next(
            ApiError.forbidden("Practitioner account does not exist")
          );
        }

        if (practitioner.status !== "active") {
          return next(
            ApiError.forbidden("Practitioner account is not yet approved")
          );
        }

        req.practitioner = {
          id: practitioner.id,
          organizationId: practitioner.organizationId
        };

        const [practitionerGrant] = await db
          .select()
          .from(practitioner_access)
          .where(
            and(
              eq(practitioner_access.patientId, patientId),
              eq(practitioner_access.practitionerId, practitioner.id),
              eq(practitioner_access.status, "active")
            )
          )
          .limit(1);

        if (!practitionerGrant) {
          return next(
            ApiError.forbidden(
              "You do not have active access to this patient's record"
            )
          );
        }

        return next();
      } else {
        return next(ApiError.forbidden("Staff access required"));
      }

      const [orgGrant] = await db
        .select()
        .from(organization_access)
        .where(
          and(
            eq(organization_access.patientId, patientId),
            eq(organization_access.organizationId, organizationId!),
            eq(organization_access.status, "active")
          )
        )
        .limit(1);

      if (!orgGrant) {
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
