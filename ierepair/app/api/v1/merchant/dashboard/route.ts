import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { repairBookings } from "@/lib/db/schema/bookings";
import { eq, and, gte, lt, count, sum, sql } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const merchantId = session.user.merchantId!;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);

  const [todayBookings, pendingCount, monthRevenue] = await Promise.all([
    db.query.repairBookings.findMany({
      where: and(
        eq(repairBookings.merchantId, merchantId),
        gte(repairBookings.scheduledAt, todayStart),
        lt(repairBookings.scheduledAt, todayEnd),
      ),
      orderBy: (t, { asc }) => [asc(t.scheduledAt)],
    }),

    db.select({ count: count() })
      .from(repairBookings)
      .where(and(eq(repairBookings.merchantId, merchantId), eq(repairBookings.status, "pending"))),

    db.select({ total: sum(repairBookings.servicePrice) })
      .from(repairBookings)
      .where(and(
        eq(repairBookings.merchantId, merchantId),
        eq(repairBookings.status, "completed"),
        gte(repairBookings.updatedAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      )),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      todayBookings,
      pendingCount: pendingCount[0]?.count ?? 0,
      monthRevenue: monthRevenue[0]?.total ?? "0",
    },
  });
}
