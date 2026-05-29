import { prisma } from "@/lib/prisma";
import { requireMerchantSession } from "@/lib/merchant-auth";

export async function GET() {
  try {
    const session = await requireMerchantSession();
    const items = await prisma.merchantProduct.findMany({
      where: { merchantId: session.merchantId },
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({
      products: items.map(i => ({
        id: i.id,
        price: Number(i.price),
        isActive: i.isActive,
        productId: i.productId,
        product: {
          ...i.product,
          basePriceMin: i.product.basePriceMin ? Number(i.product.basePriceMin) : null,
          basePriceMax: i.product.basePriceMax ? Number(i.product.basePriceMax) : null,
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
    const { productId, price } = await req.json();

    if (!productId || price == null || price <= 0) {
      return Response.json({ error: "productId 和有效价格为必填项" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(productId), status: "active" } });
    if (!product) return Response.json({ error: "商品不存在" }, { status: 404 });

    const item = await prisma.merchantProduct.upsert({
      where: { merchantId_productId: { merchantId: session.merchantId, productId: parseInt(productId) } },
      update: { price, isActive: true },
      create: { merchantId: session.merchantId, productId: parseInt(productId), price },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    });

    return Response.json({
      product: {
        id: item.id,
        price: Number(item.price),
        isActive: item.isActive,
        productId: item.productId,
        product: {
          ...item.product,
          basePriceMin: item.product.basePriceMin ? Number(item.product.basePriceMin) : null,
          basePriceMax: item.product.basePriceMax ? Number(item.product.basePriceMax) : null,
        },
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[Merchant Products POST]", error);
    return Response.json({ error: "服务器错误" }, { status: 500 });
  }
}
