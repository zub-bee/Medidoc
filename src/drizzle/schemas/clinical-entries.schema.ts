import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { practitioners } from "./practitioners.schema";
import { providers } from "./providers.schema";
import { episodes } from "./episodes.schema";

export const clinical_entries = pgTable(
  "clinical_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    practitionerId: uuid("practitioner_id")
      .references(() => practitioners.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => providers.id)
      .notNull(),
    episodeId: uuid("episode_id").references(() => episodes.id),
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
  },
  table => [
    index("clinical_entries_patient_id_idx").on(table.patientId),
    index("clinical_entries_organization_id_idx").on(table.organizationId),
    index("clinical_entries_episode_id_idx").on(table.episodeId)
  ]
);

export type ClinicalEntry = typeof clinical_entries.$inferSelect;
export type NewClinicalEntry = typeof clinical_entries.$inferInsert;
