import {
  users,
  carAlerts,
  cars,
  type User,
  type UpsertUser,
  type CarAlert,
  type InsertCarAlert,
  type Car,
  type InsertCar,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPhone(userId: string, phoneNumber: string): Promise<User>;
  
  // Car Alert operations
  createCarAlert(alert: InsertCarAlert): Promise<CarAlert>;
  getUserAlerts(userId: string): Promise<CarAlert[]>;
  deleteCarAlert(id: number, userId: string): Promise<void>;
  toggleAlertStatus(id: number, userId: string, isActive: boolean): Promise<CarAlert>;
  getActiveAlerts(): Promise<CarAlert[]>;
  
  // Car operations
  createCar(car: InsertCar): Promise<Car>;
  getCars(filters?: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    maxMileage?: number;
    location?: string;
  }): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPhone(userId: string, phoneNumber: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ phoneNumber, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Car Alert operations
  async createCarAlert(alert: InsertCarAlert): Promise<CarAlert> {
    const [newAlert] = await db.insert(carAlerts).values(alert).returning();
    return newAlert;
  }

  async getUserAlerts(userId: string): Promise<CarAlert[]> {
    return await db.select().from(carAlerts).where(eq(carAlerts.userId, userId));
  }

  async deleteCarAlert(id: number, userId: string): Promise<void> {
    await db.delete(carAlerts).where(
      and(eq(carAlerts.id, id), eq(carAlerts.userId, userId))
    );
  }

  async toggleAlertStatus(id: number, userId: string, isActive: boolean): Promise<CarAlert> {
    const [alert] = await db
      .update(carAlerts)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(carAlerts.id, id), eq(carAlerts.userId, userId)))
      .returning();
    return alert;
  }

  async getActiveAlerts(): Promise<CarAlert[]> {
    return await db.select().from(carAlerts).where(eq(carAlerts.isActive, true));
  }

  // Car operations
  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async getCars(filters?: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    maxMileage?: number;
    location?: string;
  }): Promise<Car[]> {
    if (!filters) {
      return await db.select().from(cars);
    }

    const conditions = [];
    
    if (filters.make) conditions.push(eq(cars.make, filters.make));
    if (filters.model) conditions.push(eq(cars.model, filters.model));
    if (filters.minPrice) conditions.push(gte(cars.price, filters.minPrice));
    if (filters.maxPrice) conditions.push(lte(cars.price, filters.maxPrice));
    if (filters.minYear) conditions.push(gte(cars.year, filters.minYear));
    if (filters.maxYear) conditions.push(lte(cars.year, filters.maxYear));
    if (filters.fuelType) conditions.push(eq(cars.fuelType, filters.fuelType));
    if (filters.transmission) conditions.push(eq(cars.transmission, filters.transmission));
    if (filters.maxMileage) conditions.push(lte(cars.mileage, filters.maxMileage));
    if (filters.location) conditions.push(eq(cars.location, filters.location));

    return await db.select().from(cars).where(and(...conditions));
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }
}

export const storage = new DatabaseStorage();
