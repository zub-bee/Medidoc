import { and, desc, eq } from "drizzle-orm";
import db from "../configs/db";
import { payments } from "../drizzle/schemas/payments.schema";
import { invoices } from "../drizzle/schemas/invoices.schema";
import { ApiError } from "../utils/api-error";
import { CreatePaymentType } from "../validators/payment";

export class PaymentService {
  static async assertInvoiceBelongsToPatient(
    patientId: string,
    invoiceId: string
  ) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.patientId, patientId)))
      .limit(1);

    if (!invoice) {
      throw ApiError.notFound("Invoice not found for this patient");
    }

    return invoice;
  }

  static async listByInvoice(patientId: string, invoiceId: string) {
    await PaymentService.assertInvoiceBelongsToPatient(patientId, invoiceId);

    return db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paidAt));
  }

  static async create(
    patientId: string,
    invoiceId: string,
    recordedBy: string | null,
    { amount, method, paidAt }: CreatePaymentType
  ) {
    const invoice = await PaymentService.assertInvoiceBelongsToPatient(
      patientId,
      invoiceId
    );

    const [payment] = await db
      .insert(payments)
      .values({
        invoiceId,
        amount: amount.toFixed(2),
        method,
        recordedBy: recordedBy ?? undefined,
        paidAt: paidAt ? new Date(paidAt) : new Date()
      })
      .returning();

    // A patient paying for themselves (no staff recordedBy) settles the
    // invoice immediately; staff-recorded payments may be partial, so those
    // still go through the explicit mark-paid action.
    if (!recordedBy && Number(amount) >= Number(invoice.amount)) {
      await db
        .update(invoices)
        .set({ status: "paid" })
        .where(eq(invoices.id, invoiceId));
    }

    return payment;
  }
}
