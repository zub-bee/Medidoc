import {
  pgTable,
  text,
  timestamp,
  integer,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { episodes } from "./episodes.schema";

export const patient_summaries = pgTable(
  "patient_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    episodeId: uuid("episode_id").references(() => episodes.id),
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
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  },
  table => [index("patient_summaries_patient_id_idx").on(table.patientId)]
);

export type PatientSummary = typeof patient_summaries.$inferSelect;
export type NewPatientSummary = typeof patient_summaries.$inferInsert;
