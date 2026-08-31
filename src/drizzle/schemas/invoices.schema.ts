import {
  pgTable,
  text,
  timestamp,
  decimal,
  uuid,
  index,
  check
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { appointments } from "./appointments.schema";
import { admins } from "./admins.schema";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => providers.id)
      .notNull(),
    appointmentId: uuid("appointment_id").references(() => appointments.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: text("status", { enum: ["pending", "paid", "overdue"] }).notNull(),
    insuranceProvider: text("insurance_provider"),
    insurancePolicyNumber: text("insurance_policy_number"),
    serviceCode: text("service_code"),
    createdBy: uuid("created_by").references(() => admins.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [
    index("invoices_patient_id_idx").on(table.patientId),
    index("invoices_organization_id_idx").on(table.organizationId),
    check("invoices_amount_non_negative", sql`${table.amount} >= 0`)
  ]
);

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
