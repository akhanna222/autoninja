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
  county: varchar("county"),
  emailVerified: boolean("email_verified").default(false),
  displayPhoneInAd: boolean("display_phone_in_ad").default(false),
  allowEmailContact: boolean("allow_email_contact").default(true),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
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

// Email verification codes
export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").notNull(),
  code: varchar("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailVerificationCodeSchema = createInsertSchema(emailVerificationCodes).omit({ id: true });
export type InsertEmailVerificationCode = z.infer<typeof insertEmailVerificationCodeSchema>;
export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;

// Seller memberships (annual subscription)
export const sellerMemberships = pgTable("seller_memberships", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  status: varchar("status").default("pending"), // 'pending', 'active', 'cancelled', 'expired'
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSellerMembershipSchema = createInsertSchema(sellerMemberships).omit({ id: true });
export type InsertSellerMembership = z.infer<typeof insertSellerMembershipSchema>;
export type SellerMembership = typeof sellerMemberships.$inferSelect;

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

export const insertCarAlertSchema = createInsertSchema(carAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCarAlert = z.infer<typeof insertCarAlertSchema>;
export type CarAlert = typeof carAlerts.$inferSelect;

// Cars table - the actual car listings
export const cars = pgTable("cars", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sellerId: varchar("seller_id").references(() => users.id, { onDelete: 'cascade' }),
  vehicleType: varchar("vehicle_type").default("Car"), // 'Car', 'Van', 'Bike', 'Truck'
  registration: varchar("registration"),
  make: varchar("make").notNull(),
  model: varchar("model").notNull(),
  derivative: varchar("derivative"), // e.g. "520d SE 5C12 4DR AUTO"
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  mileageUnit: varchar("mileage_unit").default("km"), // 'km', 'miles'
  location: varchar("location").notNull(),
  county: varchar("county"),
  fuelType: varchar("fuel_type").notNull(),
  transmission: varchar("transmission").notNull(),
  engineSize: varchar("engine_size"), // e.g. "2.0"
  title: varchar("title"),
  description: text("description"),
  bodyType: varchar("body_type"),
  color: varchar("color"),
  condition: varchar("condition"),
  numberOfDoors: integer("number_of_doors"),
  numberOfSeats: integer("number_of_seats"),
  nctExpiry: varchar("nct_expiry"), // Month/Year e.g. "12/2025"
  nctExpired: boolean("nct_expired").default(false),
  taxBand: varchar("tax_band"), // e.g. "€200 (Band A4)"
  features: text("features").array(), // Array of feature strings
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
  status: varchar("status").default("draft"), // 'draft', 'pending_payment', 'active', 'sold', 'expired'
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;

// Car Images table - multiple images per car
export const carImages = pgTable("car_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  carId: integer("car_id").notNull().references(() => cars.id, { onDelete: 'cascade' }),
  imageUrl: text("image_url").notNull(),
  isPrimary: boolean("is_primary").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertCarImageSchema = createInsertSchema(carImages).omit({ id: true });

export type InsertCarImage = z.infer<typeof insertCarImageSchema>;
export type CarImage = typeof carImages.$inferSelect;

// Car Documents table - logbook and other documents per car
export const carDocuments = pgTable("car_documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  carId: integer("car_id").notNull().references(() => cars.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  docType: varchar("doc_type").notNull(), // 'logbook', 'service_record', 'inspection_report'
  fileName: varchar("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertCarDocumentSchema = createInsertSchema(carDocuments).omit({ id: true });

export type InsertCarDocument = z.infer<typeof insertCarDocumentSchema>;
export type CarDocument = typeof carDocuments.$inferSelect;

// Buyer Chat Sessions - tracks voice/text conversations
export const buyerChatSessions = pgTable("buyer_chat_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  activeFilters: jsonb("active_filters").default({}),
  status: varchar("status").default("active"), // 'active', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBuyerChatSessionSchema = createInsertSchema(buyerChatSessions).omit({ id: true });

export type InsertBuyerChatSession = z.infer<typeof insertBuyerChatSessionSchema>;
export type BuyerChatSession = typeof buyerChatSessions.$inferSelect;

// Buyer Chat Messages - individual messages in a session
export const buyerChatMessages = pgTable("buyer_chat_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: integer("session_id").notNull().references(() => buyerChatSessions.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  transcriptText: text("transcript_text"), // For voice messages - the transcription
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBuyerChatMessageSchema = createInsertSchema(buyerChatMessages).omit({ id: true });

export type InsertBuyerChatMessage = z.infer<typeof insertBuyerChatMessageSchema>;
export type BuyerChatMessage = typeof buyerChatMessages.$inferSelect;
