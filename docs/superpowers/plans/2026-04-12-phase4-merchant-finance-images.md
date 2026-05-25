# Phase 4: Merchant Finance Reports + Logo/Cover Image Upload

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add monthly finance reports for merchants and admin, plus logo/cover image upload for merchant settings.

**Architecture:** Finance reports query the existing `commission_ledger` table (populated by the booking-complete route) and `repair_bookings` table; a new upload API route accepts multipart form data and delegates to the existing `lib/storage.ts` (GCS). All new pages follow the `"use client"` + `useEffect` fetch pattern used throughout the codebase.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Neon PostgreSQL, `@google-cloud/storage` (already installed), Vitest (install in step 1 if Phase 3 didn't already do it), shadcn/ui, Tailwind CSS.

---

## File Map

**New files:**
- `ierepair/app/api/v1/merchant/finance/route.ts` — GET `?month=YYYY-MM`, returns merchant monthly finance summary
- `ierepair/app/api/v1/admin/finance/route.ts` — GET `?month=YYYY-MM`, returns cross-merchant finance aggregate
- `ierepair/app/api/v1/merchant/upload/route.ts` — POST multipart, uploads logo/cover image to GCS, updates merchant record
- `ierepair/app/merchant/(protected)/finance/page.tsx` — Merchant finance UI (Client Component)
- `ierepair/app/admin/finance/page.tsx` — Admin finance UI (Client Component)
- `ierepair/__tests__/api/merchant-finance.test.ts` — Vitest tests for merchant finance API
- `ierepair/__tests__/api/admin-finance.test.ts` — Vitest tests for admin finance API

**Modified files:**
- `ierepair/app/merchant/(protected)/layout.tsx` — add "Finance" link to sidebar
- `ierepair/app/admin/layout.tsx` — add "Finance" link to sidebar
- `ierepair/app/merchant/(protected)/settings/page.tsx` — add logo/cover image upload UI
- `ierepair/app/api/v1/merchant/settings/route.ts` — add `logoUrl`/`coverUrl` to PATCH handler

---

## Task 1: Vitest Setup (if not done in Phase 3)

**Files:**
- Create: `ierepair/vitest.config.ts`
- Modify: `ierepair/package.json` (add test script + devDependencies)

- [ ] **Step 1: Check if vitest is already installed**

```bash
cd ierepair
cat package.json | grep vitest
```

If output is empty, proceed with steps 2–5. If vitest is already installed, skip to Task 2.

- [ ] **Step 2: Install vitest and related packages**

```bash
cd ierepair
npm install --save-dev vitest @vitejs/plugin-react vite-tsconfig-paths
```

Expected: packages added to `node_modules`

- [ ] **Step 3: Create vitest config**

Create `ierepair/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
    coverage: { reporter: ["text", "json"] },
  },
});
```

- [ ] **Step 4: Add test script to package.json**

Open `ierepair/package.json` and add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create `__tests__` directory**

```bash
mkdir -p ierepair/__tests__/api
```

Expected: directories created

---

## Task 2: Merchant Finance API

**Files:**
- Create: `ierepair/app/api/v1/merchant/finance/route.ts`
- Create: `ierepair/__tests__/api/merchant-finance.test.ts`

- [ ] **Step 1: Write the failing test**

Create `ierepair/__tests__/api/merchant-finance.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock auth before importing route
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { GET } from "@/app/api/v1/merchant/finance/route";
import { NextRequest } from "next/server";

function makeRequest(month?: string) {
  const url = month
    ? `http://localhost/api/v1/merchant/finance?month=${month}`
    : "http://localhost/api/v1/merchant/finance";
  return new NextRequest(url);
}

