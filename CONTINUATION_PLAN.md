# IRA Development Continuation Plan / 开发续接计划
# For Any AI Coder (Cursor / Claude Code / Copilot / etc.)

> **This document is the single source of truth for continuing development.**
> **本文档是继续开发的唯一参考依据。**
> Read `PRD.md` for full product spec. Read `DEVELOPMENT_GUIDE.md` for architecture context.

---

## 0. Project Status Summary / 项目状态总结

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase A** — Fix Critical Gaps | ✅ Done | App.jsx rewritten, all route/service stubs created |
| **Phase B** — Backend APIs | ✅ Done | 30 files, 3038 lines. All 50+ endpoints implemented |
| **Phase C** — Frontend Pages | 🟡 ~70% | Customer 8/8 done, Merchant 6/8 done, HQ 0/5 done |
| **Phase D** — Integration & Polish | ❌ Not started | Seed data, API integration, error handling |

### What's committed (on `main`):
- Phase A + B complete (commit `34b58cc`)
- Frontend stubs for all 21 pages

### What's modified but NOT committed (in working directory):
- 14 files with ~1,850 lines of new UI code (Customer + Merchant pages)
- These are **real implementations** (not stubs), with API calls + mock data fallback
- **Must be committed before starting new work**

---

## 1. Remaining Phase C Tasks / Phase C 剩余任务

### C1. Merchant Settings `/merchant/settings` — `src/pages/merchant/Settings.jsx`
**Currently:** 10-line stub ("Coming Soon")
**Required:** Full shop settings page per PRD Section 7.2

**Implementation spec:**
```
Sections (vertical form layout):
1. Shop Info Form
   - Fields: Shop Name, Address, Description, Phone, Email
   - "Save Changes" button → PATCH /api/v1/merchant/settings

2. Photo Upload
   - Grid display of current photos (max 10)
   - "Add Photo" button (file input, not drag & drop for MVP)
   - Delete button per photo → DELETE /api/v1/merchant/settings/photos/:id
   - POST /api/v1/merchant/settings/photos (multipart)

3. Business Hours
   - 7-row table: Monday–Sunday
   - Each row: day name | open_time (input type=time) | close_time (input type=time) | "Closed" toggle
   - "Save Hours" button → PUT /api/v1/merchant/settings/hours

4. Booking Slot Config
   - Slot Duration: dropdown (15 / 30 / 60 min)
   - Max Concurrent: number input (default 3)
   - Buffer Minutes: number input (default 0)
   - Advance Days: number input (default 14)
   - "Save Slots" button → PATCH /api/v1/merchant/settings/slots
```

**API endpoints (already implemented in backend):**
- `GET /api/v1/merchant/settings` — fetch current settings
- `PATCH /api/v1/merchant/settings` — update shop info
- `PUT /api/v1/merchant/settings/hours` — replace business hours
- `PATCH /api/v1/merchant/settings/slots` — update slot config
- `POST /api/v1/merchant/settings/photos` — upload photo
- `DELETE /api/v1/merchant/settings/photos/:id` — remove photo

---

### C2. Merchant WarrantyClaims `/merchant/warranty` — `src/pages/merchant/WarrantyClaims.jsx`
**Currently:** 10-line stub ("Coming Soon")
**Required:** Warranty claim management page per PRD Section 7.2

**Implementation spec:**
```
Layout:
1. Header: "Warranty Claims" + "New Claim" button

2. New Claim Form (modal or inline):
   - Warranty Number input (e.g. "IRA-W-20260330-XXXX")
   - "Look Up" button → validates warranty is active + within 180 days
   - If valid: show warranty details (device, service, original shop, dates)
   - Customer Note textarea
   - "Submit Claim" button → POST /api/v1/merchant/warranty-claims

3. Claims Table:
   - Columns: Claim Date, Warranty#, Customer, Device/Service, Original Shop, Status, Amount
   - Status badges: pending (yellow), approved (green), settled (blue), rejected (red)
   - GET /api/v1/merchant/warranty-claims

Business rule: total_compensation = base_cost + €30 labor subsidy
```

**API endpoints (already implemented):**
- `GET /api/v1/merchant/warranty-claims` — list claims involving this shop
- `POST /api/v1/merchant/warranty-claims` — create new claim `{ warranty_number, customer_note }`

---

### C3. HQ Login `/hq/login` — `src/pages/hq/HQLogin.jsx`
**Currently:** 12-line stub
**Required:** Email + password login form (same pattern as MerchantLogin)

