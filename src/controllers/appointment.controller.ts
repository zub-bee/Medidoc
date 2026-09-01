import { Response, NextFunction } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { AppointmentService } from "../services/appointment.service";

export const listAppointments = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { patientId } = req.params;
    const appointments = await AppointmentService.listByPatient(
      patientId as string
    );
    return ApiResponse.ok(
      res,
      "Appointments fetched successfully",
      appointments
    );
  }
);

export const createAppointment = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    let organizationId =
      req.admin?.organizationId || req.practitioner?.organizationId;

    if (!organizationId && req.patient_id) {
      const { organizationId: requestedOrganizationId } = req.body;
      if (!requestedOrganizationId) {
        return next(
          ApiError.badRequest(
            "organizationId is required to book with this organization"
          )
        );
      }
      const hasActiveAccess =
        await AppointmentService.patientHasActiveOrgAccess(
          req.patient_id,
          requestedOrganizationId
        );
      if (!hasActiveAccess) {
        return next(
          ApiError.forbidden(
            "You do not have active access to this organization"
          )
        );
      }
      organizationId = requestedOrganizationId;
    }

    if (!patientId || !organizationId) {
      return next(ApiError.forbidden("Staff access required"));
    }

    const appointment = await AppointmentService.create(
      patientId as string,
      organizationId,
      req.body
    );
    return ApiResponse.created(
      res,
      "Appointment created successfully",
      appointment
    );
  }
);

export const checkInAppointment = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, appointmentId } = req.params;

    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const appointment = await AppointmentService.checkIn(
      patientId as string,
      appointmentId as string,
      req.admin.id
    );
    return ApiResponse.ok(
      res,
      "Appointment checked in successfully",
      appointment
    );
  }
);

export const cancelAppointment = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { patientId, appointmentId } = req.params;

    const appointment = await AppointmentService.cancel(
      patientId as string,
      appointmentId as string
    );
    return ApiResponse.ok(
      res,
      "Appointment cancelled successfully",
      appointment
    );
  }
);

export const listOrganizationAppointments = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { organizationId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return next(ApiError.badRequest("A date query param is required"));
    }

    const appointments = await AppointmentService.listByOrganizationForDate(
      organizationId as string,
      date
    );
    return ApiResponse.ok(
      res,
      "Appointments fetched successfully",
      appointments
    );
  }
);

/**
 * The already-taken time slots for one practitioner on one day — used by the
 * booking picker (staff or patient) to grey out slots before submitting.
 * Deliberately returns only `scheduledAt`, not full appointment rows, so a
 * patient caller never sees another patient's appointment details.
 */
export const getPractitionerAvailability = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { organizationId, practitionerId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return next(ApiError.badRequest("A date query param is required"));
    }

    const appointments = await AppointmentService.listByPractitionerForDate(
      organizationId as string,
      practitionerId as string,
      date
    );
    return ApiResponse.ok(res, "Availability fetched successfully", {
      takenSlots: appointments.map(a => a.scheduledAt)
    });
  }
);
