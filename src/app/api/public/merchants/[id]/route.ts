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
    const [merchant, reviewAgg, recentReviews] = await Promise.all([
      prisma.merchant.findUnique({
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
      }),
      prisma.merchantReview.aggregate({
        where: { merchantId, isVisible: true },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.merchantReview.findMany({
        where: { merchantId, isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, userName: true, rating: true, comment: true, createdAt: true },
      }),
    ]);

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
      images: merchant.images,
      lat: merchant.lat,
      lng: merchant.lng,
      avgRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(1)) : null,
      reviewCount: reviewAgg._count.rating,
      reviews: recentReviews,
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
