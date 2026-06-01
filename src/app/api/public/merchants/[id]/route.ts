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
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId, isActive: true },
      include: {
        merchantHours: { orderBy: { dayOfWeek: "asc" } },
        merchantServices: {
          where: { isActive: true },
          include: {
            repairService: {
              include: {
                repairType: true,
                deviceModel: { include: { brand: { include: { category: true } } } },
              },
            },
          },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!merchant) {
      return Response.json({ error: "Merchant not found" }, { status: 404 });
    }

    return Response.json({
      id: merchant.id,
      name: merchant.name,
      address: merchant.address,
      eircode: merchant.eircode,
      phone: merchant.phone,
      description: merchant.description,
      lat: merchant.lat,
      lng: merchant.lng,
      hours: merchant.merchantHours,
      services: merchant.merchantServices.map((ms) => ({
        id: ms.id,
        repairServiceId: ms.repairServiceId,
        price: Number(ms.price),
        serviceName: ms.repairService.repairType.name,
        deviceModel: ms.repairService.deviceModel.name,
        deviceBrand: ms.repairService.deviceModel.brand.name,
        deviceCategory: ms.repairService.deviceModel.brand.category.name,
        durationMinutes: ms.repairService.durationMinutes,
      })),
    });
  } catch (error) {
    console.error("[Public Merchant Detail Error]", error);
    return Response.json({ error: "Failed to fetch merchant" }, { status: 500 });
  }
}
