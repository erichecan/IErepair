import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: NextRequest) {
  try {
    const session = await requireMerchantSession();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: {
      merchantId: number;
      status?: string;
      appointmentTime?: { gte?: Date; lte?: Date };
    } = { merchantId: session.merchantId };

    if (status && status !== "all") where.status = status;
    if (dateFrom || dateTo) {
      where.appointmentTime = {};
      if (dateFrom) where.appointmentTime.gte = new Date(dateFrom);
      if (dateTo) where.appointmentTime.lte = new Date(dateTo);
    }

    const [bookings, total] = await Promise.all([
      prisma.repairBooking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          repairService: {
            include: {
              deviceModel: { include: { brand: { include: { category: true } } } },
              repairType: true,
            },
          },
        },
      }),
      prisma.repairBooking.count({ where }),
    ]);

    const pendingCount = await prisma.repairBooking.count({
      where: { merchantId: session.merchantId, status: "pending_confirm" },
    });

    return NextResponse.json({ bookings, total, pendingCount });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant Bookings GET]", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
