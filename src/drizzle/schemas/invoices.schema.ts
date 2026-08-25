import { pgTable, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { appointments } from "./appointments.schema";

export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id").references(() => patients.id),
  organizationId: text("organization_id").references(() => providers.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: text("status", { enum: ["pending", "paid", "overdue"] }),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  serviceCode: text("service_code"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
