import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorType: text("actor_type", {
    enum: ["patient", "practitioner", "platform", "admin", "provider"]
  }).notNull(),
  actorId: uuid("actor_id").notNull(),
  action: text("action", {
    enum: ["grant_access", "revoke_access", "create", "update", "view"]
  }).notNull(),
  targetTable: text("target_table"),
  targetId: uuid("target_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type AuditLog = typeof audit_logs.$inferSelect;
export type NewAuditLog = typeof audit_logs.$inferInsert;
