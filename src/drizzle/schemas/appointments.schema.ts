import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { practitioners } from "./practitioners.schema";
import { admins } from "./admins.schema";

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => providers.id)
    .notNull(),
  practitionerId: uuid("practitioner_id")
    .references(() => practitioners.id)
    .notNull(),
  scheduledAt: timestamp("scheduled_at"),
  status: text("status", {
    enum: ["scheduled", "checked_in", "completed", "cancelled"]
  }).notNull(),
  checkedInBy: uuid("checked_in_by").references(() => admins.id),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
