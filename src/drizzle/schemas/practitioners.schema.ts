import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { providers } from "./providers.schema";
import { users } from "./user.schema";

export const practitioners = pgTable("practitioners", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  organizationId: uuid("organization_id")
    .references(() => providers.id)
    .notNull(),
  fullName: text("name").notNull(),
  email: text("email").notNull().unique(),
  //just noticed a bug here, can't fix it yet. trying to round off the others first. what approved by references here is the provider id which in this case is the org. but it shoudl reference the admin that approved
  approvedBy: uuid("approved_by")
    .references(() => providers.id)
    .notNull(),
  status: text("status", { enum: ["pending", "active", "revoked"] }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type Practitioner = typeof practitioners.$inferSelect;
export type NewPractitioner = typeof practitioners.$inferInsert;