**Implementation spec:**
```
- Full-screen dark background, centered card
- IRA logo at top
- "HQ Administration" subtitle
- Email input + Password input
- "Sign In" button → POST /api/v1/hq/auth/login { email, password } → { token, admin }
- On success: localStorage.setItem('token', token), navigate('/hq/catalog')
- Demo fallback: email "admin@ira.ie", password "admin123" → skip API, set token, navigate
```

---

### C4. HQ MasterCatalog `/hq/catalog` — `src/pages/hq/MasterCatalog.jsx`
**Currently:** 10-line stub
**Required:** Full CRUD data table per PRD Section 7.3

**Implementation spec:**
```
Layout:
1. Header: "Master Product Catalog" + "Add Product" button + search input

2. Data Table:
   - Columns: SKU, Product Name, Device, Category, Base Cost (€), Suggested Price (€), Status, Actions
   - Actions: Edit (pencil icon), Delete (trash icon)
   - Rows from: GET /api/v1/hq/catalog

3. Add/Edit Product Modal:
   - Fields: Device (dropdown), Category (dropdown), SKU, Product Name, Description,
     Base Cost (number), Suggested Price (number), Estimated Time (min), Warranty Days (default 180)
   - Active toggle
   - "Save" → POST /api/v1/hq/catalog (new) or PATCH /api/v1/hq/catalog/:id (edit)
   - "Delete" → DELETE /api/v1/hq/catalog/:id

4. Sub-sections (simple lists with add capability):
   - Brands: GET/POST /api/v1/hq/brands
   - Devices: GET/POST /api/v1/hq/devices
   - Categories: GET/POST /api/v1/hq/categories
```

**API endpoints (already implemented):**
- `GET /api/v1/hq/catalog` — list all products (with device/category/brand joins)
- `POST /api/v1/hq/catalog` — create product
- `PATCH /api/v1/hq/catalog/:id` — update product
- `DELETE /api/v1/hq/catalog/:id` — soft delete
- `GET/POST /api/v1/hq/brands`, `/devices`, `/categories`

---

### C5. HQ MerchantManagement `/hq/merchants` — `src/pages/hq/MerchantManagement.jsx`
**Currently:** 10-line stub
**Required:** Merchant list with tabs per PRD Section 7.3

**Implementation spec:**
```
Layout:
1. Header: "Merchant Management"

2. Tabs: All | Pending | Active | Suspended
   - Each tab filters by status
   - GET /api/v1/hq/merchants?status={tab}

3. Table:
   - Columns: Shop Name, City/County, Email, Status, Rating, Joined Date, Actions
   - Status badges: pending (yellow), active (green), suspended (red)
   - Actions:
     - Pending → "Activate" button → POST /api/v1/hq/merchants/:id/activate
     - Active → "Suspend" button → POST /api/v1/hq/merchants/:id/suspend
     - Suspended → "Activate" button → POST /api/v1/hq/merchants/:id/activate

4. Click row → expand detail (or modal):
   - Full merchant info, active products count, booking stats
   - GET /api/v1/hq/merchants/:id
```

---

### C6. HQ CommissionRules `/hq/commission` — `src/pages/hq/CommissionRules.jsx`
**Currently:** 10-line stub
**Required:** Commission rules editor per PRD Section 7.3

**Implementation spec:**
```
Layout:
1. Header: "Commission Rules" + "Add Rule" button

2. Rules Table:
   - Columns: Name, Rate (%), Scope, Date Range, Priority, Status, Actions
   - Scope display: "Global" / "Region: Dublin" / "Merchant: O'Neill's"
   - Actions: Edit, Delete (deactivate)
   - GET /api/v1/hq/commission/rules

3. Add/Edit Rule Modal:
   - Name (text input)
   - Rate (number input 0–15, or range slider)
   - Scope Type: dropdown (Global / Region / Merchant)
     - If Region: County dropdown (Dublin, Cork, Galway, etc.)
     - If Merchant: merchant search/select
   - Start Date (date input, optional)
   - End Date (date input, optional)
   - Priority (number input)
   - Active toggle
   - "Save" → POST /api/v1/hq/commission/rules or PATCH .../rules/:id

Business rule reminder: Resolution = highest priority wins; merchant > region > global
```

---

### C7. HQ Finance `/hq/finance` — `src/pages/hq/Finance.jsx`
**Currently:** 10-line stub
**Required:** Finance ledger with 3 tabs per PRD Section 7.3

