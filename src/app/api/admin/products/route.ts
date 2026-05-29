import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (status) where.status = status;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } } },
    });

    return Response.json({
      products: products.map(p => ({
        ...p,
        basePriceMin: p.basePriceMin ? Number(p.basePriceMin) : null,
        basePriceMax: p.basePriceMax ? Number(p.basePriceMax) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminSession();
    const body = await req.json();
    const { name, nameEn, description, brand, categoryId, basePriceMin, basePriceMax, images } = body;

    if (!name?.trim() || !categoryId) {
      return Response.json({ error: "商品名称和品类为必填项" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        nameEn: nameEn?.trim() || null,
        description: description?.trim() || null,
        brand: brand?.trim() || null,
        categoryId: parseInt(categoryId),
        basePriceMin: basePriceMin != null ? basePriceMin : null,
        basePriceMax: basePriceMax != null ? basePriceMax : null,
        images: Array.isArray(images) ? images.filter((u: unknown) => typeof u === "string") : [],
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return Response.json({
      product: {
        ...product,
        basePriceMin: product.basePriceMin ? Number(product.basePriceMin) : null,
        basePriceMax: product.basePriceMax ? Number(product.basePriceMax) : null,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Products POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
