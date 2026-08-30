import {
  pgTable,
  text,
  timestamp,
  date,
  varchar,
  uuid
} from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
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
