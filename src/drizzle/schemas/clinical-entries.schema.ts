import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { practitioners } from "./practitioners.schema";
import { providers } from "./providers.schema";
import { episodes } from "./episodes.schema";

export const clinical_entries = pgTable("clinical_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id)
    .notNull(),
  practitionerId: text("practitioner_id")
    .references(() => practitioners.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => providers.id)
    .notNull(),
  episodeId: text("episode_id").references(() => episodes.id),
  eventType: text("event_type", {
    enum: [
      "observation",
      "order",
      "procedure",
      "lab_result",
      "radiology",
      "vital_signs",
      "progress_note",
      "note"
    ]
  }).notNull(),
  data: json("data").notNull(),
  occurredAt: timestamp("occurred_at").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull()
});

export type ClinicalEntry = typeof clinical_entries.$inferSelect;
export type NewClinicalEntry = typeof clinical_entries.$inferInsert;
