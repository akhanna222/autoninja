import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with custom auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Car Alerts table - stores user preferences for car notifications
export const carAlerts = pgTable("car_alerts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  make: varchar("make"),
  model: varchar("model"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  minYear: integer("min_year"),
  maxYear: integer("max_year"),
  fuelType: varchar("fuel_type"),
  transmission: varchar("transmission"),
  maxMileage: integer("max_mileage"),
  location: varchar("location"),
  notifyViaWhatsApp: boolean("notify_via_whatsapp").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCarAlertSchema = createInsertSchema(carAlerts, {
  notifyViaWhatsApp: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCarAlert = z.infer<typeof insertCarAlertSchema>;
export type CarAlert = typeof carAlerts.$inferSelect;

// Cars table - the actual car listings
export const cars = pgTable("cars", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  location: varchar("location").notNull(),
  fuelType: varchar("fuel_type").notNull(),
  transmission: varchar("transmission").notNull(),
  imageUrl: text("image_url"),
  verificationScore: integer("verification_score").default(0),
  logbookVerified: boolean("logbook_verified").default(false),
  mileageVerified: boolean("mileage_verified").default(false),
  photosVerified: boolean("photos_verified").default(false),
  priceGood: boolean("price_good").default(false),
  owners: integer("owners").default(1),
  accidents: boolean("accidents").default(false),
  finance: boolean("finance").default(false),
  serviceHistory: varchar("service_history").default("None"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars, {
  logbookVerified: z.boolean().optional(),
  mileageVerified: z.boolean().optional(),
  photosVerified: z.boolean().optional(),
  priceGood: z.boolean().optional(),
  accidents: z.boolean().optional(),
  finance: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;
