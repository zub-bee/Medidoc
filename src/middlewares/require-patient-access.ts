import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import db from "../configs/db";
import { admins } from "../drizzle/schemas/admins.schema";
import { providers } from "../drizzle/schemas/providers.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { patients } from "../drizzle/schemas/patients.schema";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { practitioner_access } from "../drizzle/schemas/practitioner-access.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest, UserRole } from "../types/user";

interface PatientAccessOptions {
  paramName?: string;
  roles?: Array<"admin" | "provider" | "practitioner" | "patient">;
}

export function requirePatientAccess(options: PatientAccessOptions = {}) {
  const { paramName = "patientId", roles } = options;

  return async (
    req: UserRequest,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?._id) {
        return next(ApiError.forbidden("Authentication required"));
      }

      const patientId = req.params[paramName] as string;
      if (!patientId) {
        return next(ApiError.badRequest(`Missing ${paramName} in request`));
      }

      const role = req.user.role;

      if (
        roles &&
        role &&
        !roles.includes(
          role as "admin" | "provider" | "practitioner" | "patient"
        )
      ) {
        return next(
          ApiError.forbidden(
            "You do not have permission to access this resource"
          )
        );
      }

      if (role === "patient") {
        const [patientAccount] = await db
          .select()
          .from(patients)
          .where(eq(patients.userId, req.user._id))
          .limit(1);

        if (!patientAccount) {
          return next(ApiError.forbidden("Patient account does not exist"));
        }

        if (patientAccount.id !== patientId) {
          return next(
            ApiError.forbidden("You do not have access to this data")
          );
        }

        req.patient_id = patientAccount.id;

        return next();
      }

      if (role === "admin") {
        const [admin] = await db
          .select()
          .from(admins)
          .where(eq(admins.userId, req.user._id))
          .limit(1);

        if (!admin || admin.status !== "verified") {
          return next(ApiError.forbidden("Admin access required"));
        }

        req.admin = { id: admin.id, organizationId: admin.organizationId };

        const [orgGrant] = await db
          .select()
          .from(organization_access)
          .where(
            and(
              eq(organization_access.patientId, patientId),
              eq(organization_access.organizationId, admin.organizationId),
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
      }

      if (role === "provider") {
        const [provider] = await db
          .select()
          .from(providers)
          .where(eq(providers.userId, req.user._id))
          .limit(1);

        if (!provider || provider.status !== "verified") {
          return next(
            ApiError.forbidden("Provider organization access required")
          );
        }

        const [admin] = await db
          .select()
          .from(admins)
          .where(eq(admins.userId, req.user._id))
          .limit(1);

        if (admin) {
          req.admin = { id: admin.id, organizationId: provider.id };
        }

        const [orgGrant] = await db
          .select()
          .from(organization_access)
          .where(
            and(
              eq(organization_access.patientId, patientId),
              eq(organization_access.organizationId, provider.id),
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
      }

      if (role === "practitioner") {
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
      }

      return next(ApiError.forbidden("Staff access required"));
    } catch (err) {
      return next(ApiError.server("Something went wrong"));
    }
  };
}
