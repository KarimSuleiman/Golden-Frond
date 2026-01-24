import { db } from "./db";
import {
  cars,
  users,
  type Car,
  type InsertCar,
  type UpdateCarRequest,
  type User
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Car operations
  getCars(userId: string): Promise<Car[]>;
  getAllCars(): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, updates: UpdateCarRequest): Promise<Car>;
  deleteCar(id: number): Promise<void>;
  // User operations (admin)
  getAllUsers(): Promise<User[]>;
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
}

export const storage = new DatabaseStorage();
