import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { merchantProducts, products } from "@/lib/db/schema/products";
import { eq, and } from "drizzle-orm";

// GET — list merchant's selected products
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      mpId:       merchantProducts.id,
      price:      merchantProducts.price,
      stock:      merchantProducts.stock,
      isAvailable: merchantProducts.isAvailable,
      productId:  products.id,
      name:       products.name,
      sku:        products.sku,
      imageUrls:  products.imageUrls,
      type:       products.type,
    })
    .from(merchantProducts)
    .innerJoin(products, eq(merchantProducts.productId, products.id))
    .where(eq(merchantProducts.merchantId, session.user.merchantId!));

  return NextResponse.json({ success: true, data: rows });
}

// POST — add product from catalog
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId, price, stock } = body as { productId: string; price: number; stock?: number };

  if (!productId || price === undefined) {
    return NextResponse.json({ success: false, error: "productId and price required" }, { status: 400 });
  }

  // Check product exists in master catalog
  const product = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!product || product.status !== "active") {
    return NextResponse.json({ success: false, error: "Product not in catalog" }, { status: 404 });
  }

  // Check not already added
  const existing = await db.query.merchantProducts.findFirst({
    where: and(
      eq(merchantProducts.merchantId, session.user.merchantId!),
      eq(merchantProducts.productId, productId),
    ),
  });
  if (existing) {
    return NextResponse.json({ success: false, error: "Product already added" }, { status: 409 });
  }

  const [mp] = await db.insert(merchantProducts).values({
    merchantId: session.user.merchantId!,
    productId,
    price: price.toString(),
    stock: stock ?? 0,
  }).returning();

  return NextResponse.json({ success: true, data: mp }, { status: 201 });
}
