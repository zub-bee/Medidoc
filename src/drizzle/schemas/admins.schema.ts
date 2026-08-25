import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { providers } from "./providers.schema";

export const admins = pgTable("admins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id")
    .references(() => providers.id, {
      onDelete: "cascade"
    })
    .notNull(),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status")
    .references(() => providers.status, {
      onDelete: "cascade"
    })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
