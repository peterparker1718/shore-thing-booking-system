import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBookingSchema,
  insertUserSchema,
  quoteRequestSchema,
  assistantMessageSchema,
  type QuoteResponse,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Vehicles ──
  app.get("/api/vehicles", async (_req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });

  // ── Quote (fare calculation) ──
  app.post("/api/quote", async (req, res) => {
    const parsed = quoteRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const data = parsed.data;
    const vehicles = await storage.getVehicles();

    // Use provided distance or estimate from coordinates
    let distanceMiles = data.distanceMiles || 0;
    let durationMinutes = data.durationMinutes || 0;

    // If we have coords but no distance, calculate haversine estimate
    if (
      !distanceMiles &&
      data.pickupLat && data.pickupLng &&
      data.dropoffLat && data.dropoffLng
    ) {
      distanceMiles = haversineDistance(
        data.pickupLat, data.pickupLng,
        data.dropoffLat, data.dropoffLng
      );
      // Rough estimate: avg 30mph in NJ
      durationMinutes = (distanceMiles / 30) * 60;
    }

    // If still no distance, provide a demo estimate
    if (!distanceMiles) {
      distanceMiles = 15;
      durationMinutes = 25;
    }

    const vehicleQuotes = vehicles
      .filter((v) => !data.passengers || v.maxPassengers >= (data.passengers || 1))
      .map((vehicle) => {
        const baseFare = vehicle.baseFare;
        const distanceCharge = distanceMiles * vehicle.perMile;
        const timeCharge = durationMinutes * vehicle.perMinute;
        const total = Math.round((baseFare + distanceCharge + timeCharge) * 100) / 100;

        return {
          vehicle,
          fare: total,
          breakdown: { baseFare, distanceCharge: Math.round(distanceCharge * 100) / 100, timeCharge: Math.round(timeCharge * 100) / 100, total },
        };
      });

    const response: QuoteResponse = {
      vehicles: vehicleQuotes,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      durationMinutes: Math.round(durationMinutes),
    };

    res.json(response);
  });

  // ── Book a Ride ──
  app.post("/api/bookings", async (req, res) => {
    const parsed = insertBookingSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString(),
      status: "pending",
    });

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const booking = await storage.createBooking(parsed.data);
    res.status(201).json(booking);
  });

  // ── Get all bookings (demo: no auth required) ──
  app.get("/api/bookings", async (_req, res) => {
    const allBookings = await storage.getAllBookings();
    res.json(allBookings);
  });

  // ── Get single booking ──
  app.get("/api/bookings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const booking = await storage.getBooking(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  });

  // ── Update booking status ──
  app.patch("/api/bookings/:id/status", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });

    const booking = await storage.updateBookingStatus(id, status);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  });

  // ── AI Ride Concierge (Perplexity Sonar) ──
  app.post("/api/assistant", async (req, res) => {
    const parsed = assistantMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { message, context } = parsed.data;

    // Build context-aware system prompt
    const systemPrompt = buildAssistantPrompt(context);

    try {
      // Try Perplexity Sonar API
      const pplxKey = process.env.PERPLEXITY_API_KEY || process.env.PPLX_API_KEY;

      if (pplxKey) {
        const pplxRes = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${pplxKey}`,
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            max_tokens: 500,
          }),
        });

        if (pplxRes.ok) {
          const data = await pplxRes.json();
          return res.json({
            response: data.choices?.[0]?.message?.content || "I couldn't process that. Please try again.",
            source: "perplexity",
          });
        }
      }

      // Fallback: local smart response
      const fallbackResponse = generateFallbackResponse(message, context);
      res.json({ response: fallbackResponse, source: "local" });
    } catch (err) {
      const fallbackResponse = generateFallbackResponse(message, context);
      res.json({ response: fallbackResponse, source: "local" });
    }
  });

  // ── Auth: Register ──
  app.post("/api/auth/register", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const existing = await storage.getUserByUsername(parsed.data.username);
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await storage.createUser(parsed.data);
    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  });

  // ── Auth: Login ──
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  return httpServer;
}

// Haversine distance calculation
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.3; // 1.3 factor for road distance vs straight line
}

function buildAssistantPrompt(context?: { pickupAddress?: string; dropoffAddress?: string; vehicleType?: string; pickupDate?: string; pickupTime?: string }) {
  let prompt = `You are the Shore Thing Transportation ride concierge — a knowledgeable, professional AI assistant for a luxury black car service based in Asbury Park, New Jersey. You serve the Jersey Shore area, Monmouth County, and surrounding regions.

Key service facts:
- Service area: Asbury Park, Belmar, Long Branch, Red Bank, Freehold, Princeton, and all of Monmouth/Ocean County
- Airport transfers to/from EWR, JFK, LGA, and PHL
- Vehicle fleet: Executive Sedan, Premium SUV, Executive Van, Luxury Sedan, XL Van
- Professional, locally experienced chauffeurs with clear communication
- Pre-scheduled rides with flight monitoring for airport pickups
- Corporate accounts and recurring ride schedules available

Your tone: Professional, warm, and knowledgeable. You know the Shore area intimately — local venues, traffic patterns, best routes, event schedules. You never say "I'm an AI" — you speak as a representative of Shore Thing Transportation.`;

  if (context) {
    const parts: string[] = [];
    if (context.pickupAddress) parts.push(`Pickup: ${context.pickupAddress}`);
    if (context.dropoffAddress) parts.push(`Dropoff: ${context.dropoffAddress}`);
    if (context.vehicleType) parts.push(`Vehicle: ${context.vehicleType}`);
    if (context.pickupDate) parts.push(`Date: ${context.pickupDate}`);
    if (context.pickupTime) parts.push(`Time: ${context.pickupTime}`);
    if (parts.length) {
      prompt += `\n\nCurrent booking context:\n${parts.join("\n")}`;
    }
  }

  return prompt;
}

function generateFallbackResponse(message: string, context?: any): string {
  const lower = message.toLowerCase();

  if (lower.includes("airport") || lower.includes("ewr") || lower.includes("jfk") || lower.includes("lga") || lower.includes("newark")) {
    return "We provide premium airport transfer service to all major airports — EWR (Newark), JFK, LGA, and PHL. Our chauffeurs monitor your flight in real-time, so even if your arrival changes, we'll be there. From the Shore area, EWR is typically 60-75 minutes, and JFK/LGA run 90-120 minutes depending on traffic. We recommend booking at least 24 hours in advance for airport transfers.";
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("fare") || lower.includes("how much")) {
    return "Our fares are calculated based on distance, time, and vehicle type. Use the booking form to enter your pickup and dropoff locations — you'll see real-time fare estimates for each vehicle class. Executive Sedans start at $15 base + $3.50/mile, while our Premium SUVs are $25 base + $4.50/mile. No surge pricing, ever.";
  }

  if (lower.includes("area") || lower.includes("service") || lower.includes("where")) {
    return "Shore Thing Transportation covers all of Monmouth and Ocean County — from Asbury Park and Belmar to Red Bank, Long Branch, Freehold, and beyond. We also handle trips to Princeton, New Brunswick, and all NYC-area airports. If you're on the Jersey Shore, we've got you covered.";
  }

  if (lower.includes("book") || lower.includes("schedule") || lower.includes("reserve")) {
    return "You can book a ride right here — just enter your pickup and dropoff locations, select your date and time, choose a vehicle, and confirm. You'll get an instant fare estimate before booking. For recurring rides or corporate accounts, mention it in the special instructions and our team will set you up.";
  }

  return "Thanks for reaching out to Shore Thing Transportation. I can help with route information, fare estimates, service area questions, airport transfer details, and booking assistance. What would you like to know?";
}
