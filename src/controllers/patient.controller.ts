import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { PatientService } from "@/services/patient.service";
import { Response, NextFunction } from "express";
import { AsyncHandler } from "@/utils/async-handler";

export const handlePatientProfile = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patient = req.patient;

    if (!patient) {
      return next(ApiError.notFound("Patient account not found"));
    }

    return ApiResponse.ok(res, "Patient profile fetched successfully", {
      patient
    });
  }
);

export const getPatientSummaries = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientId = req.patient?.id;

    if (!patientId) {
      return next(ApiError.unauthorized("Unauthorized access"));
    }

    const patientSummaries =
      await PatientService.getPatientSummaries(patientId);

    if (!patientSummaries) {
      return next(
        ApiError.server("Failed to get profile data. Please try again later!")
      );
    }

    return ApiResponse.ok(res, "User profile fetched successfully", {
      patient_summaries: patientSummaries
    });
  }
);
