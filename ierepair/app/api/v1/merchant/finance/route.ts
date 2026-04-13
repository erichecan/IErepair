import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commissionLedger } from "@/lib/db/schema/commission";
import { repairBookings } from "@/lib/db/schema/bookings";
import { and, gte, lt, eq, count, desc, isNull, sql } from "drizzle-orm";

function parseMonth(raw: string | null): { start: Date; end: Date; label: string } | null {
  const input = raw ?? new Date().toISOString().slice(0, 7);
  const m = input.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const [, y, mo] = m.map(Number);
  if (mo < 1 || mo > 12) return null;
  return {
    start: new Date(Date.UTC(y, mo - 1, 1)),
    end:   new Date(Date.UTC(y, mo, 1)),
    label: input,
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant" || !session.user.merchantId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const monthParam = request.nextUrl.searchParams.get("month");
  const range = parseMonth(monthParam);
  if (!range) {
    return NextResponse.json({ success: false, error: "Invalid month — use YYYY-MM" }, { status: 400 });
  }

  const merchantId = session.user.merchantId;
  const { start: startDate, end: endDate, label: month } = range;

  const whereClause = and(
    eq(commissionLedger.merchantId, merchantId),
    gte(commissionLedger.createdAt, startDate),
    lt(commissionLedger.createdAt, endDate),
  );

  try {
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
        gte(repairBookings.createdAt, startDate),
        lt(repairBookings.createdAt, endDate),
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
  } catch (error) {
    console.error("[merchant/finance] DB error", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
