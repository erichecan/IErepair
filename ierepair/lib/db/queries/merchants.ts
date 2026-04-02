import { db } from "../index";
import { sql, eq } from "drizzle-orm";
import { merchants } from "../schema/merchants";

export interface NearbyMerchant {
  id: string;
  slug: string;
  shopName: string;
  eircode: string | null;
  city: string | null;
  rating: string | null;
  reviewCount: number;
  logoUrl: string | null;
  distance_km: number;
}

/**
 * Find merchants within radiusKm of a lat/lng point, ordered by distance.
 * Uses PostGIS ST_DWithin for index-based filtering.
 */
export async function findNearbyMerchants(
  lat: number,
  lng: number,
  radiusKm = 20,
): Promise<NearbyMerchant[]> {
  const result = await db.execute(sql`
    SELECT
      id, slug, shop_name AS "shopName", eircode, city,
      rating, review_count AS "reviewCount", logo_url AS "logoUrl",
      ROUND((ST_Distance(
        location::geography,
        ST_MakePoint(${lng}, ${lat})::geography
      ) / 1000)::numeric, 2) AS distance_km
    FROM merchants
    WHERE status = 'active'
      AND location IS NOT NULL
      AND ST_DWithin(
        location::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radiusKm * 1000}
      )
    ORDER BY distance_km ASC
    LIMIT 20
  `);

  return result as unknown as NearbyMerchant[];
}

export async function getMerchantBySlug(slug: string) {
  return db.query.merchants.findFirst({
    where: eq(merchants.slug, slug),
  });
}

export async function getMerchantById(id: string) {
  return db.query.merchants.findFirst({
    where: eq(merchants.id, id),
  });
}