**Implementation spec:**
```
Layout:
1. Summary Cards (top):
   - Total Deposits This Month (€)
   - Total Commission Earned (€)
   - Outstanding Settlements (€)

2. Date Range Filter: From date — To date — "Filter" button

3. Tabs: Deposits | Commissions | Warranty Settlements

4. Deposits Tab:
   - Columns: Date, Booking#, Customer, Amount (€), Status (paid/refunded/forfeited)
   - GET /api/v1/hq/finance/deposits?from=&to=

5. Commissions Tab:
   - Columns: Date, Booking#, Merchant, Service Price (€), Rate (%), Commission (€)
   - GET /api/v1/hq/finance/commissions?from=&to=

6. Warranty Settlements Tab:
   - Columns: Date, Claim#, Original Shop, Servicing Shop, Amount (€), Status
   - Actions on pending: Approve / Reject / Settle
   - GET /api/v1/hq/finance/settlements
   - POST /api/v1/hq/warranty-claims/:id/approve|reject|settle
```

---

## 2. Phase D Tasks / Phase D 任务

### D1. Database Migration
```bash
cd server
cp .env.example .env
# Edit .env with real PostgreSQL credentials
npx prisma migrate dev --name init
npx prisma generate
```

### D2. Create Seed Script — `server/prisma/seed.js`
**Must create sample data:**
```javascript
// Data to seed:
// 1 HQ admin: admin@ira.ie / admin123
// 3 merchants (with business hours, slot config, photos):
//   - "O'Neill's Repairs" (Dublin, slug: oneills-dublin)
//   - "CorkFix Mobile" (Cork, slug: corkfix-mobile)
//   - "Galway Phone Clinic" (Galway, slug: galway-phone-clinic)
// 6 brands: Apple, Samsung, Google, Huawei, Xiaomi, OnePlus
// 15 devices: 2-3 per brand (e.g. iPhone 15 Pro, iPhone 14, Galaxy S24 Ultra...)
// 5 categories: Screen Replacement, Battery Replacement, Charging Port, Water Damage, Back Glass
// 30 master_products: combinations of device × category
// 60 merchant_products: each merchant enables ~20 products with custom prices
// 5 sample customers
// 10 sample bookings (mix of confirmed, checked_in, completed, no_show)
// 5 warranties (from completed bookings)
// 3 commission rules (1 global 10%, 1 Dublin region 5%, 1 merchant-specific 0%)
// 5 reviews
```

**Add to `server/package.json`:**
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

### D3. Connect Frontend to Real APIs
**Pattern used across all pages:**
```javascript
// Current pattern (already in most pages):
useEffect(() => {
  const load = async () => {
    try {
      const res = await clientAPI.get('/endpoint');
      setData(res.data?.data || res.data);
    } catch {
      setData(mockData); // fallback for demo
    }
  };
  load();
}, []);
```

**Pages needing API connection (currently mock-only):**
- `Dashboard.jsx` — needs `GET /merchant/dashboard/today` + `/dashboard/stats`
- `Calendar.jsx` — needs `GET /merchant/bookings?date_from=&date_to=`

**Pages already connected (have try/catch with API + mock fallback):**
- LoginPage, SearchPage, ShopPage, BookingFlow, BookingConfirmation, MyBookings, WarrantyWallet
- MerchantLogin, Orders, Pricing, ScanCheckIn

### D4. Error Handling & Loading States
- Add `LoadingSpinner` component (already exists at `src/components/shared/LoadingSpinner.jsx`) to all pages during data fetch
- Add error state display (red alert banner) when API fails and no mock fallback
- Add empty state display when data arrays are empty

### D5. Responsive Design Pass
- Customer pages are already mobile-first (max-width: 480px container)
- Merchant/HQ pages need responsive breakpoints for tablet
- Test all pages at 375px, 768px, 1024px, 1440px widths

---

## 3. Coding Conventions / 编码规范

### Frontend Patterns (MUST follow for consistency):

**1. Inline styles with `s` object:**
```javascript
const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  card: { padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', background: 'var(--bg-card)' },
  // ... etc
};
```

**2. CSS variables from `brand-design.css`:**
```
--bg-deep: #0A0D11          (page background)
--bg-sidebar: #121418       (sidebar/card background)
--bg-card: rgba(255,255,255,0.02)  (card background)
--primary-green: #00D084    (brand accent)
--border-muted: rgba(255,255,255,0.08)
--text-main: #FFFFFF
--text-muted: #8E95A2
--input-bg: rgba(0,0,0,0.3)
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 20px
```

**3. Page wrapper pattern:**
```jsx
export default function PageName() {
  return (
    <div className="animate-up">
      <h2 style={s.heading}>Page Title</h2>
      {/* content */}
    </div>
  );
}
```

