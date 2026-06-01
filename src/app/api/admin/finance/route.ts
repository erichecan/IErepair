import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

const COMMISSION_RATE = 0.10;

function getPeriodStart(period: string | null): Date {
  const now = new Date();
  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), q * 3, 1);
  }
  // default: month
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET(req: NextRequest) {
  await requireAdminSession();

  const period = req.nextUrl.searchParams.get("period");
  const since = getPeriodStart(period);

  const [statusCounts, completedBookings, merchantBreakdown] = await Promise.all([
    prisma.repairBooking.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { id: true },
    }),

    prisma.repairBooking.findMany({
      where: { status: "completed", createdAt: { gte: since } },
      select: { actualPrice: true, quotedPrice: true },
    }),

    prisma.repairBooking.groupBy({
      by: ["merchantId"],
      where: { status: "completed", createdAt: { gte: since } },
      _count: { id: true },
      _sum: { actualPrice: true, quotedPrice: true },
    }),
  ]);

  const totalRevenue = completedBookings.reduce((sum, b) => {
    return sum + Number(b.actualPrice ?? b.quotedPrice);
  }, 0);

  const platformCommission = totalRevenue * COMMISSION_RATE;

  const merchantIds = merchantBreakdown.map((m) => m.merchantId);
  const merchants = await prisma.merchant.findMany({
    where: { id: { in: merchantIds } },
    select: { id: true, name: true },
  });
  const merchantNameMap = new Map(merchants.map((m) => [m.id, m.name]));

  const merchantStats = merchantBreakdown.map((m) => {
    const revenue = Number(m._sum.actualPrice ?? m._sum.quotedPrice ?? 0);
    return {
      merchantId: m.merchantId,
      merchantName: merchantNameMap.get(m.merchantId) ?? "Unknown",
      completedBookings: m._count.id,
      revenue,
      commission: revenue * COMMISSION_RATE,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const statusMap: Record<string, number> = {};
  for (const row of statusCounts) {
    statusMap[row.status] = row._count.id;
  }

  return NextResponse.json({
    period: period ?? "month",
    since: since.toISOString(),
    commissionRate: COMMISSION_RATE,
    summary: {
      totalRevenue,
      platformCommission,
      totalCompletedBookings: completedBookings.length,
      statusCounts: statusMap,
    },
    merchants: merchantStats,
  });
}
