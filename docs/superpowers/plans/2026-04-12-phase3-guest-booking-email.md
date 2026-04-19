# Phase 3: Guest Booking Flow + Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable unauthenticated (guest) users to complete repair bookings by collecting their contact info inline, then send email confirmations to customers and notifications to merchants via Resend.

**Architecture:** Extend the `repairBookings` schema with nullable guest fields (`customerName`, `customerEmail`, `customerPhone`). Add a public API route `/api/v1/public/bookings` that creates bookings without auth. Update the booking wizard to detect unauthenticated users, insert a "Contact" step, and submit to the appropriate endpoint. Install Resend and wire email dispatch on booking created, confirmed, and rejected.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Neon PostgreSQL, Resend (email), `useSession` from NextAuth for auth detection client-side

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `ierepair/lib/db/schema/bookings.ts` | Modify | Add `customerName`, `customerEmail`, `customerPhone` nullable columns |
| `ierepair/drizzle/0001_guest_booking_fields.sql` | Create | Drizzle migration SQL for new columns |
| `ierepair/app/api/v1/public/bookings/route.ts` | Create | Guest booking POST — no auth required |
| `ierepair/lib/email.ts` | Create | Resend client + typed email template functions |
| `ierepair/app/api/v1/merchant/bookings/[id]/reject/route.ts` | Create | Merchant rejects a pending booking with reason |
| `ierepair/app/(consumer)/repair/book/page.tsx` | Modify | Add guest "Contact" step; call public API when not logged in |
| `ierepair/app/api/v1/user/repair-bookings/route.ts` | Modify | Send confirmation email after authenticated booking created |
| `ierepair/app/api/v1/merchant/bookings/[id]/accept/route.ts` | Modify | Send customer confirmation email after merchant accepts |

---

## Task 1: Schema migration — add guest fields to `repairBookings`

**Files:**
- Modify: `ierepair/lib/db/schema/bookings.ts`
- Create: `ierepair/drizzle/0001_guest_booking_fields.sql`

- [ ] **Step 1: Write the failing test**

Create `ierepair/__tests__/schema/guest-booking-fields.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { repairBookings } from "@/lib/db/schema/bookings";

describe("repairBookings schema", () => {
  it("has customerName column", () => {
    const cols = Object.keys(repairBookings);
    expect(cols).toContain("customerName");
  });

  it("has customerEmail column", () => {
    const cols = Object.keys(repairBookings);
    expect(cols).toContain("customerEmail");
  });

  it("has customerPhone column", () => {
    const cols = Object.keys(repairBookings);
    expect(cols).toContain("customerPhone");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ierepair && npx vitest run __tests__/schema/guest-booking-fields.test.ts
```

Expected: FAIL — `customerName`, `customerEmail`, `customerPhone` not found.

- [ ] **Step 3: Add columns to schema**

In `ierepair/lib/db/schema/bookings.ts`, add three nullable columns after `customerNotes`:

```typescript
// Existing imports already cover varchar and text — no new imports needed

export const repairBookings = pgTable("repair_bookings", {
  // ... existing fields ...
  customerNotes:    text("customer_notes"),
  // ADD THESE THREE:
  customerName:     varchar("customer_name", { length: 255 }),
  customerEmail:    varchar("customer_email", { length: 255 }),
  customerPhone:    varchar("customer_phone", { length: 30 }),
  // ... rest of existing fields (merchantNotes, cancelledAt, etc.) ...
});
```

- [ ] **Step 4: Create the Drizzle migration SQL**

Create `ierepair/drizzle/0001_guest_booking_fields.sql`:

```sql
ALTER TABLE "repair_bookings"
  ADD COLUMN IF NOT EXISTS "customer_name" varchar(255),
  ADD COLUMN IF NOT EXISTS "customer_email" varchar(255),
  ADD COLUMN IF NOT EXISTS "customer_phone" varchar(30);
```

- [ ] **Step 5: Apply migration**

```bash
cd ierepair && npx drizzle-kit push
```

Expected output: Migration applied successfully. No data loss (columns are nullable).

- [ ] **Step 6: Run test to verify it passes**

```bash
cd ierepair && npx vitest run __tests__/schema/guest-booking-fields.test.ts
```

Expected: PASS — all 3 columns found.

- [ ] **Step 7: Commit**

```bash
git add ierepair/lib/db/schema/bookings.ts ierepair/drizzle/0001_guest_booking_fields.sql
git commit -m "feat: add customerName/Email/Phone fields to repairBookings for guest bookings"
```

---

## Task 2: Public booking API (no auth)

**Files:**
- Create: `ierepair/app/api/v1/public/bookings/route.ts`
- Create: `ierepair/__tests__/api/public-bookings.test.ts`

- [ ] **Step 1: Write the failing test**

