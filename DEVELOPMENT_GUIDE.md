# IRA Development Guide — 开发指南
# For AI Coding Assistants (Cursor / Claude Code / Copilot)

> **Read this document first before writing any code.**
> **写任何代码之前，请先阅读本文档。**

---

## 0. Project Summary / 项目概要

**Ireland Repair Alliance (IRA)** is a Fresha-style multi-tenant SaaS platform for the mobile repair industry. Customers search for nearby repair shops, compare prices, book repairs online with a 20% deposit via Stripe, and receive a 180-day all-island warranty.

**爱尔兰维修联盟 (IRA)** 是一个 Fresha 模式的多租户 SaaS 平台。客户搜索附近维修店、比价、在线预约并支付 20% 定金（Stripe），获得 180 天全岛跨店联保。

**Full PRD:** See `PRD.md` in project root (bilingual, 13 sections, complete DB schema + API spec + user flows).

---

## 1. Current Project State / 项目当前状态

### What's DONE (已完成):

#### Backend (`/server/`)
| File | Status | Description |
|------|--------|-------------|
| `server/package.json` | DONE | Express + Prisma + all deps installed, ES modules |
| `server/src/index.js` | DONE | Express app with cors, helmet, morgan, route mounting, error handler |
| `server/prisma/schema.prisma` | DONE | All 18 Prisma models (356 lines) matching PRD Section 4 |
| `server/src/config/database.js` | DONE | Prisma client singleton |
| `server/src/config/stripe.js` | DONE | Stripe instance from env |
| `server/src/config/google-maps.js` | DONE | Google Maps API key export |
| `server/src/middleware/auth.js` | DONE | JWT verification middleware |
| `server/src/middleware/role.js` | DONE | Role-based access guard |
| `server/src/middleware/validate.js` | DONE | Request validation helper |
| `server/src/utils/geo.js` | DONE | Haversine distance calculation |
| `server/src/utils/qr.js` | DONE | QR code generation |
| `server/src/routes/webhooks.js` | DONE | Stripe webhook route stub |
| `server/.env.example` | DONE | Environment variable template |

#### Frontend (`/src/`)
| File | Status | Description |
|------|--------|-------------|
| `package.json` | DONE | react-router-dom + axios added |
| `src/api/client.js` | DONE | Axios instances for client/merchant/hq APIs with auth interceptor |
| `src/context/AuthContext.jsx` | DONE | Auth context with login/logout/token/role |
| `src/components/shared/CustomerLayout.jsx` | DONE | Mobile-first layout with bottom nav |
| `src/components/shared/MerchantLayout.jsx` | DONE | Sidebar layout for merchant dashboard |
| `src/components/shared/HQLayout.jsx` | DONE | Sidebar layout for HQ admin |
| `src/components/shared/LoadingSpinner.jsx` | DONE | Spinner component |
| `src/pages/customer/*.jsx` (8 files) | DONE | Page stubs (placeholder content) |
| `src/pages/merchant/*.jsx` (8 files) | DONE | Page stubs (placeholder content) |
| `src/pages/hq/*.jsx` (5 files) | DONE | Page stubs (placeholder content) |
| `src/styles/brand-design.css` | DONE | Dark theme, IRA brand colors |
| Old dead code | DELETED | mockData, settlement, old components removed |

### What's NOT DONE (未完成) — Must be built:

#### Critical Gap 1: `src/App.jsx` NOT rewritten
**The App.jsx still imports deleted files.** Must be rewritten with React Router.

#### Critical Gap 2: Backend route files are EMPTY
All directories exist but contain no files:
- `server/src/routes/client/` — 0 files (need 5: auth, browse, shop, booking, warranty)
- `server/src/routes/merchant/` — 0 files (need 6: auth, dashboard, catalog, booking, warranty, settings)
- `server/src/routes/hq/` — 0 files (need 5: auth, catalog, merchant, commission, finance)

#### Critical Gap 3: Backend service files are EMPTY
- `server/src/services/` — 0 files (need 4: booking, commission, warranty, stripe)

