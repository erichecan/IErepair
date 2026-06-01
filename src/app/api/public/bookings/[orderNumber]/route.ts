import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  pending_confirm: "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  try {
    const booking = await prisma.repairBooking.findUnique({
      where: { orderNumber },
      include: {
        merchant: { select: { name: true, address: true, eircode: true, phone: true } },
        repairService: {
          include: {
            repairType: true,
            deviceModel: { include: { brand: true } },
          },
        },
      },
    });

    if (!booking) {
      return Response.json({ error: "订单不存在" }, { status: 404 });
    }

    return Response.json({
      orderNumber: booking.orderNumber,
      status: booking.status,
      statusLabel: STATUS_LABEL[booking.status] ?? booking.status,
      merchantName: booking.merchant.name,
      merchantAddress: booking.merchant.address,
      merchantEircode: booking.merchant.eircode,
      merchantPhone: booking.merchant.phone,
      serviceName: booking.repairService.repairType.name,
      deviceModel: booking.repairService.deviceModel.name,
      deviceBrand: booking.repairService.deviceModel.brand.name,
      appointmentTime: booking.appointmentTime,
      quotedPrice: Number(booking.quotedPrice),
      actualPrice: booking.actualPrice != null ? Number(booking.actualPrice) : null,
      notes: booking.notes,
      cancelReason: booking.cancelReason,
      createdAt: booking.createdAt,
    });
  } catch (error) {
    console.error("[Public Booking Lookup Error]", error);
    return Response.json({ error: "查询失败" }, { status: 500 });
  }
}