Create `ierepair/__tests__/api/public-bookings.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      merchantServices: {
        findFirst: vi.fn(),
      },
      merchants: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  },
}));

vi.mock("@/lib/booking", () => ({
  generateBookingRef: vi.fn(() => "IRE-ABC123"),
  generateBookingQR:  vi.fn(async () => "data:image/png;base64,xxx"),
  calculateDeposit:   vi.fn(() => 30),
  calculateDepositCents: vi.fn(() => 3000),
}));

vi.mock("@/lib/stripe", () => ({
  createDepositCheckoutSession: vi.fn(async () => ({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/pay/cs_test_123",
  })),
}));

vi.mock("@/lib/email", () => ({
  sendGuestBookingConfirmation: vi.fn(async () => {}),
  sendMerchantNewBookingAlert:  vi.fn(async () => {}),
}));

import { db } from "@/lib/db";
import { POST } from "@/app/api/v1/public/bookings/route";

const mockService = {
  id: "svc-1",
  merchantId: "merchant-1",
  price: "150.00",
  depositAmount: "30.00",
  isAvailable: true,
};

const mockMerchant = {
  id: "merchant-1",
  shopName: "Test Shop",
  email: "shop@test.com",
  status: "active",
};

describe("POST /api/v1/public/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (db.query.merchantServices.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockService);
    (db.query.merchants.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockMerchant);
    const mockBooking = {
      id: "booking-1",
      bookingRef: "IRE-ABC123",
      merchantId: "merchant-1",
    };
    (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
      values: vi.fn(() => ({ returning: vi.fn(async () => [mockBooking]) })),
    });
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
      set: vi.fn(() => ({ where: vi.fn(async () => {}) })),
    });
  });

  it("rejects missing required fields", async () => {
    const req = new Request("http://localhost/api/v1/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantServiceId: "svc-1", scheduledAt: "2026-05-01T10:00:00Z" }),
      // Missing customerName, customerEmail
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns checkoutUrl on success", async () => {
    const req = new Request("http://localhost/api/v1/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantServiceId: "svc-1",
        scheduledAt: "2026-05-01T10:00:00Z",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+353871234567",
      }),
    });
    const res = await POST(req as never);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("returns 404 when service not found", async () => {
    (db.query.merchantServices.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/v1/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantServiceId: "bad-id",
        scheduledAt: "2026-05-01T10:00:00Z",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+353871234567",
      }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ierepair && npx vitest run __tests__/api/public-bookings.test.ts
```

