import {
  type User, type InsertUser, users,
  type Vehicle, type InsertVehicle, vehicles,
  type Booking, type InsertBooking, bookings,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicleBySlug(slug: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.select().from(users).where(eq(users.username, username)).get();
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return db.insert(users).values(insertUser).returning().get();
  }

  async getVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles).all();
  }

  async getVehicleBySlug(slug: string): Promise<Vehicle | undefined> {
    return db.select().from(vehicles).where(eq(vehicles.slug, slug)).get();
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    return db.insert(vehicles).values(vehicle).returning().get();
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    return db.insert(bookings).values(booking).returning().get();
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return db.select().from(bookings).where(eq(bookings.id, id)).get();
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.id)).all();
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.id)).all();
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    return db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning().get();
  }
}

export const storage = new DatabaseStorage();

// Seed vehicles on startup
function seedVehicles() {
  const existingVehicles = db.select().from(vehicles).all();
  if (existingVehicles.length === 0) {
    const defaultVehicles: InsertVehicle[] = [
      {
        name: "Executive Sedan",
        slug: "sedan",
        description: "Lincoln Continental or similar. Leather interior, professional chauffeur.",
        maxPassengers: 3,
        baseFare: 15,
        perMile: 3.50,
        perMinute: 0.50,
      },
      {
        name: "Premium SUV",
        slug: "suv",
        description: "Cadillac Escalade or similar. Spacious luxury for up to 6 passengers.",
        maxPassengers: 6,
        baseFare: 25,
        perMile: 4.50,
        perMinute: 0.65,
      },
      {
        name: "Executive Van",
        slug: "van",
        description: "Mercedes Sprinter or similar. Perfect for groups and airport transfers.",
        maxPassengers: 10,
        baseFare: 35,
        perMile: 5.00,
        perMinute: 0.75,
      },
      {
        name: "Luxury Sedan",
        slug: "luxury",
        description: "Mercedes S-Class or BMW 7 Series. The pinnacle of executive transport.",
        maxPassengers: 3,
        baseFare: 30,
        perMile: 5.50,
        perMinute: 0.85,
      },
      {
        name: "XL Van",
        slug: "xl-van",
        description: "Ford Transit or similar. Ideal for large groups up to 14 passengers.",
        maxPassengers: 14,
        baseFare: 45,
        perMile: 5.50,
        perMinute: 0.85,
      },
    ];
    for (const v of defaultVehicles) {
      db.insert(vehicles).values(v).run();
    }
  }
}

seedVehicles();
