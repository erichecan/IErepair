import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: NextRequest) {
  const session = await requireMerchantSession();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take = 20;
  const skip = (page - 1) * take;

  const [reviews, total] = await Promise.all([
    prisma.merchantReview.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      include: {
        booking: { select: { orderNumber: true, appointmentTime: true } },
      },
    }),
    prisma.merchantReview.count({ where: { merchantId: session.merchantId } }),
  ]);

  const agg = await prisma.merchantReview.aggregate({
    where: { merchantId: session.merchantId, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    reviews,
    total,
    page,
    pages: Math.ceil(total / take),
    avgRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null,
    reviewCount: agg._count.rating,
  });
}
