# IERepair — Ireland's Mobile Repair & Accessories Platform
# 爱尔兰手机维修与配件 B2B2C SaaS 平台

A **B2B2C SaaS platform** connecting suppliers, repair shops, and consumers across Ireland.

---

## What is IERepair?

IERepair connects three groups:

- **Suppliers** — Submit phone accessories SKUs to the platform's curated product library
- **Merchant shops** — Select products from the library, set their own prices, accept bookings and orders
- **Consumers** — Search nearby shops, browse products, book repairs online

Phase 1 MVP targets the operator's own **3 stores** in Ireland, then expands to 3,000+ shops nationwide.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| UI | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL 16 + PostGIS (GCP Cloud SQL) |
| ORM | Drizzle ORM |
| Cache | Redis (Upstash) — Eircode geocoding cache |
| Auth | NextAuth.js v5 (Phone OTP + Credentials) |
| Payment | Stripe + Stripe Connect |
| SMS | Twilio |
| Maps/Geo | Google Maps Geocoding API + PostGIS |
| File Storage | Google Cloud Storage (GCS) |
| Deploy | GCP Cloud Run |

---

## Business Model

- **Repair service commission**: 8% (configurable per shop/region/time period)
- **Accessories**: 0% commission — platform holds Stripe funds, settles net amount monthly
- **Membership plans**: Screen protection plans (€29.9 / €49.9 / €99.9/year) — Phase 2
- **Booking deposit**: 20% of repair price paid upfront via Stripe; no-show = forfeited

---

## Category Whitelist

Platform enforces strict category control. Only phone-related categories are allowed:
- Mobile repair services (screen, battery, motherboard)
- Phone accessories (cases, screen protectors)
- Charging accessories (chargers, cables, power banks)
- Audio accessories, storage accessories

Prohibited: drones, smart home devices, unrelated electronics.

---

## Documentation

| Document | Description |
|----------|-------------|
| `PRD.md` | Full product spec — business model, DB schema, API design, business rules |
| `DEVELOPMENT_GUIDE.md` | Tech stack, architecture, development tasks, coding conventions |
| `CONTINUATION_PLAN.md` | Current status, next tasks, migration notes for AI coders |
| `docs/` | Original Chinese product documents (01–08) |

---

## MVP Goals

3 shops fully operational with:
1. Consumers can search products/services by Eircode
2. Consumers can book repairs online (OTP login + SMS confirmation)
3. Merchants can manage their product selection and accept bookings
4. Admin can create shop accounts and manage product library

---

## Getting Started (New Next.js Project)

```bash
# 1. Create Next.js project
npx create-next-app@latest ierepair --typescript --tailwind --app

# 2. Install dependencies
npm install drizzle-orm postgres next-auth@beta stripe twilio
npm install @google-cloud/storage drizzle-kit --save-dev

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with GCP Cloud SQL, Redis, Google Maps, Twilio, Stripe credentials

# 4. Push database schema
npx drizzle-kit push

# 5. Run development server
npm run dev   # http://localhost:3000
```

See `DEVELOPMENT_GUIDE.md` for full setup instructions and architecture details.

---

*Platform: IERepair | Market: Ireland | Updated: 2026-04-02*
