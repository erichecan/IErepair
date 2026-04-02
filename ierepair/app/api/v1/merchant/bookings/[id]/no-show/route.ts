import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { eq, and } from "drizzle-orm";

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
  if (booking.status !== "confirmed") {
    return NextResponse.json({ success: false, error: "Booking must be confirmed" }, { status: 400 });
  }

  // No-show: deposit is forfeited — no refund
  await db.update(repairBookings).set({
    status:       "no_show",
    refundStatus: "forfeited",
    updatedAt:    new Date(),
  }).where(eq(repairBookings.id, id));

  return NextResponse.json({ success: true });
}
