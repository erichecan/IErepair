import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { merchantServices } from "@/lib/db/schema/repair-services";
import { merchants } from "@/lib/db/schema/merchants";
import { eq, desc } from "drizzle-orm";
import {
  generateBookingRef,
  generateBookingQR,
  calculateDeposit,
  calculateDepositCents,
} from "@/lib/booking";
import { createDepositCheckoutSession } from "@/lib/stripe";

// GET /api/v1/user/repair-bookings — list user's bookings
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "consumer") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await db.query.repairBookings.findMany({
    where: eq(repairBookings.userId, session.user.id),
    orderBy: [desc(repairBookings.createdAt)],
  });

  return NextResponse.json({ success: true, data: bookings });
}

// POST /api/v1/user/repair-bookings — create booking + Stripe checkout
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "consumer") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { merchantServiceId, scheduledAt, customerNotes } = body as {
      merchantServiceId: string;
      scheduledAt: string;
      customerNotes?: string;
    };

    if (!merchantServiceId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: "merchantServiceId and scheduledAt are required" },
        { status: 400 },
      );
    }

    // Load service + merchant
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
      userId:           session.user.id,
      merchantId:       merchant.id,
      merchantServiceId,
      scheduledAt:      new Date(scheduledAt),
      servicePrice:     service.price,
      depositAmount:    depositAmount.toString(),
      depositPaid:      false,
      qrCode,
      customerNotes,
    }).returning();

    // Create Stripe Checkout Session
    const origin = request.headers.get("origin") ?? "http://localhost:3000";
    const stripeSession = await createDepositCheckoutSession({
      bookingId:          booking.id,
      bookingRef:         booking.bookingRef,
      serviceName:        `Repair Service`,
      shopName:           merchant.shopName,
      depositAmountCents: calculateDepositCents(servicePrice),
      successUrl: `${origin}/account/bookings/${booking.id}?paid=1`,
      cancelUrl:  `${origin}/repair/book?cancelled=1`,
    });

    await db.update(repairBookings)
      .set({ stripeSessionId: stripeSession.id })
      .where(eq(repairBookings.id, booking.id));

    return NextResponse.json({
      success: true,
      data: { booking, checkoutUrl: stripeSession.url },
    });
  } catch (err) {
    console.error("[repair-bookings POST]", err);
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
  }
}
