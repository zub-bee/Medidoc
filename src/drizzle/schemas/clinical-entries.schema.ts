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
  patientId: text("patient_id").references(() => patients.id),
  practitionerId: text("practitioner_id").references(() => practitioners.id),
  organizationId: text("organization_id").references(() => providers.id),
  episodeId: text("episode_id").references(() => episodes.id),
  eventType: text("event_type", {
    enum: ["observation", "order", "procedure", "lab_result", "note"]
  }),
  data: json("data"),
  occurredAt: timestamp("occurred_at"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull()
});

export type ClinicalEntry = typeof clinical_entries.$inferSelect;
export type NewClinicalEntry = typeof clinical_entries.$inferInsert;