describe("GET /api/v1/merchant/finance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 401 when role is not merchant", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: "admin", merchantId: null } } as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 when month param format is invalid", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "merchant", merchantId: "m1" },
    } as never);
    const res = await GET(makeRequest("not-a-month"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/invalid month/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ierepair
npx vitest run __tests__/api/merchant-finance.test.ts
```

Expected: FAIL with "Cannot find module" or "GET is not a function" — the route doesn't exist yet.

- [ ] **Step 3: Create the merchant finance API route**

Create `ierepair/app/api/v1/merchant/finance/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commissionLedger } from "@/lib/db/schema/commission";
import { repairBookings } from "@/lib/db/schema/bookings";
import { and, gte, lt, eq, count, desc, isNull, sql } from "drizzle-orm";

function parseMonth(raw: string | null): { start: Date; end: Date; label: string } | null {
  const m = (raw ?? new Date().toISOString().slice(0, 7)).match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo] = m.map(Number);
  if (mo < 1 || mo > 12) return null;
  return {
    start: new Date(y, mo - 1, 1),
    end:   new Date(y, mo, 1),
    label: raw ?? new Date().toISOString().slice(0, 7),
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const monthParam = request.nextUrl.searchParams.get("month");
  const range = parseMonth(monthParam);
  if (!range) {
    return NextResponse.json({ success: false, error: "Invalid month — use YYYY-MM" }, { status: 400 });
  }

  const merchantId = session.user.merchantId!;
  const { start: startDate, end: endDate, label: month } = range;

  const whereClause = and(
    eq(commissionLedger.merchantId, merchantId),
    gte(commissionLedger.createdAt, startDate),
    lt(commissionLedger.createdAt, endDate),
  );

  // Aggregate totals
  const [totals] = await db
    .select({
      repairRevenue:    sql<string>`COALESCE(SUM(${commissionLedger.grossAmount}), '0')`,
      commissionAmount: sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
      netAmount:        sql<string>`COALESCE(SUM(${commissionLedger.netAmount}), '0')`,
      completedBookings: count(),
    })
    .from(commissionLedger)
    .where(whereClause);

  // Unsettled commissions
  const [pending] = await db
    .select({
      pendingSettlement: sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
    })
    .from(commissionLedger)
    .where(and(whereClause, isNull(commissionLedger.settledAt)));

  // Deposit collected from bookings with depositPaid = true
  const [depAgg] = await db
    .select({
      depositCollected: sql<string>`COALESCE(SUM(${repairBookings.depositAmount}), '0')`,
    })
    .from(repairBookings)
    .where(and(
      eq(repairBookings.merchantId, merchantId),
      eq(repairBookings.depositPaid, true),
      gte(repairBookings.updatedAt, startDate),
      lt(repairBookings.updatedAt, endDate),
    ));

  // Individual ledger entries with bookingRef
  const entries = await db
    .select({
      id:               commissionLedger.id,
      bookingRef:       repairBookings.bookingRef,
      grossAmount:      commissionLedger.grossAmount,
      commissionAmount: commissionLedger.commissionAmount,
      netAmount:        commissionLedger.netAmount,
      settledAt:        commissionLedger.settledAt,
      createdAt:        commissionLedger.createdAt,
    })
    .from(commissionLedger)
    .leftJoin(repairBookings, eq(commissionLedger.bookingId, repairBookings.id))
    .where(whereClause)
    .orderBy(desc(commissionLedger.createdAt));

  return NextResponse.json({
    success: true,
    data: {
      month,
      repairRevenue:     totals?.repairRevenue     ?? "0",
      commissionAmount:  totals?.commissionAmount  ?? "0",
      netAmount:         totals?.netAmount         ?? "0",
      completedBookings: totals?.completedBookings ?? 0,
      pendingSettlement: pending?.pendingSettlement ?? "0",
      depositCollected:  depAgg?.depositCollected  ?? "0",
      entries,
    },
  });
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
cd ierepair
npx vitest run __tests__/api/merchant-finance.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ierepair
git add app/api/v1/merchant/finance/route.ts __tests__/api/merchant-finance.test.ts vitest.config.ts package.json
git commit -m "feat: add merchant finance summary API"
```

---

## Task 3: Merchant Finance UI Page

**Files:**
- Create: `ierepair/app/merchant/(protected)/finance/page.tsx`
- Modify: `ierepair/app/merchant/(protected)/layout.tsx`

- [ ] **Step 1: Add Finance link to merchant sidebar**

Open `ierepair/app/merchant/(protected)/layout.tsx`.

Find the `<nav>` block and add the Finance link after Settings:

```tsx
// Before (the nav block):
<nav className="flex-1 py-4 px-3 space-y-1">
  <SidebarLink href="/merchant/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
  <SidebarLink href="/merchant/bookings"  icon={<CalendarClock size={18} />}  label="Bookings" />
  <SidebarLink href="/merchant/products"  icon={<Package size={18} />}        label="My Products" />
  <SidebarLink href="/merchant/products/catalog" icon={<Wrench size={18} />}  label="Browse Catalog" />
  <SidebarLink href="/merchant/settings"  icon={<Settings size={18} />}       label="Settings" />
</nav>
```

```tsx
// After (add BarChart3 to imports and the Finance link):
import { LayoutDashboard, Package, CalendarClock, Settings, LogOut, Wrench, BarChart3 } from "lucide-react";

// ...in the nav:
<nav className="flex-1 py-4 px-3 space-y-1">
  <SidebarLink href="/merchant/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
  <SidebarLink href="/merchant/bookings"  icon={<CalendarClock size={18} />}  label="Bookings" />
  <SidebarLink href="/merchant/products"  icon={<Package size={18} />}        label="My Products" />
  <SidebarLink href="/merchant/products/catalog" icon={<Wrench size={18} />}  label="Browse Catalog" />
  <SidebarLink href="/merchant/finance"   icon={<BarChart3 size={18} />}      label="Finance" />
  <SidebarLink href="/merchant/settings"  icon={<Settings size={18} />}       label="Settings" />
</nav>
```

- [ ] **Step 2: Create the merchant finance page**

Create `ierepair/app/merchant/(protected)/finance/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, Clock } from "lucide-react";

interface FinanceEntry {
  id: string;
  bookingRef: string | null;
  grossAmount: string;
  commissionAmount: string;
  netAmount: string;
  settledAt: string | null;
  createdAt: string;
}

interface FinanceSummary {
  month: string;
  repairRevenue: string;
  commissionAmount: string;
  netAmount: string;
  completedBookings: number;
  pendingSettlement: string;
  depositCollected: string;
  entries: FinanceEntry[];
}

function fmt(n: string) {
  return `€${parseFloat(n).toFixed(2)}`;
}

export default function MerchantFinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth]     = useState(currentMonth);
  const [data, setData]       = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/merchant/finance?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        setLoading(false);
      });
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Finance</h1>
        <input
          type="month"
          value={month}
          max={currentMonth}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      )}

      {!loading && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp size={14} /> Repair Revenue
                </div>
                <div className="text-2xl font-bold">{fmt(data.repairRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{data.completedBookings} repairs</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingDown size={14} /> Platform Commission
                </div>
                <div className="text-2xl font-bold text-destructive">{fmt(data.commissionAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet size={14} /> Net Payout
                </div>
                <div className="text-2xl font-bold text-primary">{fmt(data.netAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock size={14} /> Pending Settlement
                </div>
                <div className="text-2xl font-bold text-yellow-400">{fmt(data.pendingSettlement)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Commission owed to platform</div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit collected note */}
          {parseFloat(data.depositCollected) > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              Online deposits collected this month: <span className="text-primary font-semibold">{fmt(data.depositCollected)}</span>
              <span className="ml-2 text-xs">(held by platform, deducted from commission due)</span>
            </div>
          )}

          {/* Ledger entries */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Transaction Ledger
            </h2>

            {data.entries.length === 0 && (
              <div className="bg-card rounded-2xl border border-border text-center py-10 text-muted-foreground text-sm">
                No completed repairs this month
              </div>
            )}

            {data.entries.length > 0 && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Booking</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">Commission</th>
                      <th className="text-right px-4 py-3">Net</th>
                      <th className="text-left px-4 py-3">Settled</th>
                      <th className="text-left px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.entries.map((e) => (
                      <tr key={e.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{e.bookingRef ?? "—"}</td>
                        <td className="px-4 py-3 text-right">{fmt(e.grossAmount)}</td>
                        <td className="px-4 py-3 text-right text-destructive">{fmt(e.commissionAmount)}</td>
                        <td className="px-4 py-3 text-right text-primary font-medium">{fmt(e.netAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                            e.settledAt
                              ? "bg-primary/15 text-primary"
                              : "bg-yellow-500/15 text-yellow-400"
                          }`}>
                            {e.settledAt ? "Settled" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(e.createdAt).toLocaleDateString("en-IE")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify the page renders (dev server)**

```bash
cd ierepair
npm run dev &
# Wait 5 seconds for Next.js to compile
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/merchant/finance
```

Expected: `307` (redirect to login — not authenticated, which is correct behaviour for the auth guard)

- [ ] **Step 4: Commit**

```bash
cd ierepair
git add app/merchant/(protected)/finance/page.tsx app/merchant/(protected)/layout.tsx
git commit -m "feat: merchant finance report page and sidebar link"
```

---

## Task 4: Admin Finance API

**Files:**
- Create: `ierepair/app/api/v1/admin/finance/route.ts`
- Create: `ierepair/__tests__/api/admin-finance.test.ts`

- [ ] **Step 1: Write the failing test**

Create `ierepair/__tests__/api/admin-finance.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { GET } from "@/app/api/v1/admin/finance/route";
import { NextRequest } from "next/server";

function makeRequest(month?: string) {
  const url = month
    ? `http://localhost/api/v1/admin/finance?month=${month}`
    : "http://localhost/api/v1/admin/finance";
  return new NextRequest(url);
}

describe("GET /api/v1/admin/finance", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("returns 401 when role is merchant (not admin)", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "merchant", merchantId: "m1" },
    } as never);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid month format", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: "admin" },
    } as never);
    const res = await GET(makeRequest("2026/04"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid month/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd ierepair
npx vitest run __tests__/api/admin-finance.test.ts
```

Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Create the admin finance API route**

Create `ierepair/app/api/v1/admin/finance/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commissionLedger } from "@/lib/db/schema/commission";
import { merchants } from "@/lib/db/schema/merchants";
import { and, gte, lt, eq, count, desc, sql } from "drizzle-orm";

function parseMonth(raw: string | null): { start: Date; end: Date; label: string } | null {
  const m = (raw ?? new Date().toISOString().slice(0, 7)).match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo] = m.map(Number);
  if (mo < 1 || mo > 12) return null;
  return {
    start: new Date(y, mo - 1, 1),
    end:   new Date(y, mo, 1),
    label: raw ?? new Date().toISOString().slice(0, 7),
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const monthParam = request.nextUrl.searchParams.get("month");
  const range = parseMonth(monthParam);
  if (!range) {
    return NextResponse.json({ success: false, error: "Invalid month — use YYYY-MM" }, { status: 400 });
  }

  const { start: startDate, end: endDate, label: month } = range;

  const inMonth = and(
    gte(commissionLedger.createdAt, startDate),
    lt(commissionLedger.createdAt, endDate),
  );

  // Platform-wide totals
  const [totals] = await db
    .select({
      totalRepairRevenue:   sql<string>`COALESCE(SUM(${commissionLedger.grossAmount}), '0')`,
      totalCommission:      sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
      totalNetToMerchants:  sql<string>`COALESCE(SUM(${commissionLedger.netAmount}), '0')`,
      completedBookings:    count(),
    })
    .from(commissionLedger)
    .where(inMonth);

  // Per-merchant breakdown sorted by revenue descending
  const perMerchant = await db
    .select({
      merchantId:       commissionLedger.merchantId,
      shopName:         merchants.shopName,
      repairRevenue:    sql<string>`COALESCE(SUM(${commissionLedger.grossAmount}), '0')`,
      commissionAmount: sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
      netAmount:        sql<string>`COALESCE(SUM(${commissionLedger.netAmount}), '0')`,
      completedBookings: count(),
    })
    .from(commissionLedger)
    .leftJoin(merchants, eq(commissionLedger.merchantId, merchants.id))
    .where(inMonth)
    .groupBy(commissionLedger.merchantId, merchants.shopName)
    .orderBy(desc(sql`SUM(${commissionLedger.grossAmount})`));

  return NextResponse.json({
    success: true,
    data: {
      month,
      totalRepairRevenue:  totals?.totalRepairRevenue  ?? "0",
      totalCommission:     totals?.totalCommission     ?? "0",
      totalNetToMerchants: totals?.totalNetToMerchants ?? "0",
      completedBookings:   totals?.completedBookings   ?? 0,
      merchants:           perMerchant,
    },
  });
}
```

- [ ] **Step 4: Run the tests and verify they pass**

```bash
cd ierepair
npx vitest run __tests__/api/admin-finance.test.ts
```

Expected: 3 tests PASS

- [ ] **Step 5: Commit**

```bash
cd ierepair
git add app/api/v1/admin/finance/route.ts __tests__/api/admin-finance.test.ts
git commit -m "feat: add admin finance summary API"
```

---

## Task 5: Admin Finance UI Page

**Files:**
- Create: `ierepair/app/admin/finance/page.tsx`
- Modify: `ierepair/app/admin/layout.tsx`

- [ ] **Step 1: Add Finance link to admin sidebar**

Open `ierepair/app/admin/layout.tsx`.

Add `BarChart3` to imports and insert the Finance nav link:

```tsx
// Change this import:
import { Store, Package, Tag, ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
// To:
import { Store, Package, Tag, ShieldCheck, LogOut, LayoutDashboard, BarChart3 } from "lucide-react";
```

```tsx
// In the nav block, add Finance link after Categories:
<nav className="flex-1 py-4 px-3 space-y-1">
  <SidebarLink href="/admin/merchants"  icon={<Store size={18} />}       label="Merchants" />
  <SidebarLink href="/admin/products"   icon={<Package size={18} />}     label="Product Library" />
  <SidebarLink href="/admin/categories" icon={<Tag size={18} />}         label="Categories" />
  <SidebarLink href="/admin/finance"    icon={<BarChart3 size={18} />}   label="Finance" />
</nav>
```

- [ ] **Step 2: Create the admin finance page**

Create `ierepair/app/admin/finance/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";

interface MerchantRow {
  merchantId: string;
  shopName: string | null;
  repairRevenue: string;
  commissionAmount: string;
  netAmount: string;
  completedBookings: number;
}

interface AdminFinanceSummary {
  month: string;
  totalRepairRevenue: string;
  totalCommission: string;
  totalNetToMerchants: string;
  completedBookings: number;
  merchants: MerchantRow[];
}

function fmt(n: string) {
  return `€${parseFloat(n).toFixed(2)}`;
}

export default function AdminFinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth]     = useState(currentMonth);
  const [data, setData]       = useState<AdminFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/admin/finance?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        setLoading(false);
      });
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Platform Finance</h1>
        <input
          type="month"
          value={month}
          max={currentMonth}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      )}

      {!loading && data && (
        <>
          {/* Platform totals */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp size={14} /> Total Revenue
                </div>
                <div className="text-2xl font-bold">{fmt(data.totalRepairRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{data.completedBookings} repairs</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet size={14} /> Platform Commission
                </div>
                <div className="text-2xl font-bold text-primary">{fmt(data.totalCommission)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingDown size={14} /> Paid to Merchants
                </div>
                <div className="text-2xl font-bold text-muted-foreground">{fmt(data.totalNetToMerchants)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <CheckCircle2 size={14} /> Active Merchants
                </div>
                <div className="text-2xl font-bold">{data.merchants.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Per-merchant breakdown */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Merchant Breakdown
            </h2>

            {data.merchants.length === 0 && (
              <div className="bg-card rounded-2xl border border-border text-center py-10 text-muted-foreground text-sm">
                No completed repairs this month
              </div>
            )}

            {data.merchants.length > 0 && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Shop</th>
                      <th className="text-right px-4 py-3">Repairs</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">Commission</th>
                      <th className="text-right px-4 py-3">Net to Merchant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.merchants.map((m) => (
                      <tr key={m.merchantId} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{m.shopName ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{m.completedBookings}</td>
                        <td className="px-4 py-3 text-right">{fmt(m.repairRevenue)}</td>
                        <td className="px-4 py-3 text-right text-primary font-medium">{fmt(m.commissionAmount)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmt(m.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify admin finance page compiles**

```bash
cd ierepair
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/finance
```

Expected: `307` (redirect to admin login — auth guard working)

- [ ] **Step 4: Commit**

```bash
cd ierepair
git add app/admin/finance/page.tsx app/admin/layout.tsx
git commit -m "feat: admin platform finance page and sidebar link"
```

---

## Task 6: Logo and Cover Image Upload

**Files:**
- Create: `ierepair/app/api/v1/merchant/upload/route.ts`
- Modify: `ierepair/app/merchant/(protected)/settings/page.tsx`
- Modify: `ierepair/app/api/v1/merchant/settings/route.ts`

GCS setup: the project already has `@google-cloud/storage` installed and `GCS_BUCKET_NAME` / `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local`. The existing `lib/storage.ts` provides `uploadFile(buffer, mimeType, folder)` and returns a public URL. The merchant folder in the bucket (`merchants/`) is used for logo and cover images.

**Prerequisite:** Ensure the GCS bucket has public read access or uniform bucket-level access configured so uploaded images are accessible via the public URL. Run:

```bash
gsutil iam ch allUsers:objectViewer gs://$GCS_BUCKET_NAME
```

- [ ] **Step 1: Create the image upload API route**

Create `ierepair/app/api/v1/merchant/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const type = form.get("type") as string | null;

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  if (!["logo", "cover"].includes(type ?? "")) {
    return NextResponse.json({ success: false, error: "type must be 'logo' or 'cover'" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Only JPEG, PNG or WebP allowed" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url    = await uploadFile(buffer, file.type, "merchants");

  return NextResponse.json({ success: true, data: { url } });
}
```

Note: The upload route returns the GCS URL only. The settings PATCH is called separately to persist `logoUrl` or `coverUrl`. This keeps the upload route small and reusable.

- [ ] **Step 2: Add `logoUrl`/`coverUrl` to merchant settings PATCH handler**

Open `ierepair/app/api/v1/merchant/settings/route.ts`.

In the `PATCH` handler, add destructuring and update for `logoUrl` and `coverUrl`:

```typescript
// Change this destructuring:
const {
  shopName, phone, description, address, city, eircode,
  businessHours, slotDurationMin, maxAdvanceDays,
} = body;

// To:
const {
  shopName, phone, description, address, city, eircode,
  businessHours, slotDurationMin, maxAdvanceDays,
  logoUrl, coverUrl,
} = body;
```

And add the conditional updates immediately after the existing ones (before the eircode geocoding block):

```typescript
// After the maxAdvanceDays line:
if (logoUrl  !== undefined) updates.logoUrl  = logoUrl;
if (coverUrl !== undefined) updates.coverUrl = coverUrl;
```

- [ ] **Step 3: Add image upload UI to settings page**

Open `ierepair/app/merchant/(protected)/settings/page.tsx`.

Replace the entire file with the version below, which adds the image upload section at the top of the form. Key changes:
- `form` state adds `logoUrl` and `coverUrl`
- `useRef` for hidden file inputs
- `uploading` state tracks which image is uploading
- `handleUpload` POSTs to `/api/v1/merchant/upload` then PATCHes the URL to `/api/v1/merchant/settings`

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ImageIcon } from "lucide-react";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const DAY_LABELS: Record<string, string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

interface Hours { [day: string]: { open: boolean; from: string; to: string } }

export default function MerchantSettingsPage() {
  const [loading, setSLoading] = useState(true);
  const [saving, setSaving]    = useState(false);
  const [saved, setSaved]      = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  const [form, setForm] = useState({
    shopName: "", phone: "", description: "", address: "", city: "", eircode: "",
    slotDurationMin: 30, maxAdvanceDays: 14,
    logoUrl: "", coverUrl: "",
  });
  const [hours, setHours] = useState<Hours>(() =>
    Object.fromEntries(DAYS.map((d) => [d, { open: d !== "sun", from: "09:00", to: "18:00" }]))
  );

  const logoInputRef  = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/v1/merchant/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const m = d.data;
          setForm({
            shopName: m.shopName ?? "", phone: m.phone ?? "",
            description: m.description ?? "", address: m.address ?? "",
            city: m.city ?? "", eircode: m.eircode ?? "",
            slotDurationMin: m.slotDurationMin ?? 30, maxAdvanceDays: m.maxAdvanceDays ?? 14,
            logoUrl: m.logoUrl ?? "", coverUrl: m.coverUrl ?? "",
          });
          if (m.businessHours) setHours(m.businessHours);
        }
        setSLoading(false);
      });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);

    // 1. Upload the file to GCS
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const uploadRes  = await fetch("/api/v1/merchant/upload", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();

    if (uploadData.success) {
      const url = uploadData.data.url as string;

      // 2. Persist the URL via settings PATCH
      await fetch("/api/v1/merchant/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "logo" ? { logoUrl: url } : { coverUrl: url }),
      });

      setForm((f) => ({ ...f, [type === "logo" ? "logoUrl" : "coverUrl"]: url }));
    }

    setUploading(null);
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);
    const { logoUrl: _l, coverUrl: _c, ...textFields } = form;
    await fetch("/api/v1/merchant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...textFields, businessHours: hours }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold">Shop Settings</h1>

      {saved && (
        <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} />Settings saved successfully
        </div>
      )}

      {/* Brand images */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Brand Images</h2>

        {/* Logo */}
        <div className="flex items-center gap-4">
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-border">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
          )}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={!!uploading}
              className="border-border h-9 text-sm"
            >
              {uploading === "logo" ? "Uploading…" : "Change Logo"}
            </Button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleUpload(e, "logo")}
            />
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG or WebP · Max 5 MB</p>
          </div>
        </div>

        {/* Cover */}
        <div className="space-y-2">
          <Label className="text-sm">Cover Image</Label>
          {form.coverUrl ? (
            <img src={form.coverUrl} alt="Cover" className="w-full h-32 rounded-xl object-cover border border-border" />
          ) : (
            <div className="w-full h-32 rounded-xl bg-secondary flex items-center justify-center border border-border">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => coverInputRef.current?.click()}
            disabled={!!uploading}
            className="border-border h-9 text-sm"
          >
            {uploading === "cover" ? "Uploading…" : "Change Cover"}
          </Button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleUpload(e, "cover")}
          />
          <p className="text-xs text-muted-foreground">Displayed as the shop's cover photo · JPEG, PNG or WebP · Max 5 MB</p>
        </div>
      </section>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Shop Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Shop Name</Label>
            <Input value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Eircode</Label>
            <Input value={form.eircode} onChange={(e) => setForm((f) => ({ ...f, eircode: e.target.value.toUpperCase() }))}
              placeholder="D01 A234" className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div className="col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="mt-1 bg-secondary border-border resize-none" />
          </div>
        </div>
      </section>

      {/* Booking config */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Booking Config</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slot Duration (minutes)</Label>
            <Input type="number" value={form.slotDurationMin}
              onChange={(e) => setForm((f) => ({ ...f, slotDurationMin: parseInt(e.target.value) }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Max Advance Days</Label>
            <Input type="number" value={form.maxAdvanceDays}
              onChange={(e) => setForm((f) => ({ ...f, maxAdvanceDays: parseInt(e.target.value) }))}
              className="mt-1 bg-secondary border-border" />
          </div>
        </div>
      </section>

      {/* Business hours */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Business Hours</h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4 px-4 py-3">
              <label className="flex items-center gap-2 w-24 cursor-pointer">
                <input type="checkbox" checked={hours[day]?.open ?? false}
                  onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.checked } }))}
                  className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
              </label>
              {hours[day]?.open ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input type="time" value={hours[day].from}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], from: e.target.value } }))}
                    className="bg-secondary border-border h-8 text-sm w-28" />
                  <span className="text-muted-foreground text-sm">–</span>
                  <Input type="time" value={hours[day].to}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], to: e.target.value } }))}
                    className="bg-secondary border-border h-8 text-sm w-28" />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving || !!uploading} className="bg-primary text-primary-foreground px-8">
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd ierepair
git add app/api/v1/merchant/upload/route.ts \
        app/merchant/(protected)/settings/page.tsx \
        app/api/v1/merchant/settings/route.ts