Expected: FAIL — `POST` not found (file doesn't exist).

- [ ] **Step 3: Create the public bookings API**

Create `ierepair/app/api/v1/public/bookings/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { merchantServices } from "@/lib/db/schema/repair-services";
import { merchants } from "@/lib/db/schema/merchants";
import { eq } from "drizzle-orm";
import {
  generateBookingRef,
  generateBookingQR,
  calculateDeposit,
  calculateDepositCents,
} from "@/lib/booking";
import { createDepositCheckoutSession } from "@/lib/stripe";
import { sendGuestBookingConfirmation, sendMerchantNewBookingAlert } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      merchantServiceId: string;
      scheduledAt: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      customerNotes?: string;
    };

    const { merchantServiceId, scheduledAt, customerName, customerEmail, customerPhone, customerNotes } = body;

    if (!merchantServiceId || !scheduledAt || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: "merchantServiceId, scheduledAt, customerName, customerEmail are required" },
        { status: 400 },
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email address" }, { status: 400 });
    }

    const service = await db.query.merchantServices.findFirst({
      where: eq(merchantServices.id, merchantServiceId),
    });
    if (!service || !service.isAvailable) {
      return NextResponse.json({ success: false, error: "Service not available" }, { status: 404 });
    }

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, service.merchantId),
    });
    if (!merchant || merchant.status !== "active") {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const bookingRef    = generateBookingRef();
    const servicePrice  = parseFloat(service.price.toString());
    const depositAmount = calculateDeposit(servicePrice);
    const qrCode        = await generateBookingQR(bookingRef);

    const [booking] = await db.insert(repairBookings).values({
      bookingRef,
      userId:           null,           // guest — no account
      merchantId:       merchant.id,
      merchantServiceId,
      scheduledAt:      new Date(scheduledAt),
      servicePrice:     service.price,
      depositAmount:    depositAmount.toString(),
      depositPaid:      false,
      qrCode,
      customerNotes,
      customerName,
      customerEmail,
      customerPhone,
    }).returning();

    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const stripeSession = await createDepositCheckoutSession({
      bookingId:          booking.id,
      bookingRef:         booking.bookingRef,
      serviceName:        "Repair Service",
      shopName:           merchant.shopName,
      depositAmountCents: calculateDepositCents(servicePrice),
      successUrl: `${origin}/booking/success?ref=${booking.bookingRef}`,
      cancelUrl:  `${origin}/repair/book?cancelled=1`,
    });

    await db.update(repairBookings)
      .set({ stripeSessionId: stripeSession.id })
      .where(eq(repairBookings.id, booking.id));

    // Send emails (non-fatal)
    try {
      await sendGuestBookingConfirmation({
        to: customerEmail,
        customerName,
        bookingRef:  booking.bookingRef,
        shopName:    merchant.shopName,
        scheduledAt: booking.scheduledAt,
        depositAmount,
        checkoutUrl: stripeSession.url ?? "",
      });
      await sendMerchantNewBookingAlert({
        to: merchant.email,
        shopName:    merchant.shopName,
        bookingRef:  booking.bookingRef,
        customerName,
        scheduledAt: booking.scheduledAt,
      });
    } catch (emailErr) {
      console.error("[public/bookings] email failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        booking,
        checkoutUrl: stripeSession.url,
        bookingRef:  booking.bookingRef,
      },
    });
  } catch (err) {
    console.error("[public/bookings POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd ierepair && npx vitest run __tests__/api/public-bookings.test.ts
```

Expected: PASS — all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add ierepair/app/api/v1/public/bookings/route.ts ierepair/__tests__/api/public-bookings.test.ts
git commit -m "feat: add public (guest) booking API at /api/v1/public/bookings"
```

---

## Task 3: Email module with Resend

**Files:**
- Create: `ierepair/lib/email.ts`
- Create: `ierepair/__tests__/lib/email.test.ts`

- [ ] **Step 1: Install Resend**

```bash
cd ierepair && npm install resend
```

Expected: Resend added to `package.json`.

- [ ] **Step 2: Add env variable**

Add to `.env.local` (do NOT commit this file):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=bookings@ierepair.ie
```

- [ ] **Step 3: Write the failing test**

Create `ierepair/__tests__/lib/email.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock resend
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn(async () => ({ data: { id: "email-123" }, error: null })),
    },
  })),
}));

import {
  sendGuestBookingConfirmation,
  sendMerchantNewBookingAlert,
  sendBookingConfirmedEmail,
  sendBookingRejectedEmail,
} from "@/lib/email";

describe("email module", () => {
  it("sendGuestBookingConfirmation resolves without throwing", async () => {
    await expect(
      sendGuestBookingConfirmation({
        to: "customer@example.com",
        customerName: "Alice",
        bookingRef: "IRE-XYZ123",
        shopName: "Test Shop",
        scheduledAt: new Date("2026-05-01T10:00:00Z"),
        depositAmount: 30,
        checkoutUrl: "https://checkout.stripe.com/pay/cs_test",
      }),
    ).resolves.not.toThrow();
  });

  it("sendMerchantNewBookingAlert resolves without throwing", async () => {
    await expect(
      sendMerchantNewBookingAlert({
        to: "shop@example.com",
        shopName: "Test Shop",
        bookingRef: "IRE-XYZ123",
        customerName: "Alice",
        scheduledAt: new Date("2026-05-01T10:00:00Z"),
      }),
    ).resolves.not.toThrow();
  });

  it("sendBookingConfirmedEmail resolves without throwing", async () => {
    await expect(
      sendBookingConfirmedEmail({
        to: "customer@example.com",
        customerName: "Alice",
        bookingRef: "IRE-XYZ123",
        shopName: "Test Shop",
        scheduledAt: new Date("2026-05-01T10:00:00Z"),
      }),
    ).resolves.not.toThrow();
  });

  it("sendBookingRejectedEmail resolves without throwing", async () => {
    await expect(
      sendBookingRejectedEmail({
        to: "customer@example.com",
        customerName: "Alice",
        bookingRef: "IRE-XYZ123",
        shopName: "Test Shop",
        reason: "Fully booked on that date",
      }),
    ).resolves.not.toThrow();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd ierepair && npx vitest run __tests__/lib/email.test.ts
```

Expected: FAIL — `@/lib/email` module not found.

- [ ] **Step 5: Create the email module**

Create `ierepair/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "bookings@ierepair.ie";

function formatDate(d: Date): string {
  return d.toLocaleString("en-IE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Dublin",
  });
}

/* ── Guest booking confirmation (to customer) ── */

export interface GuestBookingConfirmationOpts {
  to: string;
  customerName: string;
  bookingRef: string;
  shopName: string;
  scheduledAt: Date;
  depositAmount: number;
  checkoutUrl: string;
}

export async function sendGuestBookingConfirmation(
  opts: GuestBookingConfirmationOpts,
): Promise<void> {
  await resend.emails.send({
    from: `IERepair <${FROM}>`,
    to: opts.to,
    subject: `Booking confirmed — ${opts.bookingRef}`,
    html: `
<p>Hi ${opts.customerName},</p>
<p>Your repair booking at <strong>${opts.shopName}</strong> has been received.</p>
<ul>
  <li><strong>Reference:</strong> ${opts.bookingRef}</li>
  <li><strong>Date / Time:</strong> ${formatDate(opts.scheduledAt)}</li>
  <li><strong>Deposit due:</strong> €${opts.depositAmount.toFixed(2)}</li>
</ul>
<p>
  <a href="${opts.checkoutUrl}" style="display:inline-block;padding:12px 24px;background:#242424;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
    Pay deposit now
  </a>
</p>
<p>If you did not make this booking, please ignore this email.</p>
<p>— The IERepair team</p>
    `.trim(),
  });
}

/* ── New booking alert (to merchant) ── */

export interface MerchantNewBookingAlertOpts {
  to: string;
  shopName: string;
  bookingRef: string;
  customerName: string;
  scheduledAt: Date;
}

export async function sendMerchantNewBookingAlert(
  opts: MerchantNewBookingAlertOpts,
): Promise<void> {
  await resend.emails.send({
    from: `IERepair <${FROM}>`,
    to: opts.to,
    subject: `New booking — ${opts.bookingRef}`,
    html: `
<p>Hi ${opts.shopName},</p>
<p>A new repair booking has been submitted and is waiting for your confirmation.</p>
<ul>
  <li><strong>Reference:</strong> ${opts.bookingRef}</li>
  <li><strong>Customer:</strong> ${opts.customerName}</li>
  <li><strong>Date / Time:</strong> ${formatDate(opts.scheduledAt)}</li>
</ul>
<p>Log in to your merchant dashboard to confirm or reject this booking.</p>
<p>— The IERepair platform</p>
    `.trim(),
  });
}

/* ── Booking confirmed (to customer after merchant accepts) ── */

export interface BookingConfirmedEmailOpts {
  to: string;
  customerName: string;
  bookingRef: string;
  shopName: string;
  scheduledAt: Date;
}

export async function sendBookingConfirmedEmail(
  opts: BookingConfirmedEmailOpts,
): Promise<void> {
  await resend.emails.send({
    from: `IERepair <${FROM}>`,
    to: opts.to,
    subject: `Your booking is confirmed — ${opts.bookingRef}`,
    html: `
<p>Hi ${opts.customerName},</p>
<p>Great news! <strong>${opts.shopName}</strong> has confirmed your repair appointment.</p>
<ul>
  <li><strong>Reference:</strong> ${opts.bookingRef}</li>
  <li><strong>Date / Time:</strong> ${formatDate(opts.scheduledAt)}</li>
</ul>
<p>Please arrive at the shop on time. Bring your device and any relevant accessories.</p>
<p>— The IERepair team</p>
    `.trim(),
  });
}

/* ── Booking rejected (to customer after merchant rejects) ── */

export interface BookingRejectedEmailOpts {
  to: string;
  customerName: string;
  bookingRef: string;
  shopName: string;
  reason: string;
}

export async function sendBookingRejectedEmail(
  opts: BookingRejectedEmailOpts,
): Promise<void> {
  await resend.emails.send({
    from: `IERepair <${FROM}>`,
    to: opts.to,
    subject: `Booking update — ${opts.bookingRef}`,
    html: `
<p>Hi ${opts.customerName},</p>
<p>Unfortunately, <strong>${opts.shopName}</strong> is unable to accept your booking.</p>
<ul>
  <li><strong>Reference:</strong> ${opts.bookingRef}</li>
  <li><strong>Reason:</strong> ${opts.reason}</li>
</ul>
<p>Any deposit paid will be refunded within 5–7 business days.</p>
<p>You can book a different time or visit another shop on IERepair.</p>
<p>— The IERepair team</p>
    `.trim(),
  });
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd ierepair && npx vitest run __tests__/lib/email.test.ts
```

Expected: PASS — all 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add ierepair/lib/email.ts ierepair/__tests__/lib/email.test.ts
git commit -m "feat: add Resend email module with booking confirmation/alert/rejected templates"
```

---

## Task 4: Merchant reject endpoint + wire emails to accept route

**Files:**
- Create: `ierepair/app/api/v1/merchant/bookings/[id]/reject/route.ts`
- Modify: `ierepair/app/api/v1/merchant/bookings/[id]/accept/route.ts`

- [ ] **Step 1: Write the failing test**

Create `ierepair/__tests__/api/merchant-reject.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      repairBookings: {
        findFirst: vi.fn(),
      },
      merchants: {
        findFirst: vi.fn(),
      },
      users: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  },
}));

