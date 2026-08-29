import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";

export const practitioners = pgTable("practitioners", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => providers.id)
    .notNull(),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),
  approvedBy: uuid("approved_by")
    .references(() => providers.id)
    .notNull(),
  status: text("status", { enum: ["pending", "active", "revoked"] }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Practitioner = typeof practitioners.$inferSelect;
export type NewPractitioner = typeof practitioners.$inferInsert;
