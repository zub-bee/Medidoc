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
    const organizationId =
      req.admin?.organizationId || req.practitioner?.organizationId;

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
