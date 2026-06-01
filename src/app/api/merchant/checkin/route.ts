import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function POST(req: NextRequest) {
  const session = await requireMerchantSession();

  const { orderNumber } = (await req.json()) as { orderNumber: string };
  if (!orderNumber) {
    return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  }

  const booking = await prisma.repairBooking.findFirst({
    where: { orderNumber, merchantId: session.merchantId },
    include: {
      repairService: {
        include: {
          repairType: { select: { name: true } },
          deviceModel: { select: { name: true, brand: { select: { name: true } } } },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "订单不存在或不属于本门店" }, { status: 404 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      { error: `当前状态为"${booking.status}"，仅已确认的预约可以 check-in` },
      { status: 409 }
    );
  }

  await prisma.repairBooking.update({
    where: { id: booking.id },
    data: { status: "in_progress" },
  });

  return NextResponse.json({
    ok: true,
    orderNumber: booking.orderNumber,
    userName: booking.userName,
    device: `${booking.repairService.deviceModel.brand.name} ${booking.repairService.deviceModel.name}`,
    repairType: booking.repairService.repairType.name,
  });
}
