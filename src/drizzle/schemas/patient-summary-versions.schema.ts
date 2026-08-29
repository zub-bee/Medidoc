import { pgTable, timestamp, integer, json, uuid } from "drizzle-orm/pg-core";
import { patient_summaries } from "./patient-summaries.schema";

export const patient_summary_versions = pgTable("patient_summary_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  summaryId: uuid("summary_id")
    .references(() => patient_summaries.id)
    .notNull(),
  versionNo: integer("version_no").notNull(),
  data: json("data").notNull(),
  changedBy: uuid("changed_by"),
  changedAt: timestamp("changed_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type PatientSummaryVersion =
  typeof patient_summary_versions.$inferSelect;
export type NewPatientSummaryVersion =
  typeof patient_summary_versions.$inferInsert;
