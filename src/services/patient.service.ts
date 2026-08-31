import { eq, sql, and, isNull } from "drizzle-orm";
import { patients } from "../drizzle/schemas/patients.schema";
import db from "../configs/db";
import {
  organization_access,
  patient_summaries,
  PatientSummary,
  practitioner_access
} from "@/drizzle";
import { ApiError } from "@/utils/api-error";

export class PatientService {
  static async getPatientProfile(patientId: string) {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId)
    });

    console.log(patient);

    return patient;
  }

  static async getPatientSummaries(patientId: string) {
    const data = await db
      .select({
        category: patient_summaries.category,
        summaries: sql<PatientSummary[]>`json_agg(${patient_summaries})`
      })
      .from(patient_summaries)
      .where(eq(patient_summaries.patientId, patientId))
      .groupBy(patient_summaries.category);

    // update the data structure for each category to have an array
    const summaries = Object.fromEntries(
      data.map(row => [row.category, row.summaries])
    );

    // remove category from summaries array
    const patientSummaries = Object.fromEntries(
      data.map(({ category, summaries }) => [
        category,
        summaries.map(({ category: _, patientId: __, ...rest }) => rest)
      ])
    );

    return patientSummaries;
  }

  static async getOrganizationAccessList(patientId: string) {
    return db
      .select()
      .from(organization_access)
      .where(
        and(
          eq(organization_access.patientId, patientId),
          eq(organization_access.status, "active"),
          isNull(organization_access.revokedAt)
        )
      );
  }

  static async getPractitionerAccessList(patientId: string) {
    return db
      .select()
      .from(practitioner_access)
      .where(
        and(
          eq(practitioner_access.patientId, patientId),
          eq(practitioner_access.status, "active"),
          isNull(practitioner_access.revokedAt)
        )
      );
  }

  static async addOrganizationAccess(
    patientId: string,
    organizationId: string
  ) {
    const access = await db.query.organization_access.findFirst({
      where: and(
        eq(organization_access.patientId, patientId),
        eq(organization_access.organizationId, organizationId)
      )
    });

    if (access) {
      throw ApiError.badRequest("Organization access has already been granted");
    }

    const newAccess = await db
      .insert(organization_access)
      .values({
        patientId: patientId,
        organizationId: organizationId,
        status: "active",
        grantedAt: new Date()
      })
      .returning();

    return newAccess;
  }

  static async addPractitionerAccess(
    adminId: string,
    patientId: string,
    practitionerId: string
  ) {
    const access = await db.query.practitioner_access.findFirst({
      where: and(
        eq(practitioner_access.patientId, patientId),
        eq(practitioner_access.id, practitionerId)
      )
    });

    if (access) {
      throw ApiError.badRequest("Organization access has already been granted");
    }

    const newAccess = await db
      .insert(practitioner_access)
      .values({
        patientId: patientId,
        practitionerId: practitionerId,
        grantedBy: adminId,
        status: "active",
        grantedAt: new Date()
      })
      .returning();

    return newAccess;
  }

  static async removeOrganizationAccess(patientId: string, accessId: string) {
    const access = await db.query.organization_access.findFirst({
      where: eq(organization_access.id, accessId as string)
    });

    if (!access) {
      throw ApiError.badRequest("Invalid access id");
    }

    const removedAccess = await db
      .update(organization_access)
      .set({
        status: "revoked",
        revokedAt: new Date()
      })
      .where(
        and(
          eq(organization_access.patientId, patientId),
          eq(organization_access.id, accessId)
        )
      )
      .returning();

    return removedAccess;
  }

  static async removePractitionerAccess(patientId: string, accessId: string) {
    const access = await db.query.practitioner_access.findFirst({
      where: eq(practitioner_access.id, accessId)
    });

    if (!access) {
      throw ApiError.badRequest("Invalid access id");
    }

    const removedAccess = await db
      .update(practitioner_access)
      .set({
        status: "revoked",
        revokedAt: new Date()
      })
      .where(
        and(
          eq(practitioner_access.patientId, patientId),
          eq(practitioner_access.id, accessId)
        )
      )
      .returning();

    return removedAccess;
  }
}
