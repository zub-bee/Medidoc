import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const verification_codes = pgTable("verification_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  actorType: text("actor_type", {
    enum: ["patient", "provider", "practitioner", "platform"]
  }),
  actorId: text("actor_id"),
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
