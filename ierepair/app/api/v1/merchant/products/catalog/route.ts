import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema/products";
import { eq, and, ilike } from "drizzle-orm";

// GET /api/v1/merchant/products/catalog — browse master catalog
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "merchant") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q          = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId");

  const rows = await db
    .select({
      id: products.id, name: products.name, sku: products.sku,
      type: products.type, imageUrls: products.imageUrls,
      basePrice: products.basePrice, compatibility: products.compatibility,
      categoryId: products.categoryId, brandId: products.brandId,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        q ? ilike(products.name, `%${q}%`) : undefined,
        categoryId ? eq(products.categoryId, categoryId) : undefined,
      ),
    )
    .limit(100);

  return NextResponse.json({ success: true, data: rows });
}
