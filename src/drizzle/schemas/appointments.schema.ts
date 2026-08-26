import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { practitioners } from "./practitioners.schema";
import { admins } from "./admins.schema";

export const appointments = pgTable("appointments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => providers.id)
    .notNull(),
  practitionerId: text("practitioner_id")
    .references(() => practitioners.id)
    .notNull(),
  scheduledAt: timestamp("scheduled_at"),
  status: text("status", {
    enum: ["scheduled", "checked_in", "completed", "cancelled"]
  }).notNull(),
  checkedInBy: text("checked_in_by").references(() => admins.id),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
