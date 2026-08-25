import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const refresh_tokens = pgTable("refresh_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  role: text("role", {
    enum: ["patient", "provider", "practitioner", "platform", "admin"]
  }),
  actorId: text("actor_id"),
  tokenHash: text("token_hash").unique(),
  status: text("status", { enum: ["active", "revoked"] }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  revokedAt: timestamp("revoked_at")
});

export type RefreshToken = typeof refresh_tokens.$inferSelect;
export type NewRefreshToken = typeof refresh_tokens.$inferInsert;