git commit -m "feat: logo and cover image upload for merchant settings"
```

---

## Task 7: Build Verification

**Files:** none — verification only

- [ ] **Step 1: Run all Vitest tests**

```bash
cd ierepair
npx vitest run
```

Expected output includes:
```
✓ __tests__/api/merchant-finance.test.ts (3 tests)
✓ __tests__/api/admin-finance.test.ts (3 tests)
Test Files  2 passed (2)
Tests       6 passed (6)
```

If any tests fail, read the error message and fix the offending file before continuing.

- [ ] **Step 2: TypeScript type check**

```bash
cd ierepair
npx tsc --noEmit
```

Expected: zero errors. Common issues and fixes:

| Error | Fix |
|-------|-----|
| `Property 'merchantId' does not exist on type 'User'` | Session types are extended in `lib/auth.ts` — check that `NextAuthUser` includes `merchantId` |
| `Argument of type 'string \| null' is not assignable to 'string'` | Add `?? ""` coalesce or narrowing |
| `Object literal may only specify known properties` | A Drizzle `set()` call has an extra field — remove it or cast |

- [ ] **Step 3: Production build**

```bash
cd ierepair
npm run build
```

Expected: `Route (app)` table prints without errors. All new routes appear:

```
○ /merchant/finance
○ /admin/finance
λ /api/v1/merchant/finance
λ /api/v1/admin/finance
λ /api/v1/merchant/upload
```

If build fails, read the error, fix the specific file, and re-run.

- [ ] **Step 4: Smoke test finance APIs**

Start the dev server if not running:
```bash
cd ierepair
npm run dev &
sleep 5
```

Test that auth guards work (no credentials → 401):

```bash
# Merchant finance API — should return 401 (no auth)
curl -s http://localhost:3000/api/v1/merchant/finance | python3 -m json.tool
# Expected: {"success": false, "error": "Unauthorized"}

