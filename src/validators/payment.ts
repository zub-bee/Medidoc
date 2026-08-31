import * as z from "zod";

export const CreatePaymentSchema = z.object({
  amount: z
    .number({ error: "amount must be a number" })
    .positive({ message: "amount must be greater than 0" }),
  method: z.enum(["cash", "card", "transfer", "insurance"]).optional(),
  paidAt: z.iso
    .datetime({ message: "paidAt must be a valid ISO date" })
    .optional()
});

export type CreatePaymentType = z.infer<typeof CreatePaymentSchema>;
