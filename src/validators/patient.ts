import * as z from "zod";
import { OTP_TYPES } from "../constants/auth";
import { nameSchema } from "./auth";

export const UpdatePatientProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const OrganizationAccessSchema = z.object({
  organization_id: z.uuid({ error: "Organization id must be in uuid format" })
});
