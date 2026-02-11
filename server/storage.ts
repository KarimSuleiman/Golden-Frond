import { db } from "./db";
import {
  cars,
  users,
  listings,
  favorites,
  type Car,
  type InsertCar,
  type UpdateCarRequest,
  type User,
  type Listing,
  type InsertListing,
  type UpdateListingRequest,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  getCars(userId: string): Promise<Car[]>;
  getAllCars(): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, updates: UpdateCarRequest): Promise<Car>;
  deleteCar(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getListings(): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  getUserListings(userId: string): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, updates: UpdateListingRequest): Promise<Listing>;
  deleteListing(id: number): Promise<void>;
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, listingId: number): Promise<Favorite>;
  removeFavorite(userId: string, listingId: number): Promise<void>;
  isFavorited(userId: string, listingId: number): Promise<boolean>;
  deleteUser(userId: string): Promise<void>;
  getFavoritesCountByUser(userId: string): Promise<number>;
  updateLastActive(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCars(userId: string): Promise<Car[]> {
    return await db.select()
      .from(cars)
      .where(eq(cars.userId, userId))
      .orderBy(desc(cars.createdAt));
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const [car] = await db.insert(cars).values(insertCar).returning();
    return car;
  }

  async updateCar(id: number, updates: UpdateCarRequest): Promise<Car> {
    const [updated] = await db.update(cars)
      .set(updates)
      .where(eq(cars.id, id))
      .returning();
    return updated;
  }

  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  async getAllCars(): Promise<Car[]> {
    return await db.select()
      .from(cars)
      .orderBy(desc(cars.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getListings(): Promise<Listing[]> {
    return await db.select()
      .from(listings)
      .where(eq(listings.status, "active"))
      .orderBy(desc(listings.createdAt));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    return await db.select()
      .from(listings)
      .where(eq(listings.sellerId, userId))
      .orderBy(desc(listings.createdAt));
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db.insert(listings).values(insertListing).returning();
    return listing;
  }

  async updateListing(id: number, updates: UpdateListingRequest): Promise<Listing> {
    const [updated] = await db.update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return updated;
  }

  async deleteListing(id: number): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(userId: string, listingId: number): Promise<Favorite> {
    const [fav] = await db.insert(favorites)
      .values({ userId, listingId })
      .returning();
    return fav;
  }

  async removeFavorite(userId: string, listingId: number): Promise<void> {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
  }

  async isFavorited(userId: string, listingId: number): Promise<boolean> {
    const [fav] = await db.select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!fav;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.userId, userId));
    const userListings = await db.select({ id: listings.id })
      .from(listings)
      .where(eq(listings.sellerId, userId));
    for (const listing of userListings) {
      await db.delete(favorites).where(eq(favorites.listingId, listing.id));
    }
    await db.delete(listings).where(eq(listings.sellerId, userId));
    await db.delete(cars).where(eq(cars.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }

  async getFavoritesCountByUser(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    return result?.count ?? 0;
  }

  async updateLastActive(userId: string): Promise<void> {
    await db.update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
