import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, merchantProducts, merchants, brands, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product || product.status !== "active") {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Merchants offering this product
    const offers = await db
      .select({
        merchantId:  merchantProducts.merchantId,
        price:       merchantProducts.price,
        stock:       merchantProducts.stock,
        shopName:    merchants.shopName,
        slug:        merchants.slug,
        city:        merchants.city,
        eircode:     merchants.eircode,
        rating:      merchants.rating,
        logoUrl:     merchants.logoUrl,
      })
      .from(merchantProducts)
      .innerJoin(merchants, eq(merchantProducts.merchantId, merchants.id))
      .where(
        and(
          eq(merchantProducts.productId, id),
          eq(merchantProducts.isAvailable, true),
          eq(merchants.status, "active"),
        ),
      )
      .orderBy(merchantProducts.price)
      .limit(20);

    return NextResponse.json({ success: true, data: { product, offers } });
  } catch (err) {
    console.error("[product/id]", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