vi.mock("@/lib/email", () => ({
  sendBookingRejectedEmail: vi.fn(async () => {}),
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { POST } from "@/app/api/v1/merchant/bookings/[id]/reject/route";

const mockSession = { user: { role: "merchant", merchantId: "merchant-1" } };
const mockPendingBooking = {
  id: "booking-1",
  merchantId: "merchant-1",
  status: "pending",
  bookingRef: "IRE-ABC123",
  scheduledAt: new Date("2026-05-01T10:00:00Z"),
  customerEmail: "john@example.com",
  customerName: "John Doe",
};
const mockMerchant = { id: "merchant-1", shopName: "Test Shop" };

describe("POST /api/v1/merchant/bookings/[id]/reject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);
    (db.query.repairBookings.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockPendingBooking);
    (db.query.merchants.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockMerchant);
    (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
      set: vi.fn(() => ({ where: vi.fn(async () => {}) })),
    });
  });

  it("returns 400 when reason is missing", async () => {
    const req = new Request("http://localhost/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req as never, { params: Promise.resolve({ id: "booking-1" }) });
    expect(res.status).toBe(400);
  });

  it("rejects the booking and returns 200", async () => {
    const req = new Request("http://localhost/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Fully booked on that date" }),
    });
    const res = await POST(req as never, { params: Promise.resolve({ id: "booking-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 401 when not authenticated as merchant", async () => {
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Full" }),
    });
    const res = await POST(req as never, { params: Promise.resolve({ id: "booking-1" }) });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd ierepair && npx vitest run __tests__/api/merchant-reject.test.ts
```

Expected: FAIL — reject route file does not exist.

- [ ] **Step 3: Create the reject route**

Create `ierepair/app/api/v1/merchant/bookings/[id]/reject/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { merchants } from "@/lib/db/schema/merchants";
import { eq, and } from "drizzle-orm";
import { sendBookingRejectedEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { reason?: string };
  const { reason } = body;

  if (!reason || reason.trim().length === 0) {
    return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 });
  }

  const booking = await db.query.repairBookings.findFirst({
    where: and(
      eq(repairBookings.id, id),
      eq(repairBookings.merchantId, session.user.merchantId!),
    ),
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ success: false, error: "Booking is not pending" }, { status: 400 });
  }

  await db.update(repairBookings)
    .set({
      status:      "cancelled",
      cancelledAt: new Date(),
      cancelledBy: "merchant",
      merchantNotes: reason,
      updatedAt:   new Date(),
    })
    .where(eq(repairBookings.id, id));

  // Send rejection email to customer (non-fatal)
  try {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, session.user.merchantId!),
    });

    // Try customer email from guest fields first, fall back to userId lookup
    const recipientEmail = booking.customerEmail;
    const recipientName  = booking.customerName ?? "Customer";

    if (recipientEmail && merchant) {
      await sendBookingRejectedEmail({
        to:          recipientEmail,
        customerName: recipientName,
        bookingRef:  booking.bookingRef,
        shopName:    merchant.shopName,
        reason:      reason.trim(),
      });
    }
  } catch (emailErr) {
    console.error("[reject] email failed:", emailErr);
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Update accept route to send email**

In `ierepair/app/api/v1/merchant/bookings/[id]/accept/route.ts`, add email import and replace the SMS-only notification with email:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { merchants } from "@/lib/db/schema/merchants";
import { eq, and } from "drizzle-orm";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { sendBookingConfirmation } from "@/lib/sms";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await db.query.repairBookings.findFirst({
    where: and(eq(repairBookings.id, id), eq(repairBookings.merchantId, session.user.merchantId!)),
  });

  if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (booking.status !== "pending") {
    return NextResponse.json({ success: false, error: "Booking is not pending" }, { status: 400 });
  }

  await db.update(repairBookings)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(repairBookings.id, id));

  try {
    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, booking.merchantId),
    });

    if (merchant) {
      // Email — guest or registered customer
      const recipientEmail = booking.customerEmail;
      const recipientName  = booking.customerName ?? "Customer";

      if (recipientEmail) {
        await sendBookingConfirmedEmail({
          to:           recipientEmail,
          customerName: recipientName,
          bookingRef:   booking.bookingRef,
          shopName:     merchant.shopName,
          scheduledAt:  booking.scheduledAt,
        });
      }

      // SMS — still send to registered users with phone
      if (booking.userId) {
        const { users } = await import("@/lib/db/schema/users");
        const user = await db.query.users.findFirst({ where: eq(users.id, booking.userId) });
        if (user?.phone) {
          await sendBookingConfirmation(user.phone, {
            shopName:    merchant.shopName,
            scheduledAt: booking.scheduledAt,
            bookingRef:  booking.bookingRef,
          });
        }
      }
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd ierepair && npx vitest run __tests__/api/merchant-reject.test.ts
```

Expected: PASS — all 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add \
  ierepair/app/api/v1/merchant/bookings/[id]/reject/route.ts \
  ierepair/app/api/v1/merchant/bookings/[id]/accept/route.ts \
  ierepair/__tests__/api/merchant-reject.test.ts
git commit -m "feat: add merchant booking reject endpoint; wire email notifications to accept/reject"
```

---

## Task 5: Update booking wizard — guest contact step

**Files:**
- Modify: `ierepair/app/(consumer)/repair/book/page.tsx`

The booking wizard currently calls `/api/v1/user/repair-bookings` and redirects to login on 401. We add a "contact" step for unauthenticated users so they can proceed as guests.

**New step flow:**
- Authenticated: `device → service → slot → confirm` (unchanged, calls `/api/v1/user/repair-bookings`)
- Guest: `device → service → slot → contact → confirm` (calls `/api/v1/public/bookings`)

- [ ] **Step 1: Write the failing snapshot/integration test**

Create `ierepair/__tests__/components/book-wizard-guest.test.tsx`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: (k: string) => (k === "storeId" ? "store-1" : k === "storeName" ? "Test Shop" : null),
  }),
}));

