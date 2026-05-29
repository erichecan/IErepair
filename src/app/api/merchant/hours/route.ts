import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET() {
  try {
    const session = await requireMerchantSession();
    const hours = await prisma.merchantHours.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { dayOfWeek: "asc" },
    });
    return Response.json({ hours });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireMerchantSession();
    const { hours } = await req.json() as {
      hours: Array<{ dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }>;
    };

    if (!Array.isArray(hours) || hours.length === 0) {
      return Response.json({ error: "无效数据" }, { status: 400 });
    }

    await prisma.$transaction(
      hours.map(h =>
        prisma.merchantHours.upsert({
          where: { merchantId_dayOfWeek: { merchantId: session.merchantId, dayOfWeek: h.dayOfWeek } },
          update: { openTime: h.isClosed ? null : h.openTime, closeTime: h.isClosed ? null : h.closeTime, isClosed: h.isClosed },
          create: { merchantId: session.merchantId, dayOfWeek: h.dayOfWeek, openTime: h.isClosed ? null : h.openTime, closeTime: h.isClosed ? null : h.closeTime, isClosed: h.isClosed },
        })
      )
    );

    const updated = await prisma.merchantHours.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { dayOfWeek: "asc" },
    });
    return Response.json({ hours: updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant Hours PUT]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
