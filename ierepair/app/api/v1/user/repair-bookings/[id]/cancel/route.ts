import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { users } from "@/lib/db/schema/users";
import { eq, and } from "drizzle-orm";
import { issueRefund } from "@/lib/stripe";
import { sendBookingCancellation } from "@/lib/sms";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "consumer") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await db.query.repairBookings.findFirst({
    where: and(eq(repairBookings.id, id), eq(repairBookings.userId, session.user.id)),
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json(
      { success: false, error: "Cannot cancel a booking in current status" },
      { status: 400 },
    );
  }

  const now = new Date();
  const scheduledAt = new Date(booking.scheduledAt);
  const hoursUntilBooking = (scheduledAt.getTime() - now.getTime()) / 3_600_000;

  // Refund policy: >24h → full refund, ≤24h → no refund
  let refundStatus = "no_refund";
  if (booking.depositPaid && booking.stripePaymentIntentId && hoursUntilBooking > 24) {
    try {
      await issueRefund(booking.stripePaymentIntentId);
      refundStatus = "refunded";
    } catch (err) {
      console.error("[cancel refund]", err);
      refundStatus = "refund_failed";
    }
  }

  await db.update(repairBookings).set({
    status:       "cancelled",
    cancelledAt:  now,
    cancelledBy:  "user",
    refundStatus,
    updatedAt:    now,
  }).where(eq(repairBookings.id, id));

  // SMS notification
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
    if (user?.phone) {
      await sendBookingCancellation(user.phone, { bookingRef: booking.bookingRef });
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true, data: { refundStatus } });
}
