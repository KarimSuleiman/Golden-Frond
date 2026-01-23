import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Links to auth users
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull(), // Chassis Number
  color: text("color").notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("Purchased"), // Purchased, Reserved, In Transit
  price: integer("price"), // Optional, maybe they want to see the value
  details: text("details"), // Extra notes
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const carsRelations = relations(cars, ({ one }) => ({
  owner: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
}));

// === BASE SCHEMAS ===
export const insertCarSchema = createInsertSchema(cars).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

// Request types
export type CreateCarRequest = InsertCar;
export type UpdateCarRequest = Partial<InsertCar>;

// Response types
export type CarResponse = Car;
export type CarsListResponse = Car[];
