import {
  pgTable,
  text,
  timestamp,
  decimal,
  uuid,
  check
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { invoices } from "./invoices.schema";
import { admins } from "./admins.schema";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id").references(() => invoices.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: text("method", { enum: ["cash", "card", "transfer", "insurance"] })
      .notNull()
      .default("transfer"),
    recordedBy: uuid("recorded_by")
      .references(() => admins.id)
      .notNull(),
    paidAt: timestamp("paid_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [check("payments_amount_non_negative", sql`${table.amount} >= 0`)]
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
