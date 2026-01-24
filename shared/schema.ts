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
  vin: text("vin").notNull(), // Chassis Number - رقم الشاصي
  color: text("color").notNull(), // لون السيارة
  imageUrl: text("image_url").notNull(), // الصورة الرئيسية
  images: text("images").array(), // صور إضافية للسيارة
  status: text("status").notNull().default("Purchased"), // Purchased, Reserved, In Transit - حالة السيارة
  price: integer("price"), // السعر (اختياري)
  details: text("details"), // تفاصيل إضافية
  containerNumber: text("container_number"), // رقم الكونتينر
  bookingNumber: text("booking_number"), // رقم الحجز
  trackingUrl: text("tracking_url"), // رابط التتبع
  customUrl: text("custom_url"), // رابط مخصص اختياري
  customUrlReason: text("custom_url_reason"), // سبب إضافة الرابط المخصص
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
