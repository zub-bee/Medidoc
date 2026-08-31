import { eq } from "drizzle-orm";
import db from "../configs/db";
import { users } from "../drizzle/schemas/user.schema";
import { admins } from "../drizzle/schemas/admins.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { audit_logs } from "../drizzle/schemas/audit-logs.schema";
import { ApiError } from "../utils/api-error";
import { hashPassword } from "../helpers/auth.helpers";
import {
  CreateAdminType,
  CreatePractitionerType
} from "../validators/organization";

export class OrganizationService {
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

    const [approvedPractitioner] = await db
      .update(practitioners)
      .set({ status: "active", approvedBy: approvingAdmin.id })
      .where(eq(practitioners.id, targetPractitionerId))
      .returning();

    await db.insert(audit_logs).values({
      actorType: "admin",
      actorId: approvingAdmin.id,
      action: "update",
      targetTable: "practitioners",
      targetId: targetPractitionerId
    });

    return approvedPractitioner;
  }
}
