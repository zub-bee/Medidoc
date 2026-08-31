import { and, desc, eq } from "drizzle-orm";
import db from "../configs/db";
import { appointments } from "../drizzle/schemas/appointments.schema";
import { practitioners } from "../drizzle/schemas/practitioners.schema";
import { ApiError } from "../utils/api-error";
import { CreateAppointmentType } from "../validators/appointment";

export class AppointmentService {
  static async listByPatient(patientId: string) {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.scheduledAt));
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

    const [appointment] = await db
      .insert(appointments)
      .values({
        patientId,
        organizationId,
        practitionerId,
        scheduledAt: new Date(scheduledAt),
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
}
