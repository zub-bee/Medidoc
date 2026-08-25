import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const providers = pgTable("providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  cacNumber: varchar("cac_number").notNull().unique(),
  status: text("status", {
    enum: ["pending", "verified", "suspended"]
  }).notNull(),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type ProviderOrganization = typeof providers.$inferSelect;
export type NewProviderOrganization = typeof providers.$inferInsert;
