import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { providers } from "./providers.schema";
import { admins } from "./admins.schema";

export const practitioners = pgTable("practitioners", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text("organization_id").references(() => providers.id),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),
  approvedBy: text("approved_by").references(() => providers.id),
  status: text("status", { enum: ["pending", "active", "revoked"] }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Practitioner = typeof practitioners.$inferSelect;
export type NewPractitioner = typeof practitioners.$inferInsert;
