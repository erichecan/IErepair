import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const merchantId = parseInt(id, 10);
  if (isNaN(merchantId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const services = await prisma.merchantService.findMany({
      where: { merchantId, isActive: true },
      include: {
        repairService: {
          include: {
            repairType: true,
            deviceModel: { include: { brand: { include: { category: true } } } },
          },
        },
      },
      orderBy: { price: "asc" },
    });

    return Response.json({
      services: services.map((ms) => ({
        id: ms.id,
        repairServiceId: ms.repairServiceId,
        price: Number(ms.price),
        serviceName: ms.repairService.repairType.name,
        deviceModel: ms.repairService.deviceModel.name,
        deviceBrand: ms.repairService.deviceModel.brand.name,
        deviceCategory: ms.repairService.deviceModel.brand.category.name,
        categoryId: ms.repairService.deviceModel.brand.categoryId,
        durationMinutes: ms.repairService.durationMinutes,
      })),
    });
  } catch (error) {
    console.error("[Public Merchant Services Error]", error);
    return Response.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
