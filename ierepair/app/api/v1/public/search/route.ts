import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eircodeToCoords } from "@/lib/geo";
import { findNearbyMerchants } from "@/lib/db/queries/merchants";
import { products, merchantProducts, merchants, categories, brands } from "@/lib/db/schema";
import { eq, and, ilike, inArray, sql } from "drizzle-orm";

// GET /api/v1/public/search?q=iphone&eircode=D01A234&type=product|merchant|all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q        = searchParams.get("q") ?? "";
    const eircode  = searchParams.get("eircode") ?? "";
    const type     = searchParams.get("type") ?? "all";
    const radiusKm = parseInt(searchParams.get("radius") ?? "20", 10);

    let coords: { lat: number; lng: number } | null = null;
    if (eircode) {
      try { coords = await eircodeToCoords(eircode); } catch { /* skip geo filter */ }
    }

    const results: { products?: unknown[]; merchants?: unknown[] } = {};

    // ── Product search ──────────────────────────────────────────────
    if (type === "all" || type === "product") {
      let nearbyMerchantIds: string[] = [];

      if (coords) {
        const nearby = await findNearbyMerchants(coords.lat, coords.lng, radiusKm);
        nearbyMerchantIds = nearby.map((m) => m.id);
      }

      const productRows = await db
        .select({
          id:          products.id,
          name:        products.name,
          slug:        products.slug,
          type:        products.type,
          imageUrls:   products.imageUrls,
          categoryId:  products.categoryId,
          brandId:     products.brandId,
          compatibility: products.compatibility,
          minPrice: sql<string>`MIN(${merchantProducts.price})`,
          merchantCount: sql<number>`COUNT(DISTINCT ${merchantProducts.merchantId})`,
        })
        .from(products)
        .leftJoin(merchantProducts, eq(products.id, merchantProducts.productId))
        .where(
          and(
            eq(products.status, "active"),
            q ? ilike(products.name, `%${q}%`) : undefined,
            nearbyMerchantIds.length > 0
              ? inArray(merchantProducts.merchantId, nearbyMerchantIds)
              : undefined,
          ),
        )
        .groupBy(products.id)
        .limit(40);

      results.products = productRows;
    }

    // ── Merchant search ─────────────────────────────────────────────
    if (type === "all" || type === "merchant") {
      if (coords) {
        const nearby = await findNearbyMerchants(coords.lat, coords.lng, radiusKm);
        results.merchants = q
          ? nearby.filter((m) =>
              m.shopName.toLowerCase().includes(q.toLowerCase()) ||
              (m.city ?? "").toLowerCase().includes(q.toLowerCase()),
            )
          : nearby;
      } else {
        const merchantRows = await db
          .select({
            id: merchants.id, slug: merchants.slug, shopName: merchants.shopName,
            city: merchants.city, eircode: merchants.eircode,
            rating: merchants.rating, reviewCount: merchants.reviewCount,
            logoUrl: merchants.logoUrl,
          })
          .from(merchants)
          .where(
            and(
              eq(merchants.status, "active"),
              q ? ilike(merchants.shopName, `%${q}%`) : undefined,
            ),
          )
          .limit(20);
        results.merchants = merchantRows;
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 });
  }
}
