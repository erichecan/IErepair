import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: Request) {
  try {
    await requireMerchantSession();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = parseInt(categoryId);

    const brands = await prisma.deviceBrand.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, categoryId: true },
    });
    return Response.json({ brands });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
