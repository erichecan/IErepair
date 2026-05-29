import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireMerchantSession(req);
  const { id } = await params;
  const bookingId = parseInt(id);

  const booking = await prisma.repairBooking.findFirst({
    where: { id: bookingId, merchantId: session.merchantId },
  });
  if (!booking) return NextResponse.json({ error: "预约不存在" }, { status: 404 });

  const body = await req.json();
  const { action, cancelReason, actualPrice } = body;

  const transitions: Record<string, { from: string[]; to: string }> = {
    accept: { from: ["pending_confirm"], to: "confirmed" },
    reject: { from: ["pending_confirm", "confirmed"], to: "cancelled" },
    complete: { from: ["confirmed"], to: "completed" },
  };

  const t = transitions[action];
  if (!t) return NextResponse.json({ error: "无效操作" }, { status: 400 });
  if (!t.from.includes(booking.status)) {
    return NextResponse.json({ error: `当前状态 ${booking.status} 不允许该操作` }, { status: 400 });
  }

  if (action === "reject" && !cancelReason?.trim()) {
    return NextResponse.json({ error: "拒绝预约需填写原因" }, { status: 400 });
  }
  if (action === "complete" && (actualPrice === undefined || actualPrice === null || isNaN(Number(actualPrice)))) {
    return NextResponse.json({ error: "完成维修需填写实际费用" }, { status: 400 });
  }

  const updated = await prisma.repairBooking.update({
    where: { id: bookingId },
    data: {
      status: t.to,
      ...(action === "reject" && { cancelReason }),
      ...(action === "complete" && { actualPrice: Number(actualPrice) }),
    },
    include: {
      repairService: {
        include: {
          deviceModel: { include: { brand: true } },
          repairType: true,
        },
      },
    },
  });

  return NextResponse.json({ booking: updated });
}
