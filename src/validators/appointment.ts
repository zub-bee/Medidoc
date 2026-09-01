import * as z from "zod";

export const CreateAppointmentSchema = z.object({
  practitionerId: z.uuid({ message: "practitionerId must be a valid uuid" }),
  scheduledAt: z.iso.datetime({
    message: "scheduledAt must be a valid ISO date"
  }),
  /** Required when a patient books their own appointment — staff derive this from their session instead. */
  organizationId: z
    .uuid({ message: "organizationId must be a valid uuid" })
    .optional()
});

export type CreateAppointmentType = z.infer<typeof CreateAppointmentSchema>;
