import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commissionLedger } from "@/lib/db/schema/commission";
import { merchants } from "@/lib/db/schema/merchants";
import { and, gte, lt, eq, count, desc, sql } from "drizzle-orm";

function parseMonth(raw: string | null): { start: Date; end: Date; label: string } | null {
  const input = raw ?? new Date().toISOString().slice(0, 7);
  const m = input.match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const [, yStr, moStr] = m;
  const y = Number(yStr);
  const mo = Number(moStr);
  if (mo < 1 || mo > 12) return null;
  return {
    start: new Date(Date.UTC(y, mo - 1, 1)),
    end:   new Date(Date.UTC(y, mo, 1)),
    label: input,
  };
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
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

  try {
    // Platform-wide totals
    const [totals] = await db
      .select({
        totalRepairRevenue:  sql<string>`COALESCE(SUM(${commissionLedger.grossAmount}), '0')`,
        totalCommission:     sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
        totalNetToMerchants: sql<string>`COALESCE(SUM(${commissionLedger.netAmount}), '0')`,
        completedBookings:   count(),
      })
      .from(commissionLedger)
      .where(inMonth);

    // Per-merchant breakdown sorted by revenue descending
    const perMerchant = await db
      .select({
        merchantId:        commissionLedger.merchantId,
        shopName:          merchants.shopName,
        repairRevenue:     sql<string>`COALESCE(SUM(${commissionLedger.grossAmount}), '0')`,
        commissionAmount:  sql<string>`COALESCE(SUM(${commissionLedger.commissionAmount}), '0')`,
        netAmount:         sql<string>`COALESCE(SUM(${commissionLedger.netAmount}), '0')`,
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
  } catch (error) {
    console.error("[admin/finance] DB error", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
