import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";

export const episodes = pgTable("episodes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => providers.id)
    .notNull(),
  label: text("label"),
  status: text("status", { enum: ["open", "closed"] }).notNull(),
  openedAt: timestamp("opened_at"),
  closedAt: timestamp("closed_at")
});

export type Episode = typeof episodes.$inferSelect;
export type NewEpisode = typeof episodes.$inferInsert;
