import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET(req: Request) {
  try {
    const session = await requireMerchantSession();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const q = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, unknown> = { status: "active" };
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (q) where.name = { contains: q, mode: "insensitive" };

    const [products, total, selected] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
      prisma.merchantProduct.findMany({
        where: { merchantId: session.merchantId },
        select: { productId: true, price: true, isActive: true },
      }),
    ]);

    const selectedMap = new Map(selected.map(s => [s.productId, s]));

    return Response.json({
      products: products.map(p => ({
        ...p,
        basePriceMin: p.basePriceMin ? Number(p.basePriceMin) : null,
        basePriceMax: p.basePriceMax ? Number(p.basePriceMax) : null,
        selected: selectedMap.has(p.id),
        myPrice: selectedMap.has(p.id) ? Number(selectedMap.get(p.id)!.price) : null,
      })),
      total,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
