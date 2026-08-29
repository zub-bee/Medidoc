import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => providers.id, {
      onDelete: "cascade"
    })
    .notNull(),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status", {
    enum: ["pending", "verified", "suspended"]
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
