import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users / Customers
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer | admin
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Vehicle types
export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  maxPassengers: integer("max_passengers").notNull(),
  baseFare: real("base_fare").notNull(),
  perMile: real("per_mile").notNull(),
  perMinute: real("per_minute").notNull(),
  imageUrl: text("image_url"),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Bookings
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  vehicleId: integer("vehicle_id").notNull(),
  status: text("status").notNull().default("pending"), // pending | confirmed | in_progress | completed | cancelled
  pickupAddress: text("pickup_address").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  pickupLat: real("pickup_lat"),
  pickupLng: real("pickup_lng"),
  dropoffLat: real("dropoff_lat"),
  dropoffLng: real("dropoff_lng"),
  pickupDate: text("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  passengers: integer("passengers").notNull().default(1),
  distanceMiles: real("distance_miles"),
  durationMinutes: real("duration_minutes"),
  estimatedFare: real("estimated_fare"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  specialInstructions: text("special_instructions"),
  createdAt: text("created_at").notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Quotes (for fare calculation before booking)
export const quoteRequestSchema = z.object({
  pickupAddress: z.string().min(1),
  dropoffAddress: z.string().min(1),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  dropoffLat: z.number().optional(),
  dropoffLng: z.number().optional(),
  distanceMiles: z.number().optional(),
  durationMinutes: z.number().optional(),
  vehicleSlug: z.string().optional(),
  passengers: z.number().min(1).max(14).optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export interface QuoteResponse {
  vehicles: Array<{
    vehicle: Vehicle;
    fare: number;
    breakdown: {
      baseFare: number;
      distanceCharge: number;
      timeCharge: number;
      total: number;
    };
  }>;
  distanceMiles: number;
  durationMinutes: number;
}

// AI Assistant message
export const assistantMessageSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    pickupAddress: z.string().optional(),
    dropoffAddress: z.string().optional(),
    vehicleType: z.string().optional(),
    pickupDate: z.string().optional(),
    pickupTime: z.string().optional(),
  }).optional(),
});

export type AssistantMessage = z.infer<typeof assistantMessageSchema>;
