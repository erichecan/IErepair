import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: Request) {
  try {
    const session = await requireMerchantSession();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const modelId = searchParams.get("modelId");

    const where: Record<string, unknown> = { isActive: true };
    if (modelId) {
      where.deviceModelId = parseInt(modelId);
    } else if (brandId) {
      where.deviceModel = { brandId: parseInt(brandId) };
    } else if (categoryId) {
      where.deviceModel = { brand: { categoryId: parseInt(categoryId) } };
    }

    const [services, selected] = await Promise.all([
      prisma.repairService.findMany({
        where,
        include: {
          deviceModel: { include: { brand: { include: { category: true } } } },
          repairType: true,
        },
        orderBy: [{ deviceModel: { brand: { category: { sortOrder: "asc" } } } }, { deviceModel: { brand: { sortOrder: "asc" } } }],
      }),
      prisma.merchantService.findMany({
        where: { merchantId: session.merchantId },
        select: { repairServiceId: true, price: true, isActive: true },
      }),
    ]);

    const selectedMap = new Map(selected.map(s => [s.repairServiceId, s]));

    return Response.json({
      services: services.map(s => ({
        id: s.id,
        basePriceMin: Number(s.basePriceMin),
        basePriceMax: Number(s.basePriceMax),
        durationMinutes: s.durationMinutes,
        deviceModel: s.deviceModel,
        repairType: s.repairType,
        selected: selectedMap.has(s.id),
        myPrice: selectedMap.has(s.id) ? Number(selectedMap.get(s.id)!.price) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
