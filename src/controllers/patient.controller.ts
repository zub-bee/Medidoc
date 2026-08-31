import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { PatientService } from "@/services/patient.service";
import { Request, Response, NextFunction } from "express";
import { AsyncHandler } from "@/utils/async-handler";

export const handlePatientProfile = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const authpatientId = req?.patient_id;
    const role = req?.user?.role;
    const { patientId } = req.params;

    // if it's an unsignedin patient
    if (!authpatientId && role === "patient") {
      return next(ApiError.unauthorized("Unauthorized access"));
    }

    if (req.path !== "/me" && !patientId) {
      return next(ApiError.badRequest("No patientId requested"));
    }

    const patient = await PatientService.getPatientProfile(
      authpatientId || patientId?.toString()
    );

    if (!patient) {
      return next(ApiError.notFound("Patient account not found"));
    }

    return ApiResponse.ok(res, "Patient profile fetched successfully", {
      patientId: authpatientId || patientId,
      ...patient
    });
  }
);

export const updatePatientProfile = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {}
);

export const getPatientSummaries = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientSummaries = await PatientService.getPatientSummaries(
      patientId?.toString()
    );

    if (!patientSummaries) {
      return next(
        ApiError.server(
          "Failed to get profile data. \
                Please try again later!"
        )
      );
    }

    return ApiResponse.ok(res, "User profile fetched successfully", {
      patient_summaries: patientSummaries
    });
  }
);
