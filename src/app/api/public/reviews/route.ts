import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    orderNumber: string;
    rating: number;
    comment?: string;
  };

  const { orderNumber, rating, comment } = body;
  if (!orderNumber) return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "评分必须为 1-5" }, { status: 400 });
  }

  const booking = await prisma.repairBooking.findUnique({
    where: { orderNumber },
    select: { id: true, merchantId: true, userName: true, status: true, review: { select: { id: true } } },
  });

  if (!booking) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  if (booking.status !== "completed") return NextResponse.json({ error: "只有已完成的订单才能评价" }, { status: 400 });
  if (booking.review) return NextResponse.json({ error: "该订单已评价过" }, { status: 400 });

  const review = await prisma.merchantReview.create({
    data: {
      merchantId: booking.merchantId,
      bookingId: booking.id,
      userName: booking.userName,
      rating,
      comment: comment?.trim() || null,
    },
  });

  return NextResponse.json({ review });
}
