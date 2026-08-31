import * as z from "zod";
import { OTP_TYPES } from "../constants/auth";
import { nameSchema } from "./auth";
import { episodes } from "@/drizzle";

export const UpdatePatientProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const OrganizationAccessSchema = z.object({
  organization_id: z.uuid({ error: "Organization id must be in uuid format" })
});

export const PractitionerAccessSchema = z.object({
  practitioner_id: z.uuid({ error: "Organization id must be in uuid format" })
});

export const AccessIdParamsSchema = z.object({
  accessId: z.uuid({ error: "accessId must be a valid UUID" })
});

export const NewEpisodeLabelSchema = z.object({
  label: z
    .string({ error: "label must be a valid string" })
    .min(1, { error: "label is required" })
});

export const NewSummarySchema = z.object({
  category: z.enum(
    [
      "problem_list",
      "medications",
      "allergies",
      "vaccinations",
      "preferences",
      "lifestyle",
      "family_history",
      "social_situation",
      "care_plan"
    ],
    {
      error:
        "Valid categories are problem_list, medications, allergies, vaccinations preferences, lifestyle, family_history, social_situation, care_plan"
    }
  ),
  data: z.object(),
  episode_id: z.uuid({ error: "label must be a valid uuid format" }).optional()
});

export const NewClinicalEntrySchema = z.object({
  event_type: z.enum(
    [
      "observation",
      "order",
      "procedure",
      "lab_result",
      "radiology",
      "vital_signs",
      "progress_note",
      "note"
    ],
    {
      error:
        "Valid event types are observation, order, procedure, lab_result radiology, vital_signs, progress_note, note"
    }
  ),
  data: z.object(),
  occurred_at: z.coerce.date({
    error: "time of occurrence must be a valid date"
  }),
  episode_id: z.uuid({ error: "episode id is not a valid uuid" }).optional()
});
