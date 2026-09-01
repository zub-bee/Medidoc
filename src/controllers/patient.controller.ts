import { UserRequest } from "@/types/user";
import { ApiError } from "@/utils/api-error";
import { ApiResponse } from "@/utils/api-response";
import { PatientService } from "@/services/patient.service";
import { Request, Response, NextFunction } from "express";
import { AsyncHandler } from "@/utils/async-handler";
import { patients } from "../drizzle/schemas/patients.schema";
import db from "../configs/db";
import { eq, and } from "drizzle-orm";
import { practitioners, User } from "@/drizzle";

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
      return next(ApiError.badRequest("Patient account does not exist"));
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

    if (!patientId || !accessId) {
      return next(ApiError.badRequest("Please input an appropriate id"));
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
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

export const getPractiitonerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const allowedPractitioners = await PatientService.getPractitionerAccessList(
      patientId?.toString()
    );

    if (!allowedPractitioners) {
      return next(
        ApiError.server(
          "Failed to get practitioner access list. Please try again later!"
        )
      );
    }

    return ApiResponse.ok(
      res,
      "Practitioners fetched successfully",
      allowedPractitioners
    );
  }
);

export const assignPractitionerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { practitioner_id } = req.body;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    if (!practitioner_id) {
      return next(
        ApiError.badRequest(
          "Please input an appropriate practitioner id in request body"
        )
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    if (!req.admin) {
      return next(ApiError.forbidden("Staff admin access required"));
    }

    const newAccess = await PatientService.addPractitionerAccess(
      req.admin.id,
      patientId.toString(),
      practitioner_id
    );

    if (!newAccess) {
      return next(
        ApiError.server("Failed to create new access. Please try again later!")
      );
    }

    return ApiResponse.created(res, "Access granted successfully", newAccess);
  }
);

export const revokePractitionerAccess = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, accessId } = req.params;

    if (!patientId || !accessId) {
      return next(ApiError.badRequest("Please input an appropriate id"));
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    if (!req.admin) {
      return next(ApiError.forbidden("Staff admin access required"));
    }

    const revokedAccess = await PatientService.removePractitionerAccess(
      patientId.toString(),
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

export const getEpisodes = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { status } = req.query;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const episodes = await PatientService.getPatientEpisodes(
      patientId?.toString(),
      status as string
    );

    if (!episodes) {
      return next(
        ApiError.server(
          "Failed to get profile data. \
                Please try again later!"
        )
      );
    }

    return ApiResponse.ok(res, "Episodes list fetched successfully", {
      episodes: episodes
    });
  }
);

export const createEpisode = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { label } = req.body;

    if (!req.practitioner?.organizationId) {
      return next(
        ApiError.forbidden("You do not have access to make this change")
      );
    }

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    const organizationId = req.practitioner?.organizationId;

    const newEpisode = await PatientService.createNewEpisode(
      patientId?.toString(),
      label,
      organizationId
    );

    if (!newEpisode) {
      return next(
        ApiError.server("Failed to create new episode. Please try again later!")
      );
    }

    return ApiResponse.created(res, "Episode created successfully", newEpisode);
  }
);

export const getPatientSummaries = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { category } = req.query;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientSummaries = await PatientService.getPatientSummaries(
      patientId?.toString(),
      category?.toString()
    );

    if (!patientSummaries) {
      return next(
        ApiError.server(
          "Failed to get profile data. \
                Please try again later!"
        )
      );
    }

    return ApiResponse.ok(res, "Patient summaries fetched successfully", {
      patient_summaries: patientSummaries
    });
  }
);

export const createSummary = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { category, data, episode_id } = req.body;

    if (!req.practitioner?.organizationId) {
      return next(
        ApiError.forbidden("You do not have access to make this change")
      );
    }

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    const newSummary = await PatientService.createNewSummary(
      patientId?.toString(),
      category,
      data,
      episode_id
    );

    if (!newSummary) {
      return next(
        ApiError.server("Failed to create new episode. Please try again later!")
      );
    }

    return ApiResponse.created(res, "Summary created successfully", newSummary);
  }
);

export const getClinicalEntries = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { event_type, episode_id } = req.query;

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const clinicalEntries = await PatientService.getClinicalEntries(
      patientId?.toString(),
      event_type?.toString(),
      episode_id?.toString()
    );

    if (!clinicalEntries) {
      return next(
        ApiError.server(
          "Failed to get profile data. \
                Please try again later!"
        )
      );
    }

    return ApiResponse.ok(
      res,
      "CLinical entries fetched successfully",
      clinicalEntries
    );
  }
);

export const createClinicalEntry = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const { event_type, data, occurred_at, episode_id } = req.body;

    if (!req.practitioner?.organizationId) {
      return next(
        ApiError.forbidden("You do not have access to make this change")
      );
    }

    if (!patientId) {
      return next(
        ApiError.badRequest("Please input an appropriate patient id")
      );
    }

    const patientAccount = await db.query.patients.findFirst({
      where: eq(patients.id, patientId as string)
    });

    if (!patientAccount) {
      return next(ApiError.badRequest("Patient account does not exist"));
    }

    const newEpisode = await PatientService.createClinicalEntry(
      patientId?.toString(),
      event_type.toString(),
      data,
      occurred_at,
      req.practitioner.organizationId,
      req.practitioner.id,
      episode_id
    );

    if (!newEpisode) {
      return next(
        ApiError.server(
          "Failed to create new clinical entry. Please try again later!"
        )
      );
    }

    return ApiResponse.created(
      res,
      "Clinical entry created successfully",
      newEpisode
    );
  }
);
