import { pgTable, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .unique(),
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
