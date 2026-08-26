import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { episodes } from "./episodes.schema";

export const patient_summaries = pgTable("patient_summaries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id)
    .notNull(),
  episodeId: text("episode_id").references(() => episodes.id),
  category: text("category", {
    enum: [
      "problem_list",
      "medications",
      "allergies",
      "vaccinations",
      "preferences",
      "lifestyle",
      "family_history",
      "social_situation",
      "care_plan"
    ]
  }).notNull(),
  data: json("data").notNull(),
  versionNo: integer("version_no"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type PatientSummary = typeof patient_summaries.$inferSelect;
export type NewPatientSummary = typeof patient_summaries.$inferInsert;
