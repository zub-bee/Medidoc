import { eq, and, isNull } from "drizzle-orm";
import { patients } from "../drizzle/schemas/patients.schema";
import db from "../configs/db";
import {
  Episode,
  episodes,
  organization_access,
  patient_summaries,
  PatientSummary,
  NewPatientSummary,
  practitioner_access,
  clinical_entries,
  ClinicalEntry,
  NewClinicalEntry
} from "@/drizzle";
import { ApiError } from "@/utils/api-error";

export class PatientService {
  static async getPatientProfile(patientId: string) {
    const patient = await db.query.patients.findFirst({
      where: eq(patients.id, patientId)
    });

    return patient;
  }

  static async getPatientSummaries(patientId: string, category?: string) {
    const rows = await db
      .select()
      .from(patient_summaries)
      .where(
        category
          ? and(
              eq(patient_summaries.patientId, patientId),
              eq(
                patient_summaries.category,
                category as (typeof patient_summaries.category.enumValues)[number]
              )
            )
          : eq(patient_summaries.patientId, patientId)
      );

    const patientSummaries: Record<string, PatientSummary[]> = {};
    for (const row of rows) {
      (patientSummaries[row.category] ??= []).push(row);
    }

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
    organizationId: string,
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
        organizationId: organizationId,
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

  static async getPatientEpisodes(patientId: string, statusQuery?: string) {
    const rows = await db
      .select()
      .from(episodes)
      .where(
        statusQuery === "open" || statusQuery === "closed"
          ? and(
              eq(episodes.patientId, patientId),
              eq(episodes.status, statusQuery)
            )
          : eq(episodes.patientId, patientId)
      );

    const grouped = new Map<string, Episode[]>();
    for (const row of rows) {
      const list = grouped.get(row.status) ?? [];
      list.push(row);
      grouped.set(row.status, list);
    }

    return Array.from(grouped, ([status, episodes]) => ({ status, episodes }));
  }

  static async createNewEpisode(
    patientId: string,
    label: string,
    organizationId: string
  ) {
    const [newEpisode] = await db
      .insert(episodes)
      .values({
        patientId: patientId,
        label: label,
        organizationId: organizationId,
        status: "open",
        openedAt: new Date()
      })
      .returning();

    return newEpisode;
  }

  static async createNewSummary(
    patientId: string,
    category: NewPatientSummary["category"],
    data: Record<string, unknown>,
    episodeId?: string
  ) {
    const [newSummary] = await db
      .insert(patient_summaries)
      .values({
        patientId: patientId,
        category: category,
        data: data,
        episodeId: episodeId ?? null,
        versionNo: 0
      })
      .returning();

    return newSummary;
  }

  static async getClinicalEntries(
    patientId: string,
    eventType?: string,
    episodeId?: string
  ) {
    const rows = await db
      .select()
      .from(clinical_entries)
      .where(
        and(
          eq(clinical_entries.patientId, patientId),
          eventType
            ? eq(
                clinical_entries.eventType,
                eventType as (typeof clinical_entries.eventType.enumValues)[number]
              )
            : undefined,
          episodeId ? eq(clinical_entries.episodeId, episodeId) : undefined
        )
      );

    const grouped: Record<string, ClinicalEntry[]> = {};
    for (const row of rows) {
      (grouped[row.eventType] ??= []).push(row);
    }

    return grouped;
  }

  static async createClinicalEntry(
    patientId: string,
    eventType: NewClinicalEntry["eventType"],
    data: Record<string, unknown>,
    occurredAt: Date,
    organizationId: string,
    practitionerId: string,
    episodeId?: string
  ) {
    const [newClinicalEntry] = await db
      .insert(clinical_entries)
      .values({
        organizationId: organizationId,
        patientId: patientId,
        eventType: eventType,
        data: data,
        episodeId: episodeId ?? null,
        occurredAt: occurredAt,
        recordedAt: new Date(),
        practitionerId: practitionerId
      })
      .returning();

    return newClinicalEntry;
  }
}
