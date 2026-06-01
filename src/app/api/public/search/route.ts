import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { geocodeEircode, haversineKm } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const eircode = searchParams.get("eircode")?.trim() ?? "";
  const radiusKm = 30;

  try {
    let userCoords: { lat: number; lng: number } | null = null;
    if (eircode) {
      userCoords = await geocodeEircode(eircode);
    }

    const merchants = await prisma.merchant.findMany({
      where: { isActive: true },
      include: {
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
        },
        merchantHours: { orderBy: { dayOfWeek: "asc" } },
      },
    });

    type ResultItem = {
      merchantId: number;
      merchantName: string;
      address: string | null;
      eircode: string | null;
      phone: string | null;
      distanceKm: number | null;
      serviceId: number;
      repairServiceId: number;
      serviceName: string;
      deviceModel: string;
      deviceBrand: string;
      deviceCategory: string;
      price: number;
      durationMinutes: number;
    };

    const results: ResultItem[] = [];

    for (const merchant of merchants) {
      let distanceKm: number | null = null;
      if (userCoords && merchant.lat != null && merchant.lng != null) {
        distanceKm = haversineKm(userCoords.lat, userCoords.lng, merchant.lat, merchant.lng);
        if (distanceKm > radiusKm) continue;
      }

      for (const ms of merchant.merchantServices) {
        const rs = ms.repairService;
        const typeName = rs.repairType.name;
        const modelName = rs.deviceModel.name;
        const brandName = rs.deviceModel.brand.name;
        const categoryName = rs.deviceModel.brand.category.name;

        const searchText = `${typeName} ${modelName} ${brandName} ${categoryName}`.toLowerCase();
        if (q && !searchText.includes(q.toLowerCase())) continue;

        results.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          address: merchant.address,
          eircode: merchant.eircode,
          phone: merchant.phone,
          distanceKm,
          serviceId: ms.id,
          repairServiceId: rs.id,
          serviceName: typeName,
          deviceModel: modelName,
          deviceBrand: brandName,
          deviceCategory: categoryName,
          price: Number(ms.price),
          durationMinutes: rs.durationMinutes,
        });
      }
    }

    results.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    return Response.json({ results, total: results.length });
  } catch (error) {
    console.error("[Public Search Error]", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