#### Critical Gap 4: Database not migrated
Prisma schema exists but `prisma migrate dev` has not been run (needs a running PostgreSQL).

---

## 2. Tech Stack / 技术栈

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Vite | 19.2 + 8.0 |
| Routing | react-router-dom | 7.13 |
| HTTP Client | axios | 1.14 |
| Backend | Node.js + Express | ES modules |
| ORM | Prisma | latest |
| Database | PostgreSQL | 15+ |
| Payment | Stripe | Checkout Sessions |
| Maps | Google Maps JS API | v3 |
| Deploy | GCP Cloud Run + Cloud SQL | — |

---

## 3. Architecture Overview / 架构概览

```
Single-Database Multi-Tenant
所有商户共享一个 PostgreSQL 数据库，通过 merchant_id 隔离

Frontend (React, port 5173)
├── C-End   /                    → Customer pages (mobile-first)
├── B-End   /merchant/*          → Merchant dashboard (sidebar layout)
└── A-End   /hq/*                → HQ admin panel (sidebar layout)
         ↕ REST API
Backend (Express, port 3001)
├── /api/v1/client/*             → Customer-facing APIs
├── /api/v1/merchant/*           → Merchant APIs (JWT auth)
├── /api/v1/hq/*                 → HQ admin APIs (JWT auth)
└── /api/v1/webhooks/stripe      → Stripe webhooks
         ↕
PostgreSQL (18 tables via Prisma)
```

---

## 4. File Structure / 文件结构

```
IErepair/
├── PRD.md                           ★ Full product spec (READ THIS)
├── DEVELOPMENT_GUIDE.md             ★ This file
├── CLAUDE_TEAM.md                   Team protocol (reference only)
│
├── src/                             ── FRONTEND ──
│   ├── App.jsx                      ⚠️ NEEDS REWRITE (React Router)
│   ├── main.jsx                     Vite entry point
│   ├── api/
│   │   └── client.js                ✅ Axios instances (clientAPI, merchantAPI, hqAPI)
│   ├── context/
│   │   └── AuthContext.jsx          ✅ Auth state management
│   ├── components/shared/
│   │   ├── CustomerLayout.jsx       ✅ Mobile-first layout
│   │   ├── MerchantLayout.jsx       ✅ Sidebar layout
│   │   ├── HQLayout.jsx            ✅ Sidebar layout
│   │   └── LoadingSpinner.jsx       ✅ Spinner
│   ├── pages/
│   │   ├── customer/                ✅ 8 stub files (need real implementation)
│   │   │   ├── HomePage.jsx         Build: brand grid, search bar, popular nearby
│   │   │   ├── SearchPage.jsx       Build: shop comparison list + map toggle
│   │   │   ├── ShopPage.jsx         Build: micro-site with tabs (services/about/reviews)
│   │   │   ├── BookingFlow.jsx      Build: 4-step (date→time→details→pay)
│   │   │   ├── BookingConfirmation.jsx  Build: QR code + booking details
│   │   │   ├── MyBookings.jsx       Build: booking history with status
│   │   │   ├── WarrantyWallet.jsx   Build: warranty cards
│   │   │   └── LoginPage.jsx        Build: email OTP login
│   │   ├── merchant/                ✅ 8 stub files (need real implementation)
│   │   │   ├── MerchantLogin.jsx    Build: email + password login
│   │   │   ├── Dashboard.jsx        Build: today's stats + booking timeline
│   │   │   ├── Pricing.jsx          Build: master catalog + toggle + price edit
│   │   │   ├── Calendar.jsx         Build: weekly/daily booking calendar
│   │   │   ├── Orders.jsx           Build: order list with status management
│   │   │   ├── ScanCheckIn.jsx      Build: QR scanner + check-in
│   │   │   ├── WarrantyClaims.jsx   Build: warranty claim management
│   │   │   └── Settings.jsx         Build: shop info, hours, photos, slots
│   │   └── hq/                      ✅ 5 stub files (need real implementation)
│   │       ├── HQLogin.jsx          Build: admin login
│   │       ├── MasterCatalog.jsx    Build: CRUD table for products
│   │       ├── MerchantManagement.jsx  Build: merchant list + activate/suspend
│   │       ├── CommissionRules.jsx  Build: rules editor with scope/rate/priority
│   │       └── Finance.jsx          Build: deposit/commission/settlement ledgers
│   └── styles/
│       └── brand-design.css         ✅ IRA dark theme
│
├── server/                          ── BACKEND ──
│   ├── package.json                 ✅ All deps installed
│   ├── .env.example                 ✅ Env template
│   ├── prisma/
│   │   └── schema.prisma            ✅ 18 models (356 lines)
│   ├── src/
│   │   ├── index.js                 ✅ Express app entry (port 3001)
│   │   ├── config/
│   │   │   ├── database.js          ✅ Prisma client singleton
│   │   │   ├── stripe.js            ✅ Stripe instance
│   │   │   └── google-maps.js       ✅ Maps API key
│   │   ├── middleware/
│   │   │   ├── auth.js              ✅ JWT verification
│   │   │   ├── role.js              ✅ Role guard
│   │   │   └── validate.js          ✅ Validation helper
│   │   ├── routes/
│   │   │   ├── webhooks.js          ✅ Stripe webhook stub
│   │   │   ├── client/              ⚠️ EMPTY — need 5 route files
│   │   │   ├── merchant/            ⚠️ EMPTY — need 6 route files
│   │   │   └── hq/                  ⚠️ EMPTY — need 5 route files
│   │   ├── services/                ⚠️ EMPTY — need 4 service files
│   │   └── utils/
│   │       ├── geo.js               ✅ Haversine distance
│   │       └── qr.js               ✅ QR generation
│   └── node_modules/                ✅ Installed
│
├── index.html                       ✅ Vite HTML entry
├── vite.config.js                   ✅ Vite config
├── package.json                     ✅ Frontend deps (react 19, router, axios)
└── node_modules/                    ✅ Installed
```

