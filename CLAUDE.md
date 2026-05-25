# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint check
```

No test suite exists yet.

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | **Next.js 16.2.6 App Router** | See AGENTS.md — APIs differ from training data |
| Styling | **Tailwind CSS v4** | Different syntax from v3; `@import "tailwindcss"` not `@tailwind` directives |
| Language | TypeScript |  |
| UI Components | **shadcn/ui** | |
| ORM | **Prisma** | |
| Database | PostgreSQL 16 + PostGIS | Hosted on Neon; PostGIS required for geo queries |
| Cache | Redis via Upstash | Eircode → coordinates cache (30-day TTL) |
| Auth | NextAuth.js v5 | Phone OTP + Google OAuth |
| Payment | Stripe + Stripe Connect | EUR, multi-party payouts to merchants |
| SMS | Twilio | Booking confirmations to users and merchants |
| Maps | Google Maps Geocoding API (backend) + Google Maps Static API (frontend) | |
| File Storage | Cloudflare R2 | S3-compatible |
| Deploy | Vercel | |

## Architecture

This is a **B2B2C marketplace** for phone repair in Ireland: Platform → Merchant shops → Consumers.

### Current state
Only the consumer-facing homepage is built (`src/app/page.tsx`). No database, no auth, no API routes yet.

### Planned multi-tenant route structure
```
app/
├── (consumer)/          # Public, mobile-first
├── merchant/            # Merchant dashboard (needs login)
├── admin/               # Platform admin (needs login)
├── supplier/            # Supplier portal (future)
└── api/v1/
    ├── public/          # No auth required
    ├── auth/            # OTP send/verify
    ├── user/            # Consumer auth required
    ├── merchant/        # Merchant JWT required
    └── admin/           # Admin JWT required
```

### Styling conventions
Components use **inline styles + scoped `<style>` JSX tags** rather than Tailwind utility classes. CSS custom properties are defined in `src/app/globals.css` and must be used for all colours and tokens:

```css
--color-accent: #146345          /* primary green */
--color-link: #17db66            /* bright green */
--color-header-bg: #1c3830       /* dark green header */
--color-btn-bg: #1d1d1f          /* near-black button */
--wrapper-mw: 1420px             /* max-width for .wrapper */
```

Use `.wrapper` for page-width containers (already defined in globals.css).
Use `.btn-primary` / `.btn-outline` for standard buttons.

### Images
All product/UI images live in `public/fonfix/`. Reference them as `/fonfix/<filename>`.

### Eircode geo-search
User searches by Eircode (Irish postcode, format `D01 AB23`). Backend resolves to coordinates via Google Maps Geocoding API, caches in Redis (30-day TTL), then queries merchants via PostGIS `ST_DWithin`. See `docs/07-技术决策与模型变更.md` for the reference implementation.

## Product docs
Full PRD is in `docs/` (01–08). Key files:
- `docs/07-技术决策与模型变更.md` — canonical tech stack, Eircode architecture, commission model
- `docs/08-MVP开发范围.md` — MVP scope, page list, DB schema, environment variables