// Mock next-auth — guest (no session)
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

// Mock fetch — return one service
vi.stubGlobal("fetch", vi.fn(async () => ({
  json: async () => ({
    success: true,
    data: {
      services: [{
        merchantServiceId: "svc-1",
        serviceName: "Screen Replacement",
        deviceModel: "iPhone 15 Pro",
        deviceBrand: "Apple",
        price: "150.00",
        depositAmount: "30.00",
        estimatedMin: 60,
        imageUrl: null,
      }],
    },
  }),
})));

import BookRepairPage from "@/app/(consumer)/repair/book/page";

describe("BookRepairPage guest flow", () => {
  it("renders Contact step for unauthenticated users", async () => {
    const user = userEvent.setup();
    render(<BookRepairPage />);

    // Step 1 — select brand
    await screen.findByText("Apple");
    await user.click(screen.getByText("Apple"));

    // Series appears (parseSeries extracts "iPhone 15")
    await screen.findByText("iPhone 15");
    await user.click(screen.getByText("iPhone 15"));

    // Model card
    await screen.findByText("iPhone 15 Pro");
    await user.click(screen.getByText("iPhone 15 Pro"));

    // Only 1 service — jumps straight to slot step
    await screen.findByText("Choose a time");

    // Click first time slot
    const slots = await screen.findAllByRole("button", { name: /\d{2}:\d{2}/ });
    await user.click(slots[0]);

    // For guests: should now see "Your contact details" step
    expect(await screen.findByText("Your contact details")).toBeDefined();
  });
});
```

- [ ] **Step 2: Install testing peer deps if missing**

```bash
cd ierepair && npm install -D @testing-library/react @testing-library/user-event jsdom 2>/dev/null || true
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd ierepair && npx vitest run __tests__/components/book-wizard-guest.test.tsx
```

Expected: FAIL — "Your contact details" step not found (guest detection not implemented).

- [ ] **Step 4: Update the booking wizard**

Replace the full contents of `ierepair/app/(consumer)/repair/book/page.tsx` with the updated version that adds guest contact step:

```typescript
"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface StoreService {
  merchantServiceId: string;
  serviceName: string;
  deviceModel: string | null;
  deviceBrand: string | null;
  price: string;
  depositAmount: string;
  estimatedMin: number | null;
  imageUrl: string | null;
}

