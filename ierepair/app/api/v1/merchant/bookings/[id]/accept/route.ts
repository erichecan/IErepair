import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { users } from "@/lib/db/schema/users";
import { merchants } from "@/lib/db/schema/merchants";
import { eq, and } from "drizzle-orm";
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

  // Notify user via SMS
  try {
    if (booking.userId) {
      const user     = await db.query.users.findFirst({ where: eq(users.id, booking.userId) });
      const merchant = await db.query.merchants.findFirst({ where: eq(merchants.id, booking.merchantId) });
      if (user?.phone && merchant) {
        await sendBookingConfirmation(user.phone, {
          shopName:    merchant.shopName,
          scheduledAt: booking.scheduledAt,
          bookingRef:  booking.bookingRef,
        });
      }
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ success: true });
}