---

## 5. Development Tasks — Ordered by Priority / 开发任务（按优先级排序）

### Phase A: Fix Critical Gaps (修复关键缺失)

#### A1. Rewrite `src/App.jsx` with React Router
**Priority: CRITICAL — App is broken without this**

Replace the current App.jsx (which imports deleted files) with React Router setup:

```jsx
// Route structure:
// /                          → HomePage (CustomerLayout)
// /search                    → SearchPage (CustomerLayout)
// /shop/:slug                → ShopPage (CustomerLayout)
// /shop/:slug/book/:productId → BookingFlow (CustomerLayout)
// /booking/:bookingId        → BookingConfirmation (CustomerLayout)
// /my/bookings               → MyBookings (CustomerLayout)
// /my/warranties             → WarrantyWallet (CustomerLayout)
// /login                     → LoginPage (no layout)
// /merchant/login            → MerchantLogin (no layout)
// /merchant/dashboard        → Dashboard (MerchantLayout)
// /merchant/calendar         → Calendar (MerchantLayout)
// /merchant/pricing          → Pricing (MerchantLayout)
// /merchant/orders           → Orders (MerchantLayout)
// /merchant/scan             → ScanCheckIn (MerchantLayout)
// /merchant/warranty         → WarrantyClaims (MerchantLayout)
// /merchant/settings         → Settings (MerchantLayout)
// /hq/login                  → HQLogin (no layout)
// /hq/catalog                → MasterCatalog (HQLayout)
// /hq/merchants              → MerchantManagement (HQLayout)
// /hq/commission             → CommissionRules (HQLayout)
// /hq/finance                → Finance (HQLayout)
```

Wrap everything in `<AuthProvider>` from `src/context/AuthContext.jsx`.
Import `src/styles/brand-design.css`.

#### A2. Create all backend route stub files
Each file should export an Express Router with placeholder endpoints that return `{ message: "Not implemented" }`.

