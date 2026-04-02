import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products, brands, categories } from "@/lib/db/schema/products";
import { eq, and, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q          = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId");
  const type       = searchParams.get("type");

  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        q ? ilike(products.name, `%${q}%`) : undefined,
        categoryId ? eq(products.categoryId, categoryId) : undefined,
        type ? eq(products.type, type as never) : undefined,
      ),
    )
    .orderBy(products.createdAt)
    .limit(200);

  return NextResponse.json({ success: true, data: rows, total: rows.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, sku, type, categoryId, brandId, description, basePrice, imageUrls, compatibility } = body;

  if (!name || !sku || !type) {
    return NextResponse.json({ success: false, error: "name, sku, type required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + sku.toLowerCase();

  const [product] = await db.insert(products).values({
    name, sku, slug, type, categoryId, brandId, description,
    basePrice: basePrice?.toString(), imageUrls, compatibility,
    status: "active",
  }).returning();

  return NextResponse.json({ success: true, data: product }, { status: 201 });
}
