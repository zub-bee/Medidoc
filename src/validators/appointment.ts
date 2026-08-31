import * as z from "zod";

export const CreateAppointmentSchema = z.object({
  practitionerId: z.uuid({ message: "practitionerId must be a valid uuid" }),
  scheduledAt: z.iso.datetime({
    message: "scheduledAt must be a valid ISO date"
  })
});

export type CreateAppointmentType = z.infer<typeof CreateAppointmentSchema>;
