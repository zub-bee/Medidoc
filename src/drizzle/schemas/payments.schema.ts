import { pgTable, text, timestamp, decimal } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { invoices } from "./invoices.schema";

export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  invoiceId: text("invoice_id").references(() => invoices.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method", { enum: ["cash", "card", "transfer", "insurance"] })
    .notNull()
    .default("transfer"),
  recordedBy: text("recorded_by").notNull(),
  paidAt: timestamp("paid_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
