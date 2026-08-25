import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const audit_logs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  actorType: text("actor_type", {
    enum: ["patient", "practitioner", "platform", "admin", "provider"]
  }),
  actorId: text("actor_id"),
  action: text("action", {
    enum: ["grant_access", "revoke_access", "create", "update", "view"]
  }),
  targetTable: text("target_table"),
  targetId: text("target_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;
