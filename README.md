# Shore Thing Transportation — AI-Powered Booking System

> Full-stack ride booking platform with AI concierge powered by Perplexity Sonar API. Real-time fare calculation, booking management, and context-aware ride assistant for luxury black car service.

## Live Demo
🌐 **[shore-thing-booking-xxxxx.run.app](https://shore-thing-booking-xxxxx.run.app)** *(Update after deployment)*

## Architecture
```
┌────────────────────┐
│   React Frontend   │
│   Vite + Tailwind  │
│   + Radix UI       │
├────────────────────┤
│   Express Backend  │
│   TypeScript       │
│   REST API         │
├────────────────────┤
│   SQLite + Drizzle │
│   ORM              │
├────────────────────┤
│   Perplexity AI    │
│   Sonar Concierge  │
└────────────────────┘
      Hosted on
   Google Cloud Run
```

## Features
- **Real-time fare calculator** — Haversine distance + per-mile/per-minute pricing across 5 vehicle classes
- **AI Ride Concierge** — Perplexity Sonar-powered assistant that knows the Jersey Shore area, traffic patterns, airport routes
- **Full booking lifecycle** — Create, view, update status (pending → confirmed → in_progress → completed)
- **Vehicle fleet management** — Executive Sedan, Premium SUV, Executive Van, Luxury Sedan, XL Van
- **User authentication** — Registration and login with session management
- **Type-safe end-to-end** — Zod schemas shared between frontend and backend

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Radix UI, Framer Motion |
| Backend | Express 5, TypeScript, Drizzle ORM |
| Database | SQLite (better-sqlite3) |
| AI | Perplexity Sonar API (with smart fallback) |
| Validation | Zod + drizzle-zod |
| Infrastructure | Google Cloud Run |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/vehicles` | List all vehicle types with pricing |
| POST | `/api/quote` | Calculate fare estimate |
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| POST | `/api/assistant` | AI concierge chat |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

## Run Locally
```bash
git clone https://github.com/peterparker1718/shore-thing-booking-system.git
cd shore-thing-booking-system
npm install
export PERPLEXITY_API_KEY="your_key"
npm run dev
# Open http://localhost:5000
```

## Deploy to Google Cloud
```bash
chmod +x deploy.sh
./deploy.sh YOUR_PROJECT_ID
```

## Key Design Decisions
- **Perplexity Sonar over GPT-4**: Real-time web grounding means the concierge has current traffic/event info for the Jersey Shore area
- **SQLite over Postgres**: Zero-dependency persistence for Cloud Run; perfect for demo-scale. Production would migrate to Cloud SQL
- **Monorepo with shared schemas**: Single `shared/schema.ts` ensures type safety across the full stack — zero runtime type mismatches
- **Smart AI fallback**: If Perplexity API is unavailable, the concierge falls back to curated local responses — no broken UX

## About
Built by **Christopher Parker** — full-stack developer and entrepreneur based in New Jersey. This system powers Shore Thing Transportation, a real luxury black car service serving the Jersey Shore area.

- GitHub: [@peterparker1718](https://github.com/peterparker1718)
- Portfolio: [parkersportfolio.info](https://parkersportfolio.info)
