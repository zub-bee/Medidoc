import { Response, NextFunction } from "express";
import { AsyncHandler } from "../utils/async-handler";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { UserRequest } from "../types/user";
import { ConsentFormService } from "../services/consent-form.service";
import { uploadToCloudinary } from "../services/cloudinary.service";

export const listConsentForms = AsyncHandler(
  async (req: UserRequest, res: Response) => {
    const { patientId } = req.params;
    const consentForms = await ConsentFormService.listByPatient(
      patientId as string
    );
    return ApiResponse.ok(
      res,
      "Consent forms fetched successfully",
      consentForms
    );
  }
);

export const createConsentForm = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    if (!patientId || !req.practitioner) {
      return next(ApiError.forbidden("Practitioner access required"));
    }

    if (!req.file) {
      return next(ApiError.badRequest("A signed document file is required"));
    }

    const uploaded = await uploadToCloudinary(req.file.buffer, {
      folder: "uploads/consent-forms",
      resource_type: "auto"
    });

    const consentForm = await ConsentFormService.create(
      patientId as string,
      req.practitioner.organizationId,
      req.practitioner.id,
      uploaded,
      req.body
    );
    return ApiResponse.created(
      res,
      "Consent form created successfully",
      consentForm
    );
  }
);

export const signConsentForm = AsyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { patientId, consentFormId } = req.params;

    if (!patientId || !consentFormId) {
      return next(ApiError.badRequest("Missing patientId or consentFormId"));
    }

    const consentForm = await ConsentFormService.sign(
      patientId as string,
      consentFormId as string
    );
    return ApiResponse.ok(res, "Consent form signed successfully", consentForm);
  }
);
