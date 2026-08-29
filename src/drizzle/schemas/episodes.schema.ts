import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";

export const episodes = pgTable("episodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => providers.id)
    .notNull(),
  label: text("label"),
  status: text("status", { enum: ["open", "closed"] }).notNull(),
  openedAt: timestamp("opened_at"),
  closedAt: timestamp("closed_at")
});

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
