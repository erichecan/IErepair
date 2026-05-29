import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: Request) {
  try {
    await requireMerchantSession();
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");

    const where: Record<string, unknown> = { isActive: true };
    if (brandId) where.brandId = parseInt(brandId);

    const models = await prisma.deviceModel.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, brandId: true, year: true },
    });
    return Response.json({ models });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