**4. Status badge pattern:**
```javascript
const statusColors = {
  active:    { bg: 'rgba(0,208,132,0.15)',  color: '#00D084' },
  pending:   { bg: 'rgba(234,179,8,0.15)',  color: '#EAB308' },
  suspended: { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  expired:   { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
};
```

**5. API call pattern:**
```javascript
import { merchantAPI } from '../../api/client';  // or clientAPI, hqAPI

useEffect(() => {
  const load = async () => {
    try {
      const res = await merchantAPI.get('/endpoint');
      setData(res.data?.data || res.data || []);
    } catch {
      setData(mockData); // always provide mock fallback for demo mode
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);
```

**6. Button styles:**
```javascript
// Primary green button
{ background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none',
  padding: '10px 24px', borderRadius: 20, cursor: 'pointer' }

// Ghost/outline button
{ padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)',
  background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }
```

**7. Modal pattern:**
```jsx
{showModal && (
  <div style={s.overlay} onClick={() => setShowModal(false)}>
    <div style={s.modal} onClick={e => e.stopPropagation()}>
      <h3>Modal Title</h3>
      {/* form fields */}
      <div style={s.modalActions}>
        <button onClick={() => setShowModal(false)} style={s.ghostBtn}>Cancel</button>
        <button onClick={handleSave} style={s.primaryBtn}>Save</button>
      </div>
    </div>
  </div>
)}

// Overlay: fixed inset-0, rgba(0,0,0,0.6), flex center, z-index 1000
// Modal: bg-sidebar, border, border-radius-lg, padding 28, max-width 600, max-height 80vh overflow-y auto
```

**8. Table pattern (HQ pages):**
```jsx
<div style={s.tableWrap}>
  <div style={s.tableHeader}>
    <span>Column 1</span><span>Column 2</span>...
  </div>
  {items.map(item => (
    <div key={item.id} style={s.tableRow}>
      <span>{item.field1}</span><span>{item.field2}</span>...
    </div>
  ))}
</div>
```

---

## 4. Backend Reference / 后端参考

### Route file locations:
```
server/src/routes/client/   → auth, browse, shop, booking, warranty
server/src/routes/merchant/ → auth, dashboard, catalog, booking, warranty, settings
server/src/routes/hq/       → auth, catalog, merchant, commission, finance
```

### Service files:
```
server/src/services/booking.service.js     (211 lines)
server/src/services/commission.service.js  (91 lines)
server/src/services/warranty.service.js    (93 lines)
server/src/services/stripe.service.js      (110 lines)
```

### API response format (consistent across all endpoints):
```javascript
// Success
res.json({ success: true, data: { ... } });

// List
res.json({ success: true, data: [...], total: N });

// Error
res.status(4xx).json({ success: false, error: 'message' });
```

### Prisma schema: `server/prisma/schema.prisma` (356 lines, 18 models)
Key models: `customer`, `merchant`, `master_product`, `merchant_product`, `booking`, `deposit`, `warranty`, `warranty_claim`, `commission_rule`, `commission_ledger`, `review`

---

## 5. How to Run / 如何运行

```bash
# Install dependencies (if not done)
npm install && cd server && npm install && cd ..

# Frontend dev server (port 5173)
npm run dev

# Backend dev server (port 3001) — in separate terminal
cd server && npm run dev

# Database setup (requires PostgreSQL running)
cd server
cp .env.example .env   # edit with real DB credentials
npx prisma migrate dev --name init
npx prisma db seed     # after seed.js is created
npx prisma studio      # visual DB browser at localhost:5555
```

---

## 6. Priority Order for Remaining Work / 剩余工作优先顺序

```
1. [MUST] Commit existing unstaged work (14 files of Phase C)
2. [MUST] Implement 7 remaining frontend pages (Phase C):
   a. HQLogin        → simple, 5 min
   b. Settings        → medium, 15 min
   c. WarrantyClaims  → medium, 10 min
   d. MasterCatalog   → complex, 20 min
   e. MerchantManagement → medium, 15 min
   f. CommissionRules → medium, 15 min
   g. Finance         → medium, 15 min
3. [MUST] Create seed script (Phase D2)
4. [SHOULD] Connect Dashboard + Calendar to real APIs (Phase D3)
5. [SHOULD] Add loading spinners + error states (Phase D4)
6. [NICE] Responsive design pass (Phase D5)
7. [NICE] Run Prisma migration + end-to-end test (Phase D1)
```

---

*Document Version: 1.0*
*Created: 2026-03-31*
*Status: Phase C in progress — 7 pages remaining, then Phase D*
