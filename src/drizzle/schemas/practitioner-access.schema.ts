import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { practitioners } from "./practitioners.schema";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { admins } from "./admins.schema";

export const practitioner_access = pgTable(
  "practitioner_access",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practitionerId: uuid("practitioner_id")
      .references(() => practitioners.id)
      .notNull(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    grantedBy: uuid("granted_by")
      .references(() => admins.id)
      .notNull(),
    status: text("status", { enum: ["active", "revoked"] }).notNull(),
    grantedAt: timestamp("granted_at"),
    revokedAt: timestamp("revoked_at")
  },
  table => [
    index("practitioner_access_patient_id_idx").on(table.patientId),
    index("practitioner_access_practitioner_id_idx").on(table.practitionerId)
  ]
);

export type PractitionerAccess = typeof practitioner_access.$inferSelect;
export type NewPractitionerAccess = typeof practitioner_access.$inferInsert;