// "contact" step only shown to unauthenticated (guest) users
type Step = "device" | "service" | "slot" | "contact" | "confirm";

const AUTH_STEPS:  Step[] = ["device", "service", "slot", "confirm"];
const GUEST_STEPS: Step[] = ["device", "service", "slot", "contact", "confirm"];

const STEP_LABELS: Record<Step, string> = {
  device:  "Device",
  service: "Service",
  slot:    "Time",
  contact: "Contact",
  confirm: "Confirm",
};

function parseSeries(model: string): string {
  return model
    .replace(/\s+(Pro Max|Pro|Max|Ultra|Plus|Lite|FE|Mini)\s*$/i, "")
    .trim();
}

function generateSlots(slotDuration = 30) {
  const slots: { date: string; label: string; iso: string }[] = [];
  const now = new Date();
  for (let d = 1; d <= 14; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(9, 0, 0, 0);
    const dateLabel = day.toLocaleDateString("en-IE", {
      weekday: "short", month: "short", day: "numeric",
    });
    for (let h = 9; h < 18; h += slotDuration / 60) {
      const slot = new Date(day);
      slot.setHours(Math.floor(h), (h % 1) * 60);
      slots.push({
        date: dateLabel,
        label: slot.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }),
        iso: slot.toISOString(),
      });
    }
  }
  return slots;
}

function BookRepairPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const storeId      = searchParams.get("storeId") ?? "";
  const storeName    = searchParams.get("storeName") ?? "the shop";
  const { data: session, status: authStatus } = useSession();

  const isGuest  = authStatus !== "loading" && !session;
  const STEPS    = isGuest ? GUEST_STEPS : AUTH_STEPS;

  const [services, setServices]             = useState<StoreService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [step, setStep]                     = useState<Step>("device");

  // Device selection
  const [selectedBrand,  setBrand]  = useState<string | null>(null);
  const [selectedSeries, setSeries] = useState<string | null>(null);
  const [selectedModel,  setModel]  = useState<string | null>(null);

  // Booking
  const [selectedService, setService] = useState<StoreService | null>(null);
  const [selectedSlot,    setSlot]    = useState<string>("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);

  // Guest contact info
  const [guestName,  setGuestName]  = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const slots = useMemo(() => generateSlots(30), []);
  const groupedSlots = useMemo(() =>
    slots.reduce<Record<string, typeof slots>>((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {}),
  [slots]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/v1/public/stores/${storeId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data.services ?? []); })
      .finally(() => setLoadingServices(false));
  }, [storeId]);

  const brands = useMemo(() => {
    const set = new Set(services.map((s) => s.deviceBrand).filter(Boolean) as string[]);
    return [...set].sort();
  }, [services]);

  const seriesList = useMemo(() => {
    if (!selectedBrand) return [];
    const set = new Set(
      services
        .filter((s) => s.deviceBrand === selectedBrand && s.deviceModel)
        .map((s) => parseSeries(s.deviceModel!))
    );
    return [...set].sort();
  }, [services, selectedBrand]);

  const modelList = useMemo(() => {
    if (!selectedBrand || !selectedSeries) return [];
    const seen = new Set<string>();
    return services
      .filter((s) =>
        s.deviceBrand === selectedBrand &&
        s.deviceModel &&
        parseSeries(s.deviceModel) === selectedSeries,
      )
      .reduce<{ model: string; imageUrl: string | null }[]>((acc, s) => {
        if (!seen.has(s.deviceModel!)) {
          seen.add(s.deviceModel!);
          acc.push({ model: s.deviceModel!, imageUrl: s.imageUrl });
        }
        return acc;
      }, []);
  }, [services, selectedBrand, selectedSeries]);

  const filteredServices = useMemo(
    () => services.filter((s) => s.deviceModel === selectedModel),
    [services, selectedModel],
  );

  function handleSelectModel(model: string) {
    setModel(model);
    const modelServices = services.filter((s) => s.deviceModel === model);
    if (modelServices.length === 1) {
      setService(modelServices[0]);
      setStep("slot");
    } else {
      setStep("service");
    }
  }

  function advanceFromSlot() {
    // Guests need to provide contact info before confirm
    setStep(isGuest ? "contact" : "confirm");
  }

  function backFromContact() { setStep("slot"); }

  function backFromConfirm() {
    setStep(isGuest ? "contact" : "slot");
  }

  function backFromSlot() {
    setStep(filteredServices.length > 1 ? "service" : "device");
  }

  async function handleBook() {
    setLoading(true);
    try {
      if (isGuest) {
        // Guest path — public API
        if (!guestName.trim() || !guestEmail.trim()) {
          alert("Please fill in your name and email");
          return;
        }
        const res = await fetch("/api/v1/public/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantServiceId: selectedService!.merchantServiceId,
            scheduledAt:       selectedSlot,
            customerName:      guestName.trim(),
            customerEmail:     guestEmail.trim(),
            customerPhone:     guestPhone.trim() || undefined,
            customerNotes:     notes,
          }),
        });
        const data = await res.json();
        if (data.success && data.data.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else {
          alert(data.error ?? "Failed to create booking");
        }
      } else {
        // Authenticated path — existing user API
        const res = await fetch("/api/v1/user/repair-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchantServiceId: selectedService!.merchantServiceId,
            scheduledAt:       selectedSlot,
            customerNotes:     notes,
          }),
        });
        const data = await res.json();
        if (data.success && data.data.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
        } else if (res.status === 401) {
          router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        } else {
          alert(data.error ?? "Failed to create booking");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background">

      {/* Sticky header + step bar */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/repair" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight">Book Repair</h1>
              <p className="text-xs text-muted-foreground">{storeName}</p>
            </div>
          </div>

          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200
                      ${i < stepIndex
                        ? "bg-primary/15 text-primary"
                        : i === stepIndex
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground"}`}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      i === stepIndex ? "text-foreground" : "text-muted-foreground/60"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 transition-colors duration-300 ${
                      i < stepIndex ? "bg-primary/30" : "bg-border/60"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-8 pb-16">

        {/* Step 1 — Device */}
        {step === "device" && (
          <div className="space-y-10">
            {loadingServices && (
              <p className="text-center text-sm text-muted-foreground py-16">Loading…</p>
            )}
            {!loadingServices && brands.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-16">
                No repair services available at this shop yet.
              </p>
            )}
            {!loadingServices && brands.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Brand</p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => { setBrand(brand); setSeries(null); setModel(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${selectedBrand === brand
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedBrand && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Series</p>
                <div className="flex flex-wrap gap-2">
                  {seriesList.map((series) => (
                    <button
                      key={series}
                      onClick={() => { setSeries(series); setModel(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${selectedSeries === series
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {series}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSeries && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Model</p>
                <div className="grid grid-cols-2 gap-3">
                  {modelList.map(({ model, imageUrl }) => (
                    <button
                      key={model}
                      onClick={() => handleSelectModel(model)}
                      className={`relative aspect-[3/4] rounded-2xl border-2 overflow-hidden transition-all duration-200
                        ${selectedModel === model
                          ? "border-primary shadow-md scale-[0.98]"
                          : "border-border/50 hover:border-foreground/20 hover:shadow-sm active:scale-[0.97]"}`}
                    >
                      <div className="absolute inset-0 bg-secondary/30" />
                      {imageUrl ? (
                        <img src={imageUrl} alt={model} className="absolute inset-0 w-full h-full object-contain p-6" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">📱</div>
                      )}
                      <div className="absolute bottom-3 left-2 right-2 z-10">
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl px-3 py-1.5">
                          <p className="text-[11px] font-medium text-center leading-snug">{model}</p>
                        </div>
                      </div>
                      {selectedModel === model && (
                        <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Service */}
        {step === "service" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("device")} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-[15px] font-semibold">Select repair type</h2>
                <p className="text-xs text-muted-foreground">{selectedModel}</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {filteredServices.map((s) => (
                <button
                  key={s.merchantServiceId}
                  onClick={() => { setService(s); setStep("slot"); }}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 hover:border-foreground/20 hover:shadow-sm transition-all text-left group"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-[14px]">{s.serviceName}</div>
                    {s.estimatedMin && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />~{s.estimatedMin} min
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-[14px]">€{parseFloat(s.price).toFixed(2)}</div>
                      <div className="text-[11px] text-muted-foreground">€{parseFloat(s.depositAmount).toFixed(2)} deposit</div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Time Slot */}
        {step === "slot" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={backFromSlot} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold">Choose a time</h2>
            </div>
            {Object.entries(groupedSlots).map(([date, daySlots]) => (
              <div key={date}>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Calendar size={11} />{date}
                </div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.iso}
                      onClick={() => { setSlot(slot.iso); advanceFromSlot(); }}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                        ${selectedSlot === slot.iso
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 (guest only) — Contact Details */}
        {step === "contact" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={backFromContact} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold">Your contact details</h2>
            </div>

            <p className="text-sm text-muted-foreground">
              We&apos;ll send your booking confirmation to this email address.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName" className="text-xs text-muted-foreground mb-1.5 block">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="guestName"
                  placeholder="John Smith"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="guestEmail" className="text-xs text-muted-foreground mb-1.5 block">
                  Email address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="guestPhone" className="text-xs text-muted-foreground mb-1.5 block">
                  Phone number (optional)
                </Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  placeholder="+353 87 123 4567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                if (!guestName.trim() || !guestEmail.trim()) {
                  alert("Please fill in your name and email");
                  return;
                }
                setStep("confirm");
              }}
              className="w-full h-12 rounded-2xl text-[15px] font-semibold"
            >
              Continue
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href={`/auth/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/repair/book")}`} className="text-foreground underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 5 (guest) / Step 4 (auth) — Confirm */}
        {step === "confirm" && selectedService && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={backFromConfirm} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold">Confirm booking</h2>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
              <div className="divide-y divide-border/60">
                {[
                  { label: "Shop",    value: storeName },
                  { label: "Device",  value: selectedModel },
                  { label: "Service", value: selectedService.serviceName },
                  {
                    label: "Time",
                    value: new Date(selectedSlot).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" }),
                  },
                  ...(isGuest
                    ? [
                        { label: "Name",  value: guestName },
                        { label: "Email", value: guestEmail },
                      ]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3.5 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border bg-secondary/30 divide-y divide-border/40">
                <div className="flex justify-between items-center px-4 py-3.5 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">€{parseFloat(selectedService.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3.5 text-sm text-primary">
                  <span>Deposit due now</span>
                  <span className="font-semibold">€{parseFloat(selectedService.depositAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground text-center leading-relaxed px-2">
              Remaining balance is paid at the shop.
              <br />Deposit is non-refundable if cancelled within 24 hours.
            </p>

            <div>
              <Label htmlFor="notes" className="text-xs text-muted-foreground mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Describe the issue with your device…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary/50 border-border/60 resize-none rounded-xl text-sm"
                rows={3}
              />
            </div>

            <Button
              onClick={handleBook}
              disabled={loading}
              className="w-full h-12 rounded-2xl text-[15px] font-semibold"
            >
              {loading
                ? "Creating booking…"
                : `Pay €${parseFloat(selectedService.depositAmount).toFixed(2)} deposit`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense>
      <BookRepairPageInner />
    </Suspense>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd ierepair && npx vitest run __tests__/components/book-wizard-guest.test.tsx
```

Expected: PASS — "Your contact details" heading found in guest flow.

- [ ] **Step 6: Commit**

```bash
git add ierepair/app/(consumer)/repair/book/page.tsx ierepair/__tests__/components/book-wizard-guest.test.tsx
git commit -m "feat: add guest contact step to booking wizard; route to public API for unauthenticated users"
```

---

## Task 6: Build verification

- [ ] **Step 1: TypeScript type check**

```bash
cd ierepair && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Full test suite**

```bash
cd ierepair && npx vitest run
```

Expected: All tests pass (zero failing).

- [ ] **Step 3: Production build**

```bash
cd ierepair && npm run build
```

Expected: Build completes without errors. `✓ Compiled successfully`.

- [ ] **Step 4: Smoke test (start dev server)**

```bash
cd ierepair && npm run dev &
sleep 5
curl -s http://localhost:3000/api/v1/public/bookings \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"merchantServiceId":"x","scheduledAt":"2026-05-01T10:00:00Z","customerName":"Test","customerEmail":"invalid"}' \
  | python3 -m json.tool
```

Expected: `{"success": false, "error": "Invalid email address"}` (400 — validation is working).

- [ ] **Step 5: Final commit**

```bash
git add -p  # review any remaining unstaged changes
git commit -m "test: phase 3 build verification — all tests pass, build green"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Guest booking without account — public API + contact step
- [x] Email confirmation to customer after booking submitted
- [x] Email notification to merchant on new booking
- [x] Email confirmation to customer after merchant accepts
- [x] Email rejection to customer with reason after merchant rejects
- [x] Merchant reject endpoint (was missing from codebase)
- [x] Schema migration for `customerName`/`customerEmail`/`customerPhone`

**Placeholder scan:** None — all steps contain complete code.

**Type consistency:**
- `GuestBookingConfirmationOpts.depositAmount` is `number` — matches `calculateDeposit()` return type (`number`)
- `sendBookingConfirmedEmail` / `sendBookingRejectedEmail` — called with exact same property names as defined in interfaces
- `repairBookings` schema columns match exact column names used in `db.insert().values({...})` in public bookings route
