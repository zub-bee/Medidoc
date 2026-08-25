import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const platforms = pgTable("platforms", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type PlatformAdmin = typeof platforms.$inferSelect;
export type NewPlatformAdmin = typeof platforms.$inferInsert;
