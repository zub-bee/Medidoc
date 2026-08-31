import * as z from "zod";

export const CreateInvoiceSchema = z.object({
  appointmentId: z.uuid().optional(),
  amount: z
    .number({ error: "amount must be a number" })
    .positive({ message: "amount must be greater than 0" }),
  insuranceProvider: z.string().trim().min(1).optional(),
  insurancePolicyNumber: z.string().trim().min(1).optional(),
  serviceCode: z.string().trim().min(1).optional()
});

export type CreateInvoiceType = z.infer<typeof CreateInvoiceSchema>;
