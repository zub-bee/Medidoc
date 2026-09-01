import { and, desc, eq } from "drizzle-orm";
import db from "../configs/db";
import { invoices } from "../drizzle/schemas/invoices.schema";
import { ApiError } from "../utils/api-error";
import { CreateInvoiceType } from "../validators/invoice";

export class InvoiceService {
  static async listByPatient(patientId: string) {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.patientId, patientId))
      .orderBy(desc(invoices.createdAt));
  }

  static async listByOrganization(organizationId: string) {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.organizationId, organizationId))
      .orderBy(desc(invoices.createdAt));
  }

  static async create(
    patientId: string,
    organizationId: string,
    createdBy: string,
    {
      appointmentId,
      amount,
      insuranceProvider,
      insurancePolicyNumber,
      serviceCode
    }: CreateInvoiceType
  ) {
    const [invoice] = await db
      .insert(invoices)
      .values({
        patientId,
        organizationId,
        appointmentId,
        amount: amount.toFixed(2),
        status: "pending",
        insuranceProvider,
        insurancePolicyNumber,
        serviceCode,
        createdBy
      })
      .returning();

    return invoice;
  }

  static async markPaid(patientId: string, invoiceId: string) {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.patientId, patientId)))
      .limit(1);

    if (!invoice) {
      throw ApiError.notFound("Invoice not found for this patient");
    }

    if (invoice.status === "paid") {
      return invoice;
    }

    const [paidInvoice] = await db
      .update(invoices)
      .set({ status: "paid" })
      .where(eq(invoices.id, invoiceId))
      .returning();

    return paidInvoice;
  }
}
