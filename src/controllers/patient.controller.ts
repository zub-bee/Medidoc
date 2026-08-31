import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { PatientService } from "@/services/patient.service";
import { Request, Response, NextFunction } from "express";
import { AsyncHandler } from "@/utils/async-handler";
import { patients } from "../drizzle/schemas/patients.schema";
import db from "../configs/db";
import { eq } from "drizzle-orm";
import { organization_access } from "@/drizzle";

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
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const data = req.body;
    const { name, address, phone } = data;

    if (!req.patient_id) {
      return next(ApiError.unauthorized("Unauthorized access"));
    }

    const patientProfile = await PatientService.getPatientProfile(
      req.patient_id.toString()
    );

    if (!patientProfile) {
      return next(ApiError.notFound("Sorry no patient profile not found"));
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.fullName = name;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(patients)
        .set(updateData)
        .where(eq(patients.id, patientProfile.id));
    }

    const updatedUser = await PatientService.getPatientProfile(
      patientProfile.id
    );

    return ApiResponse.Success(res, "Profile updated successfully!", {
      profile: {
        id: updatedUser?.id,
        name: updatedUser?.fullName,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        address: updatedUser?.address,
        nin: updatedUser?.nin,
        gender: updatedUser?.gender,
        updatedAt: updatedUser?.updatedAt
      }
    });
  }
);

export const getOrganizationAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const organizations = await PatientService.getOrganizationAccessList(
      patientId?.toString()
    );

    if (!organizations) {
      return next(
        ApiError.server(
          "Failed to get organization list. Please try again later!"
        )
      );
    }

    return ApiResponse.ok(
      res,
      "Organizations fetched successfully",
      organizations
    );
  }
);

export const assignOrganizationAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { organization_id } = req.body;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.forbidden("Patient account does not exist"));
    }

    const newAccess = await PatientService.addOrganizationAccess(
      patientId?.toString(),
      organization_id
    );

    if (!newAccess) {
      return next(
        ApiError.server("Failed to create new access. Please try again later!")
      );
    }

    return ApiResponse.created(res, "Access created successfully", newAccess);
  }
);

export const revokeOrganizationAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, accessId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.forbidden("Patient account does not exist"));
    }

    const revokedAccess = await PatientService.removeOrganizationAccess(
      patientId?.toString(),
      accessId?.toString()
    );

    if (!revokedAccess) {
      return next(
        ApiError.server("Failed to revoke access. Please try again later!")
      );
    }

    return ApiResponse.ok(res, "Access revoked successfully", revokedAccess);
  }
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
