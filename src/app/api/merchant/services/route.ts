import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET() {
  try {
    const session = await requireMerchantSession();
    const items = await prisma.merchantService.findMany({
      where: { merchantId: session.merchantId },
      include: {
        repairService: {
          include: {
            deviceModel: { include: { brand: { include: { category: true } } } },
            repairType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({
      services: items.map(i => ({
        id: i.id,
        price: Number(i.price),
        isActive: i.isActive,
        repairServiceId: i.repairServiceId,
        repairService: {
          ...i.repairService,
          basePriceMin: Number(i.repairService.basePriceMin),
          basePriceMax: Number(i.repairService.basePriceMax),
        },
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireMerchantSession();
    const { repairServiceId, price } = await req.json();

    if (!repairServiceId || price == null || price <= 0) {
      return Response.json({ error: "repairServiceId 和有效价格为必填项" }, { status: 400 });
    }

    const repairService = await prisma.repairService.findUnique({ where: { id: parseInt(repairServiceId), isActive: true } });
    if (!repairService) return Response.json({ error: "维修服务不存在" }, { status: 404 });

    const item = await prisma.merchantService.upsert({
      where: { merchantId_repairServiceId: { merchantId: session.merchantId, repairServiceId: parseInt(repairServiceId) } },
      update: { price, isActive: true },
      create: { merchantId: session.merchantId, repairServiceId: parseInt(repairServiceId), price },
      include: {
        repairService: {
          include: {
            deviceModel: { include: { brand: { include: { category: true } } } },
            repairType: true,
          },
        },
      },
    });

    return Response.json({
      service: {
        id: item.id,
        price: Number(item.price),
        isActive: item.isActive,
        repairServiceId: item.repairServiceId,
        repairService: {
          ...item.repairService,
          basePriceMin: Number(item.repairService.basePriceMin),
          basePriceMax: Number(item.repairService.basePriceMax),
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant Services POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
