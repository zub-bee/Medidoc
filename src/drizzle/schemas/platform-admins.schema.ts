import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const platforms = pgTable("platforms", {
  id: uuid("id").primaryKey().defaultRandom(),
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
