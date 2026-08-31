import * as z from "zod";

export const CreateConsentFormSchema = z.object({
  procedureName: z.string().trim().min(1, {
    message: "procedureName is required"
  })
});

export type CreateConsentFormType = z.infer<typeof CreateConsentFormSchema>;
