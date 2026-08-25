import { pgTable, text, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const patients = pgTable("patients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  fullName: text("name").notNull(),
  email: text("email").unique().notNull(),
  dob: date("dob"),
  phone: text("phone"),
  gender: text("gender", { enum: ["female", "male"] }),
  address: text("address"),
  nin: varchar("nin", { length: 11 }).unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
