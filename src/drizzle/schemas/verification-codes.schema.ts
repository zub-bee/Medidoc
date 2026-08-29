import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const verification_codes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role", {
    enum: ["patient", "provider", "practitioner", "platform", "admin"]
  }),
  actorId: uuid("actor_id"),
  codeHash: text("code_hash"),
  purpose: text("purpose"),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type VerificationCode = typeof verification_codes.$inferSelect;
export type NewVerificationCode = typeof verification_codes.$inferInsert;
