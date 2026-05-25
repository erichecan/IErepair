import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { commissionLedger, commissionRules } from "@/lib/db/schema/commission";
import { eq, and, or, isNull, lte } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { merchantNotes } = body as { merchantNotes?: string };

  const booking = await db.query.repairBookings.findFirst({
    where: and(eq(repairBookings.id, id), eq(repairBookings.merchantId, session.user.merchantId!)),
  });

  if (!booking) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (!["confirmed", "checked_in"].includes(booking.status)) {
    return NextResponse.json({ success: false, error: "Cannot complete in current status" }, { status: 400 });
  }

  // Determine applicable commission rule (merchant > region > global)
  const now = new Date();
  const rule = await db.query.commissionRules.findFirst({
    where: and(
      eq(commissionRules.type, "repair_service"),
      or(
        eq(commissionRules.merchantId, session.user.merchantId!),
        and(isNull(commissionRules.merchantId), eq(commissionRules.scope, "global")),
      ),
      or(isNull(commissionRules.validFrom), lte(commissionRules.validFrom, now)),
      or(isNull(commissionRules.validTo), lte(now, commissionRules.validTo as never)),
    ),
    orderBy: (t, { desc }) => [desc(t.priority)],
  });

  const rate           = rule ? parseFloat(rule.rate.toString()) : 0.08;
  const grossAmount    = parseFloat(booking.servicePrice.toString());
  const commissionAmt  = Math.round(grossAmount * rate * 100) / 100;
  const netAmount      = grossAmount - commissionAmt;

  await db.transaction(async (tx) => {
    await tx.update(repairBookings)
      .set({ status: "completed", merchantNotes: merchantNotes ?? booking.merchantNotes, updatedAt: now })
      .where(eq(repairBookings.id, id));

    await tx.insert(commissionLedger).values({
      bookingId:       booking.id,
      merchantId:      booking.merchantId,
      ruleId:          rule?.id,
      grossAmount:     grossAmount.toString(),
      commissionRate:  rate.toString(),
      commissionAmount: commissionAmt.toString(),
      netAmount:       netAmount.toString(),
    });
  });

  return NextResponse.json({ success: true, data: { grossAmount, commissionRate: rate, netAmount } });
}