# Admin finance API — should return 401 (no auth)
curl -s http://localhost:3000/api/v1/admin/finance | python3 -m json.tool
# Expected: {"success": false, "error": "Unauthorized"}

# Upload API — should return 401 (no auth)
curl -s -X POST http://localhost:3000/api/v1/merchant/upload | python3 -m json.tool
# Expected: {"success": false, "error": "Unauthorized"}
```

- [ ] **Step 5: Test month validation**

```bash
# Invalid month format → 400 (using admin credentials obtained from NextAuth session cookie
# For a quick check, just verify the route is reachable and rejects bad input at the URL level)
curl -s "http://localhost:3000/api/v1/merchant/finance?month=bad-format" | python3 -m json.tool
# Expected: {"success": false, "error": "..."} (401 is fine since unauthenticated)
```

- [ ] **Step 6: Final commit**

```bash
cd ierepair
git add .
git status
# Verify only expected files are staged. Then:
git commit -m "chore: phase 4 build verified — finance reports + image upload"
```

---

## Self-Review Checklist

**Spec coverage check:**

| PRD Requirement | Task |
|-----------------|------|
| 门店财务报表 — 维修收入合计、平台提成、门店实收 | Task 2 (merchant finance page) |
| 按月份切换查看报表 | Task 2 (month picker) |
| 总部全平台收入汇总 + 门店提成明细 | Tasks 4 + 5 (admin finance) |
| 门店可上传 Logo 和 Banner/封面图 | Task 6 |
| Logo 展示在门店官网顶部 (coverUrl already in consumer pages) | `coverUrl` field in merchants schema already used by consumer-facing render |
| Finance sidebar links for both merchant and admin portals | Tasks 3 + 5 (sidebar modifications) |

**No placeholders:** All code blocks are complete — no "TBD" or "fill in later" language.

**Type consistency:**
- `FinanceSummary.entries[].bookingRef` is `string | null` (leftJoin can produce null) — matched in the UI with `?? "—"`
- `MerchantRow.shopName` is `string | null` — matched in the table with `?? "—"`
- `parseMonth()` helper is duplicated in merchant and admin routes (DRY violation) — acceptable here because they're independent routes with no shared import; extracting to a util file would add a dependency that isn't needed elsewhere

**Pending settlement note:** The `settledAt` field in `commission_ledger` starts as `null` and must be set externally (e.g., admin marks it settled via a future route). Phase 4 only reads and displays this data — a future Phase could add a "Mark Settled" button.
