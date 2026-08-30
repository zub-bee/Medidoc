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

    // check patient role status
    if (!authpatientId || role !== "patient") {
      // check if it has patient access under req.patient_access
      return next(ApiError.unauthorized("Unauthorized access"));
    }

    if (req.path !== "/me" && !patientId) {
      return next(ApiError.badRequest("No patientId requested"));
    }

    const patient = await PatientService.getPatientProfile(
      patientId?.toString() || authpatientId
    );

    if (!patient) {
      return next(ApiError.notFound("Patient account not found"));
    }

    return ApiResponse.ok(res, "Patient profile fetched successfully", {
      patient_id: authpatientId || patientId,
      ...patient
    });
  }
);

export const getPatientSummaries = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const authpatientId = req?.patient_id;
    const role = req?.user?.role;
    const { patientId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    // check if the role is patient and if it's the
    // auth user by checking if it matches the authpatientId

    // check if it's an admin or practitioner, check the role
    // check if the patient has given access to this user

    // if (!patientId || role !== "patient") {
    //     return next(ApiError.unauthorized("Unauthorized access"));
    // }

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
