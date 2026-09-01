import { and, desc, eq, sql } from "drizzle-orm";
import db from "../configs/db";
import { users } from "../drizzle/schemas/user.schema";
import { admins } from "../drizzle/schemas/admins.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { providers } from "../drizzle/schemas/providers.schema";
import { patients } from "../drizzle/schemas/patients.schema";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { audit_logs } from "../drizzle/schemas/audit-logs.schema";
import { ApiError } from "../utils/api-error";
import { hashPassword } from "../helpers/auth.helpers";
import {
  CreateAdminType,
  CreatePractitionerType
} from "../validators/organization";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countRows(table: any, where?: any): Promise<number> {
  const query = db.select({ count: sql<number>`count(*)::int` }).from(table);
  const [row] = where ? await query.where(where) : await query;
  return row?.count ?? 0;
}

export class OrganizationService {
  //? PLATFORM-SCOPED ORGANIZATION MANAGEMENT

  static async listOrganizations() {
    const orgs = await db
      .select()
      .from(providers)
      .orderBy(desc(providers.createdAt));

    return Promise.all(
      orgs.map(async org => {
        const [staffAdmins, staffPractitioners, patientCount] =
          await Promise.all([
            countRows(admins, eq(admins.organizationId, org.id)),
            countRows(practitioners, eq(practitioners.organizationId, org.id)),
            countRows(
              organization_access,
              and(
                eq(organization_access.organizationId, org.id),
                eq(organization_access.status, "active")
              )
            )
          ]);

        return {
          ...org,
          staffCount: staffAdmins + staffPractitioners,
          patientCount
        };
      })
    );
  }

  /** Verified orgs only, minimal fields — for a patient browsing who to grant access to. */
  static async listPublicOrganizations() {
    return db
      .select({
        id: providers.id,
        name: providers.name,
        cacNumber: providers.cacNumber
      })
      .from(providers)
      .where(eq(providers.status, "verified"))
      .orderBy(providers.name);
  }

  static async verifyOrganization(organizationId: string) {
    const [org] = await db
      .update(providers)
      .set({ status: "verified", verifiedAt: new Date() })
      .where(eq(providers.id, organizationId))
      .returning();

    if (!org) throw ApiError.notFound("Organization not found");
    return org;
  }

  static async suspendOrganization(organizationId: string) {
    const [org] = await db
      .update(providers)
      .set({ status: "suspended" })
      .where(eq(providers.id, organizationId))
      .returning();

    if (!org) throw ApiError.notFound("Organization not found");
    return org;
  }

  static async reinstateOrganization(organizationId: string) {
    const [org] = await db
      .update(providers)
      .set({ status: "verified" })
      .where(eq(providers.id, organizationId))
      .returning();

    if (!org) throw ApiError.notFound("Organization not found");
    return org;
  }

  static async getPlatformStats() {
    const [
      organizationCount,
      verifiedOrganizationCount,
      patientCount,
      adminCount,
      practitionerCount
    ] = await Promise.all([
      countRows(providers, undefined),
      countRows(providers, eq(providers.status, "verified")),
      countRows(patients, undefined),
      countRows(admins, undefined),
      countRows(practitioners, undefined)
    ]);

    const onboardingRows = await db.execute<{ label: string; value: number }>(
      sql`
        select to_char(date_trunc('month', "created_at"), 'Mon') as label,
               count(*)::int as value
        from "providers"
        where "created_at" >= now() - interval '6 months'
        group by date_trunc('month', "created_at")
        order by date_trunc('month', "created_at")
      `
    );

    return {
      organizations: organizationCount,
      verifiedOrganizations: verifiedOrganizationCount,
      patients: patientCount,
      staff: adminCount + practitionerCount,
      organizationsOnboarded: onboardingRows.rows
    };
  }

  //? ORG-SCOPED DIRECTORIES

  static async listPatientsForOrganization(organizationId: string) {
    return db
      .select({
        id: patients.id,
        fullName: patients.fullName,
        email: patients.email,
        dob: patients.dob,
        phone: patients.phone,
        gender: patients.gender,
        nin: patients.nin,
        accessStatus: organization_access.status,
        grantedAt: organization_access.grantedAt
      })
      .from(organization_access)
      .innerJoin(patients, eq(organization_access.patientId, patients.id))
      .where(eq(organization_access.organizationId, organizationId))
      .orderBy(desc(organization_access.grantedAt));
  }

