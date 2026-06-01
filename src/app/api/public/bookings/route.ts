import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  pending_confirm: "待确认",
  confirmed: "已确认",
  in_progress: "维修中",
  completed: "已完成",
  cancelled: "已取消",
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim();

    if (!phone) {
      return Response.json({ error: "请提供手机号" }, { status: 400 });
    }

    const bookings = await prisma.repairBooking.findMany({
      where: { userPhone: phone },
      orderBy: { createdAt: "desc" },
      include: {
        merchant: { select: { name: true, address: true, phone: true } },
        repairService: {
          include: {
            repairType: { select: { name: true } },
            deviceModel: {
              select: {
                name: true,
                brand: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return Response.json(
      bookings.map((b) => ({
        orderNumber: b.orderNumber,
        status: b.status,
        statusLabel: STATUS_LABELS[b.status] ?? b.status,
        merchantName: b.merchant.name,
        merchantAddress: b.merchant.address,
        merchantPhone: b.merchant.phone,
        serviceName: b.repairService.repairType.name,
        deviceBrand: b.repairService.deviceModel.brand.name,
        deviceModel: b.repairService.deviceModel.name,
        appointmentTime: b.appointmentTime,
        quotedPrice: Number(b.quotedPrice),
        createdAt: b.createdAt,
      }))
    );
  } catch (error) {
    console.error("[Public Bookings By Phone Error]", error);
    return Response.json({ error: "查询失败" }, { status: 500 });
  }
}

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IER-${ts}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      merchantId: number;
      repairServiceId: number;
      userName: string;
      userPhone: string;
      userEmail?: string;
      appointmentTime: string;
      notes?: string;
    };

    const { merchantId, repairServiceId, userName, userPhone, userEmail, appointmentTime, notes } = body;

    if (!merchantId || !repairServiceId || !userName || !userPhone || !appointmentTime) {
      return Response.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const merchantService = await prisma.merchantService.findFirst({
      where: { merchantId, repairServiceId, isActive: true },
      include: { repairService: true },
    });

    if (!merchantService) {
      return Response.json({ error: "该门店不提供此服务" }, { status: 404 });
    }

    const orderNumber = generateOrderNumber();

    const booking = await prisma.repairBooking.create({
      data: {
        orderNumber,
        merchantId,
        repairServiceId,
        userName,
        userPhone,
        userEmail: userEmail || null,
        appointmentTime: new Date(appointmentTime),
        quotedPrice: merchantService.price,
        notes: notes || null,
        status: "pending_confirm",
      },
      include: {
        merchant: { select: { name: true, address: true, phone: true } },
        repairService: { include: { repairType: true, deviceModel: true } },
      },
    });

    return Response.json(
      {
        orderNumber: booking.orderNumber,
        status: booking.status,
        merchantName: booking.merchant.name,
        merchantAddress: booking.merchant.address,
        merchantPhone: booking.merchant.phone,
        serviceName: booking.repairService.repairType.name,
        deviceModel: booking.repairService.deviceModel.name,
        appointmentTime: booking.appointmentTime,
        quotedPrice: Number(booking.quotedPrice),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Public Booking Create Error]", error);
    return Response.json({ error: "预约提交失败" }, { status: 500 });
  }
}