**`server/src/routes/client/`** (5 files):
- `auth.routes.js` — POST /send-otp, POST /verify-otp, GET /me
- `browse.routes.js` — GET /brands, GET /brands/:id/devices, GET /devices/:id/services, GET /search
- `shop.routes.js` — GET /shops/:slug, GET /shops/:slug/services, GET /shops/:slug/reviews, GET /shops/:slug/slots
- `booking.routes.js` — POST /bookings, GET /bookings/:id, POST /bookings/:id/cancel
- `warranty.routes.js` — GET /warranties, GET /warranties/:id

**`server/src/routes/merchant/`** (6 files):
- `auth.routes.js` — POST /login, GET /me
- `dashboard.routes.js` — GET /dashboard/today, GET /dashboard/stats
- `catalog.routes.js` — GET /catalog, POST /catalog/sync, PATCH /catalog/:id, POST /catalog/bulk-sync
- `booking.routes.js` — GET /bookings, GET /bookings/:id, POST /bookings/:id/check-in, POST /bookings/:id/start, POST /bookings/:id/complete, POST /bookings/:id/no-show
- `warranty.routes.js` — GET /warranty-claims, POST /warranty-claims
- `settings.routes.js` — GET /settings, PATCH /settings, PUT /settings/hours, PATCH /settings/slots, POST /settings/photos, DELETE /settings/photos/:id

**`server/src/routes/hq/`** (5 files):
- `auth.routes.js` — POST /login
- `catalog.routes.js` — GET /catalog, POST /catalog, PATCH /catalog/:id, DELETE /catalog/:id, GET+POST /brands, GET+POST /devices, GET+POST /categories
- `merchant.routes.js` — GET /merchants, GET /merchants/:id, POST /merchants/:id/activate, POST /merchants/:id/suspend
- `commission.routes.js` — GET /commission/rules, POST /commission/rules, PATCH /commission/rules/:id, DELETE /commission/rules/:id
- `finance.routes.js` — GET /finance/deposits, GET /finance/commissions, GET /finance/settlements, GET+POST /warranty-claims/:id/approve|reject|settle

#### A3. Create backend service files
**`server/src/services/`** (4 files):

- `booking.service.js` — createBooking, cancelBooking, checkIn, complete, markNoShow, generateBookingNumber
- `stripe.service.js` — createCheckoutSession, handleWebhook, createRefund
- `warranty.service.js` — createWarranty (on booking complete), verifyClaim, calculateSettlement (baseCost + €30)
- `commission.service.js` — resolveCommissionRate (priority: merchant > region > global), calculateCommission, recordCommission

---

### Phase B: Implement Backend APIs (实现后端 API)

#### B1. HQ APIs (Total: ~15 endpoints)
1. HQ auth (login with email+password → JWT)
2. Master catalog CRUD (brands, devices, categories, products)
3. Merchant management (list, activate, suspend)
4. Commission rules CRUD (with scope_type + priority)
5. Finance ledgers (deposits, commissions, settlements queries)

