import { and, desc, eq, gte, lt, ne } from "drizzle-orm";
import db from "../configs/db";
import { appointments } from "../drizzle/schemas/appointments.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { organization_access } from "../drizzle/schemas/organization-access.schema";
import { ApiError } from "../utils/api-error";
import { CreateAppointmentType } from "../validators/appointment";

export class AppointmentService {
  static async patientHasActiveOrgAccess(
    patientId: string,
    organizationId: string
  ) {
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
    return !!grant;
  }

  static async listByPatient(patientId: string) {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.scheduledAt));
  }

  /** Every appointment for an organization on a given calendar day (UTC). */
  static async listByOrganizationForDate(organizationId: string, date: string) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    return db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.scheduledAt, start),
          lt(appointments.scheduledAt, end)
        )
      )
      .orderBy(appointments.scheduledAt);
  }

  /** A single practitioner's non-cancelled appointments on a given calendar day (UTC). */
  static async listByPractitionerForDate(
    organizationId: string,
    practitionerId: string,
    date: string
  ) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    return db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          eq(appointments.practitionerId, practitionerId),
          gte(appointments.scheduledAt, start),
          lt(appointments.scheduledAt, end),
          ne(appointments.status, "cancelled")
        )
      )
      .orderBy(appointments.scheduledAt);
  }

  static async create(
    patientId: string,
    organizationId: string,
    { practitionerId, scheduledAt }: CreateAppointmentType
  ) {
    const [practitioner] = await db
      .select()
      .from(practitioners)
      .where(
        and(
          eq(practitioners.id, practitionerId),
          eq(practitioners.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!practitioner) {
      throw ApiError.badRequest("Practitioner not found in this organization");
    }

    const scheduledAtDate = new Date(scheduledAt);

    const [clashingAppointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.practitionerId, practitionerId),
          eq(appointments.scheduledAt, scheduledAtDate),
          ne(appointments.status, "cancelled")
        )
      )
      .limit(1);

    if (clashingAppointment) {
      throw ApiError.conflict(
        "This practitioner is already booked at that time"
      );
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        patientId,
        organizationId,
        practitionerId,
        scheduledAt: scheduledAtDate,
        status: "scheduled"
      })
      .returning();

    return appointment;
  }

  static async checkIn(
    patientId: string,
    appointmentId: string,
    checkedInBy: string
  ) {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.patientId, patientId)
        )
      )
      .limit(1);

    if (!appointment) {
      throw ApiError.notFound("Appointment not found for this patient");
    }

    if (appointment.status !== "scheduled") {
      throw ApiError.badRequest(
        `Cannot check in an appointment with status "${appointment.status}"`
      );
    }

    const [checkedInAppointment] = await db
      .update(appointments)
      .set({
        status: "checked_in",
        checkedInBy,
        checkedInAt: new Date()
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    return checkedInAppointment;
  }

  static async cancel(patientId: string, appointmentId: string) {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.patientId, patientId)
        )
      )
      .limit(1);

    if (!appointment) {
      throw ApiError.notFound("Appointment not found for this patient");
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      throw ApiError.badRequest(
        `Cannot cancel an appointment with status "${appointment.status}"`
      );
    }

    const [cancelledAppointment] = await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, appointmentId))
      .returning();

    return cancelledAppointment;
  }
}
