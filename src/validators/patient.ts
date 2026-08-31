import * as z from "zod";
import { OTP_TYPES } from "../constants/auth";
import { nameSchema } from "./auth";

export const UpdatePatientProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});
