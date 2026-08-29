import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const refresh_tokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role", {
    enum: ["patient", "provider", "practitioner", "platform", "admin"]
  }),
  actorId: uuid("actor_id").notNull(),
  tokenHash: text("token_hash").unique().notNull(),
  status: text("status", { enum: ["active", "revoked"] }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  revokedAt: timestamp("revoked_at")
});

export type RefreshToken = typeof refresh_tokens.$inferSelect;
export type NewRefreshToken = typeof refresh_tokens.$inferInsert;
