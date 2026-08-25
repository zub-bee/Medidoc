import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";

export const organization_access = pgTable("organization_access", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => providers.id)
    .notNull(),
  status: text("status", { enum: ["active", "revoked"] }).notNull(),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at")
});

export type OrganizationAccess = typeof organization_access.$inferSelect;
export type NewOrganizationAccess = typeof organization_access.$inferInsert;
