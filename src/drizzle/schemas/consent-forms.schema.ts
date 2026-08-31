import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";
import { practitioners } from "./practitioners.schema";

export const consent_forms = pgTable(
  "consent_forms",
  {
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
    procedureName: text("procedure_name").notNull(),
    document: json("document").notNull(),
    signedAt: timestamp("signed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [
    index("consent_forms_patient_id_idx").on(table.patientId),
    index("consent_forms_organization_id_idx").on(table.organizationId)
  ]
);

export type ConsentForm = typeof consent_forms.$inferSelect;
export type NewConsentForm = typeof consent_forms.$inferInsert;
