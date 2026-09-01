import { NextFunction, Response } from "express";
import { and, eq } from "drizzle-orm";
import db from "../configs/db";
import { admins } from "../drizzle/schemas/admins.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { providers } from "../drizzle/schemas/providers.schema";
import { patients } from "../drizzle/schemas/patients.schema";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";

/**
 * Broader than requireOrgAdmin: allows any verified staff member (admin,
 * practitioner, or provider) of the organization named in the :organizationId
 * param, for org-wide read endpoints that aren't admin-only actions.
 */
export async function requireOrgStaff(
  req: UserRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?._id) {
      return next(ApiError.forbidden("Staff access required"));
    }

    const { organizationId } = req.params;
    if (!organizationId) {
      return next(ApiError.badRequest("Missing organizationId in request"));
    }

    if (req.user.role === "admin") {
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.userId, req.user._id))
        .limit(1);

      if (!admin || admin.status !== "verified") {
        return next(ApiError.forbidden("Admin access required"));
      }

      if (admin.organizationId !== organizationId) {
        return next(
          ApiError.forbidden("You do not have access to this organization")
        );
      }

      req.admin = { id: admin.id, organizationId: admin.organizationId };
      return next();
    }

    if (req.user.role === "practitioner") {
      const [practitioner] = await db
        .select()
        .from(practitioners)
        .where(eq(practitioners.userId, req.user._id))
        .limit(1);

      if (!practitioner || practitioner.status !== "active") {
        return next(ApiError.forbidden("Practitioner access required"));
      }

      if (practitioner.organizationId !== organizationId) {
        return next(
          ApiError.forbidden("You do not have access to this organization")
        );
      }

      req.practitioner = {
        id: practitioner.id,
        organizationId: practitioner.organizationId
      };
      return next();
    }

    if (req.user.role === "provider") {
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

      if (provider.id !== organizationId) {
        return next(
          ApiError.forbidden("You do not have access to this organization")
        );
      }

      req.admin = { id: provider.id, organizationId: provider.id };
      return next();
    }

    return next(ApiError.forbidden("Staff access required"));
  } catch (err) {
    return next(ApiError.server("Something went wrong"));
  }
}

/**
 * Same staff checks as requireOrgStaff, plus a patient with active
 * organization_access to the org named in :organizationId. Used for read
 * endpoints a patient legitimately needs too (e.g. picking a practitioner to
 * book with) but that are still scoped to one organization.
 */
export async function requireOrgMember(
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.user?.role === "patient") {
    try {
      const { organizationId } = req.params;
      if (!organizationId) {
        return next(ApiError.badRequest("Missing organizationId in request"));
      }

      const [patient] = await db
        .select()
        .from(patients)
        .where(eq(patients.userId, req.user._id!))
        .limit(1);

      if (!patient) {
        return next(ApiError.forbidden("Patient account does not exist"));
      }

      const [grant] = await db
        .select()
        .from(organization_access)
        .where(
          and(
            eq(organization_access.patientId, patient.id),
            eq(organization_access.organizationId, organizationId as string),
            eq(organization_access.status, "active")
          )
        )
        .limit(1);

      if (!grant) {
        return next(
          ApiError.forbidden(
            "You do not have active access to this organization"
          )
        );
      }

      req.patient_id = patient.id;
      return next();
    } catch {
      return next(ApiError.server("Something went wrong"));
    }
  }

  return requireOrgStaff(req, res, next);
}
