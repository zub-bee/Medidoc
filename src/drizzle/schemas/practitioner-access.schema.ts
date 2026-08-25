import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { practitioners } from "./practitioners.schema";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";

export const practitioner_access = pgTable("practitioner_access", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  practitionerId: text("practitioner_id").references(() => practitioners.id),
  patientId: text("patient_id").references(() => patients.id),
  grantedBy: text("granted_by").references(() => providers.id),
  status: text("status", { enum: ["active", "revoked"] }),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at")
});

export type PractitionerAccess = typeof practitioner_access.$inferSelect;
export type NewPractitionerAccess = typeof practitioner_access.$inferInsert;
