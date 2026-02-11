import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull(),
  color: text("color").notNull(),
  imageUrl: text("image_url").notNull(),
  images: text("images").array(),
  status: text("status").notNull().default("Purchased"),
  price: integer("price"),
  details: text("details"),
  containerNumber: text("container_number"),
  bookingNumber: text("booking_number"),
  trackingUrl: text("tracking_url"),
  customUrl: text("custom_url"),
  customUrlReason: text("custom_url_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: text("seller_id").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  price: integer("price"),
  color: text("color"),
  condition: text("condition").default("used"),
  mileage: integer("mileage"),
  bodyType: text("body_type"),
  transmission: text("transmission"),
  fuelType: text("fuel_type"),
  engineSize: text("engine_size"),
  location: text("location"),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  images: text("images").array(),
  contactPhone: text("contact_phone"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const carsRelations = relations(cars, ({ one }) => ({
  owner: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
  favorites: many(favorites),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  listings: many(listings),
  favorites: many(favorites),
}));

// === BASE SCHEMAS ===
export const insertCarSchema = createInsertSchema(cars).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type CreateCarRequest = InsertCar;
export type UpdateCarRequest = Partial<InsertCar>;
export type CreateListingRequest = InsertListing;
export type UpdateListingRequest = Partial<InsertListing>;

export type CarResponse = Car;
export type CarsListResponse = Car[];
export type ListingResponse = Listing;
export type ListingsListResponse = Listing[];