#### B2. Merchant APIs (Total: ~20 endpoints)
1. Merchant auth (login → JWT)
2. Dashboard stats (today's bookings, revenue)
3. Catalog sync (browse master catalog, set my_price, toggle active)
4. Booking management (list, check-in via QR, start, complete, no-show)
5. Warranty claims
6. Settings (shop info, business hours, booking slots, photos)

#### B3. Client APIs (Total: ~15 endpoints)
1. Customer auth (send OTP, verify OTP)
2. Browse (brands → devices → services)
3. Search (LBS-based, with Haversine distance sorting)
4. Shop detail (micro-site data: info + services + reviews + available slots)
5. Booking (create → Stripe Checkout → webhook confirms)
6. Warranty wallet

---

### Phase C: Implement Frontend Pages (实现前端页面)

#### C1. Customer Pages (8 pages, mobile-first)
Build order: HomePage → SearchPage → ShopPage → BookingFlow → BookingConfirmation → LoginPage → MyBookings → WarrantyWallet

**Key interactions:**
- HomePage: brand icon grid → tap brand → devices → tap device → services → SearchPage
- SearchPage: shop cards sorted by distance, each with price + rating + "Book Now"
- ShopPage: tabs (Services / About / Reviews), sticky "Book" CTA
- BookingFlow: 4 steps (date → time → details → summary), pay deposit via Stripe redirect
- BookingConfirmation: QR code display + booking details

#### C2. Merchant Pages (8 pages, desktop sidebar layout)
Build order: MerchantLogin → Dashboard → Pricing → Orders → ScanCheckIn → Settings → Calendar → WarrantyClaims

**Key interactions:**
- Pricing: table showing master catalog, toggle on/off, edit price inline
- Orders: booking list with status filters, action buttons (check-in / start / complete / no-show)
- ScanCheckIn: camera QR scanner → verify → confirm check-in
- Settings: business hours 7-row table, photo upload, slot config

#### C3. HQ Pages (5 pages, desktop sidebar layout)
Build order: HQLogin → MasterCatalog → MerchantManagement → CommissionRules → Finance

**Key interactions:**
- MasterCatalog: data table with add/edit/delete modals
- MerchantManagement: tabs (Pending / Active / Suspended), activate/suspend buttons
- CommissionRules: rule list + add modal (scope type selector, rate slider 0-15%, date range)
- Finance: tabs (Deposits / Commissions / Settlements) with date filters

---

### Phase D: Integration & Polish (集成与打磨)

1. Connect all frontend pages to real backend APIs (replace stubs)
2. Run `prisma migrate dev` to create database tables
3. Create seed script (`server/prisma/seed.js`) with sample data:
   - 1 HQ admin, 3 merchants, 5 brands, 10 devices, 20 products, sample bookings
4. Test full booking flow end-to-end
5. Add Google Maps to SearchPage and ShopPage
6. Responsive design pass on all pages
7. Error handling and loading states

---

## 6. Key Business Rules (Reference) / 核心业务规则

| Rule | Value |
|------|-------|
| Deposit | 20% of service price |
| Warranty | 180 days from completion |
| No-show | Deposit forfeited (non-refundable) |
| Cancel > 24h | Full refund |
| Cancel < 24h | No refund |
| Commission | 0%–15%, priority: merchant > region > global |
| Warranty subsidy | €30 fixed labor per cross-shop claim |
| Merchant activation | HQ manual only |
| Booking advance | Per-merchant, default 14 days |
| Slot duration | Per-merchant, 15/30/60 min, default 30 |

---

## 7. Design System / 设计规范

Defined in `src/styles/brand-design.css`:

```css
--bg-deep: #0A0D11;          /* Page background */
--bg-sidebar: #121418;       /* Sidebar/card background */
--primary-green: #00D084;    /* Brand accent color */
--text-main: #FFFFFF;
--text-muted: #8E95A2;
--border-muted: rgba(255, 255, 255, 0.08);
--input-bg: rgba(0, 0, 0, 0.3);
```

Fonts: Inter (body), Outfit (headings).
All pages use dark theme. Mobile-first for customer pages. Sidebar layout for merchant/HQ.

---

## 8. Environment Variables / 环境变量

Backend (`server/.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/ira_dev
JWT_SECRET=your-jwt-secret-here
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOOGLE_MAPS_API_KEY=xxx
PORT=3001
NODE_ENV=development
```

Frontend (`.env`):
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_MAPS_API_KEY=xxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

## 9. Commands / 常用命令

```bash
# Frontend dev server (port 5173)
npm run dev

# Backend dev server (port 3001)
cd server && npm run dev

# Database migration
cd server && npx prisma migrate dev --name init

# Database seed
cd server && npx prisma db seed

# Prisma Studio (visual DB browser)
cd server && npx prisma studio
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-31*
*Status: Phase A in progress — critical gaps need fixing first*
