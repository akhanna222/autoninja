import {
  users,
  carAlerts,
  cars,
  carImages,
  carDocuments,
  buyerChatSessions,
  buyerChatMessages,
  type User,
  type InsertUser,
  type CarAlert,
  type InsertCarAlert,
  type Car,
  type InsertCar,
  type CarImage,
  type InsertCarImage,
  type CarDocument,
  type InsertCarDocument,
  type BuyerChatSession,
  type InsertBuyerChatSession,
  type BuyerChatMessage,
  type InsertBuyerChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
    bodyType?: string;
    color?: string;
  }): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  getUserCars(userId: string): Promise<Car[]>;
  updateCar(id: number, userId: string, data: Partial<InsertCar>): Promise<Car>;
  deleteCar(id: number, userId: string): Promise<void>;

  // Car Image operations
  addCarImage(image: InsertCarImage): Promise<CarImage>;
  getCarImages(carId: number): Promise<CarImage[]>;
  deleteCarImage(id: number, carId: number): Promise<void>;
  setPrimaryImage(id: number, carId: number): Promise<void>;

  // Car Document operations
  addCarDocument(doc: InsertCarDocument): Promise<CarDocument>;
  getCarDocuments(carId: number): Promise<CarDocument[]>;
  deleteCarDocument(id: number, userId: string): Promise<void>;

  // Buyer Chat operations
  createChatSession(session: InsertBuyerChatSession): Promise<BuyerChatSession>;
  getChatSession(id: number): Promise<BuyerChatSession | undefined>;
  updateChatFilters(sessionId: number, filters: Record<string, any>): Promise<BuyerChatSession>;
  addChatMessage(message: InsertBuyerChatMessage): Promise<BuyerChatMessage>;
  getChatMessages(sessionId: number): Promise<BuyerChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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
    bodyType?: string;
    color?: string;
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
    if (filters.bodyType) conditions.push(eq(cars.bodyType, filters.bodyType));
    if (filters.color) conditions.push(eq(cars.color, filters.color));

    if (conditions.length === 0) {
      return await db.select().from(cars);
    }

    return await db.select().from(cars).where(and(...conditions));
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async getUserCars(userId: string): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.sellerId, userId));
  }

  async updateCar(id: number, userId: string, data: Partial<InsertCar>): Promise<Car> {
    const [car] = await db
      .update(cars)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(cars.id, id), eq(cars.sellerId, userId)))
      .returning();
    return car;
  }

  async deleteCar(id: number, userId: string): Promise<void> {
    await db.delete(cars).where(and(eq(cars.id, id), eq(cars.sellerId, userId)));
  }

  // Car Image operations
  async addCarImage(image: InsertCarImage): Promise<CarImage> {
    const [newImage] = await db.insert(carImages).values(image).returning();
    return newImage;
  }

  async getCarImages(carId: number): Promise<CarImage[]> {
    return await db.select().from(carImages).where(eq(carImages.carId, carId));
  }

  async deleteCarImage(id: number, carId: number): Promise<void> {
    await db.delete(carImages).where(
      and(eq(carImages.id, id), eq(carImages.carId, carId))
    );
  }

  async setPrimaryImage(id: number, carId: number): Promise<void> {
    // First, unset all primary images for this car
    await db.update(carImages).set({ isPrimary: false }).where(eq(carImages.carId, carId));
    // Then set the new primary
    await db.update(carImages).set({ isPrimary: true }).where(eq(carImages.id, id));
  }

  // Car Document operations
  async addCarDocument(doc: InsertCarDocument): Promise<CarDocument> {
    const [newDoc] = await db.insert(carDocuments).values(doc).returning();
    return newDoc;
  }

  async getCarDocuments(carId: number): Promise<CarDocument[]> {
    return await db.select().from(carDocuments).where(eq(carDocuments.carId, carId));
  }

  async deleteCarDocument(id: number, userId: string): Promise<void> {
    await db.delete(carDocuments).where(
      and(eq(carDocuments.id, id), eq(carDocuments.userId, userId))
    );
  }

  // Buyer Chat operations
  async createChatSession(session: InsertBuyerChatSession): Promise<BuyerChatSession> {
    const [newSession] = await db.insert(buyerChatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(id: number): Promise<BuyerChatSession | undefined> {
    const [session] = await db.select().from(buyerChatSessions).where(eq(buyerChatSessions.id, id));
    return session;
  }

  async updateChatFilters(sessionId: number, filters: Record<string, any>): Promise<BuyerChatSession> {
    const [session] = await db
      .update(buyerChatSessions)
      .set({ activeFilters: filters, updatedAt: new Date() })
      .where(eq(buyerChatSessions.id, sessionId))
      .returning();
    return session;
  }

  async addChatMessage(message: InsertBuyerChatMessage): Promise<BuyerChatMessage> {
    const [newMessage] = await db.insert(buyerChatMessages).values(message).returning();
    return newMessage;
  }

  async getChatMessages(sessionId: number): Promise<BuyerChatMessage[]> {
    return await db
      .select()
      .from(buyerChatMessages)
      .where(eq(buyerChatMessages.sessionId, sessionId))
      .orderBy(buyerChatMessages.createdAt);
  }

  // Stripe data queries (from stripe schema)
  async getStripeProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listStripeProducts(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active}`
    );
    return result.rows;
  }

  async listStripeProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getStripePrice(priceId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }

  async getStripePricesForProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE product = ${productId} AND active = true`
    );
    return result.rows;
  }

  async getStripeSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  // Update user Stripe info
  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }) {
    const [user] = await db.update(users).set({
      ...stripeInfo,
      updatedAt: new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
