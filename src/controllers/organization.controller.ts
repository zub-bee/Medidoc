import { Response } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { OrganizationService } from "../services/organization.service";

export const listAdmins = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const admins = await OrganizationService.listAdmins(
      organizationId as string
    );
    return ApiResponse.ok(res, "Admins fetched successfully", admins);
  }
);

export const createAdmin = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const admin = await OrganizationService.createAdmin(
      organizationId as string,
      req.body
    );
    return ApiResponse.created(res, "Admin created successfully", admin);
  }
);

export const approveAdmin = AsyncHandler(
  async (req: UserRequest, res: Response, next) => {
    const { adminId } = req.params;
    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const admin = await OrganizationService.approveAdmin(
      adminId as string,
      req.admin
    );
    return ApiResponse.ok(res, "Admin approved successfully", admin);
  }
);

export const listPractitioners = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const practitioners = await OrganizationService.listPractitioners(
      organizationId as string
    );
    return ApiResponse.ok(
      res,
      "Practitioners fetched successfully",
      practitioners
    );
  }
);

export const createPractitioner = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { organizationId } = req.params;
    const practitioner = await OrganizationService.createPractitioner(
      organizationId as string,
      req.body
    );
    return ApiResponse.created(
      res,
      "Practitioner created successfully",
      practitioner
    );
  }
);

export const approvePractitioner = AsyncHandler(
  async (req: UserRequest, res: Response, next) => {
    const { practitionerId } = req.params;
    if (!req.admin) {
      return next(ApiError.forbidden("Admin access required"));
    }

    const practitioner = await OrganizationService.approvePractitioner(
      practitionerId as string,
      req.admin
    );
    return ApiResponse.ok(
      res,
      "Practitioner approved successfully",
      practitioner
    );
  }
);
