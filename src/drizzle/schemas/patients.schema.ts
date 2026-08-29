import {
  pgTable,
  text,
  timestamp,
  date,
  varchar,
  uuid
} from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("name").notNull(),
  email: text("email").unique().notNull(),
  dob: date("dob").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender", { enum: ["female", "male"] }).notNull(),
  address: text("address"),
  nin: varchar("nin", { length: 11 }).unique().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