  static async listPublicPractitioners(organizationId: string) {
    return db
      .select({
        id: practitioners.id,
        fullName: practitioners.fullName
      })
      .from(practitioners)
      .where(
        and(
          eq(practitioners.organizationId, organizationId),
          eq(practitioners.status, "active")
        )
      );
  }
  static async listAdmins(organizationId: string) {
    return db
      .select()
      .from(admins)
      .where(eq(admins.organizationId, organizationId));
  }

  static async createAdmin(
    organizationId: string,
    { name, email, password }: CreateAdminType
  ) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (existingUser) {
      throw ApiError.conflict("A user with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const [createdAdmin] = await db.transaction(async tx => {
      const [createdUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role: "admin",
          isEmailVerified: true
        })
        .returning();

      return tx
        .insert(admins)
        .values({
          userId: createdUser.id,
          organizationId,
          fullName: name,
          email,
          status: "pending"
        })
        .returning();
    });

    return createdAdmin;
  }

  static async approveAdmin(
    targetAdminId: string,
    approvingAdmin: { id: string; organizationId: string }
  ) {
    const [targetAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, targetAdminId))
      .limit(1);

    if (!targetAdmin) {
      throw ApiError.notFound("Admin not found");
    }

    if (targetAdmin.organizationId !== approvingAdmin.organizationId) {
      throw ApiError.forbidden("You do not have access to this admin");
    }

    if (targetAdmin.id === approvingAdmin.id) {
      throw ApiError.forbidden("You cannot approve your own admin account");
    }

    if (targetAdmin.status === "verified") {
      return targetAdmin;
    }

    const [approvedAdmin] = await db.transaction(async tx => {
      const [updatedAdmin] = await tx
        .update(admins)
        .set({ status: "verified" })
        .where(eq(admins.id, targetAdminId))
        .returning();

      await tx.insert(audit_logs).values({
        actorType: "admin",
        actorId: approvingAdmin.id,
        action: "update",
        targetTable: "admins",
        targetId: targetAdminId
      });

      return [updatedAdmin];
    });

    return approvedAdmin;
  }

  static async listPractitioners(organizationId: string) {
    return db
      .select()
      .from(practitioners)
      .where(eq(practitioners.organizationId, organizationId));
  }

  static async createPractitioner(
    organizationId: string,
    { name, email, password }: CreatePractitionerType
  ) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (existingUser) {
      throw ApiError.conflict("A user with this email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const [createdPractitioner] = await db.transaction(async tx => {
      const [createdUser] = await tx
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role: "practitioner",
          isEmailVerified: true
        })
        .returning();

      return tx
        .insert(practitioners)
        .values({
          userId: createdUser.id,
          organizationId,
          fullName: name,
          email,
          status: "pending"
        })
        .returning();
    });

    return createdPractitioner;
  }

  static async approvePractitioner(
    targetPractitionerId: string,
    approvingAdmin: { id: string; organizationId: string }
  ) {
    const [targetPractitioner] = await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.id, targetPractitionerId))
      .limit(1);

    if (!targetPractitioner) {
      throw ApiError.notFound("Practitioner not found");
    }

    if (targetPractitioner.organizationId !== approvingAdmin.organizationId) {
      throw ApiError.forbidden("You do not have access to this practitioner");
    }

    if (targetPractitioner.status === "active") {
      return targetPractitioner;
    }

    const [approvedPractitioner] = await db.transaction(async tx => {
      const [updatedPractitioner] = await tx
        .update(practitioners)
        .set({ status: "active", approvedBy: approvingAdmin.id })
        .where(eq(practitioners.id, targetPractitionerId))
        .returning();

      await tx.insert(audit_logs).values({
        actorType: "admin",
        actorId: approvingAdmin.id,
        action: "update",
        targetTable: "practitioners",
        targetId: targetPractitionerId
      });

      return [updatedPractitioner];
    });

    return approvedPractitioner;
  }
}
