import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { practitioners } from "./practitioners.schema";

export const consent_forms = pgTable("consent_forms", {
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
  procedureName: text("procedure_name").notNull(),
  document: json("document").notNull(), // { public_id: string, url: string, size: number }
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type ConsentForm = typeof consent_forms.$inferSelect;
export type NewConsentForm = typeof consent_forms.$inferInsert;
