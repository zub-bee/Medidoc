import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { patients } from "./patients.schema";
import { providers } from "./providers.schema";

export const organization_access = pgTable(
  "organization_access",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .references(() => patients.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => providers.id)
      .notNull(),
    status: text("status", { enum: ["active", "revoked"] }).notNull(),
    grantedAt: timestamp("granted_at"),
    revokedAt: timestamp("revoked_at")
  },
  table => [
    index("organization_access_patient_id_idx").on(table.patientId),
    index("organization_access_organization_id_idx").on(table.organizationId)
  ]
);

export type OrganizationAccess = typeof organization_access.$inferSelect;
export type NewOrganizationAccess = typeof organization_access.$inferInsert;
