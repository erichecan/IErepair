import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { PAGE_SIZE } from "./repair-constants";

export { PAGE_SIZE } from "./repair-constants";

/** Category slug groups: maps a canonical category to DB slug fragments */
export const CATEGORY_GROUPS: Record<string, string[]> = {
  screen:    ["screen", "lcd"],
  battery:   ["battery"],
  "back-glass": ["back"],
  charging:  ["charging"],
};

export type DeviceListItem = {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  minPrice: number | null;
  imageUrl: string | null;
};

export type RepairServiceItem = {
  id: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number | null;
  estimatedMin: number | null;
};

export type DeviceDetail = {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  imageUrl: string | null;
  services: RepairServiceItem[];
};

export type BrandWithCount = {
  brand: string;
  deviceType: "phone" | "tablet";
  count: number;
  imageUrl: string | null;
};

export type DeviceBrowseItem = {
  deviceBrand: string;
  deviceModel: string;
  deviceSlug: string;
  deviceType: "phone" | "tablet";
  minPrice: number | null;
  imageUrl: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MerchantForDevice = {
  merchantId: string;
  merchantSlug: string;
  shopName: string;
  city: string | null;
  logoUrl: string | null;
  rating: string | null;
  reviewCount: number;
  serviceCount: number;
  minPrice: number | null;
  maxPrice: number | null;
};

async function _getMerchantsForDevice(deviceSlug: string): Promise<MerchantForDevice[]> {
  const rows = await db.execute(sql`
    SELECT
      m.id              AS "merchantId",
      m.slug            AS "merchantSlug",
      m.shop_name       AS "shopName",
      m.city,
      m.logo_url        AS "logoUrl",
      m.rating,
      m.review_count    AS "reviewCount",
      COUNT(ms.id)::int AS "serviceCount",
      MIN(ms.price)::numeric AS "minPrice",
      MAX(ms.price)::numeric AS "maxPrice"
    FROM merchants m
    INNER JOIN merchant_services ms ON ms.merchant_id = m.id AND ms.is_available = true
    INNER JOIN repair_services rs   ON rs.id = ms.repair_service_id AND rs.is_active = true
    WHERE m.status = 'active'
      AND rs.device_slug = ${deviceSlug}
    GROUP BY m.id, m.slug, m.shop_name, m.city, m.logo_url, m.rating, m.review_count
    ORDER BY m.rating DESC NULLS LAST, m.review_count DESC
  `);

  return (rows as unknown[]).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      merchantId:   String(row.merchantId ?? ""),
      merchantSlug: String(row.merchantSlug ?? ""),
      shopName:     String(row.shopName ?? ""),
      city:         row.city ? String(row.city) : null,
      logoUrl:      row.logoUrl ? String(row.logoUrl) : null,
      rating:       row.rating != null ? String(row.rating) : null,
      reviewCount:  Number(row.reviewCount ?? 0),
      serviceCount: Number(row.serviceCount ?? 0),
      minPrice:     row.minPrice != null ? Number(row.minPrice) : null,
      maxPrice:     row.maxPrice != null ? Number(row.maxPrice) : null,
    };
  });
}

/* ─── Internal query functions ─────────────────────────── */

async function _getDevicesByCategory(
  category: string,
  page: number = 1
): Promise<PaginatedResult<DeviceListItem>> {
  const fragments = CATEGORY_GROUPS[category];
  if (!fragments) return { items: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 };

  const likeConditions = sql.join(
    fragments.map((f) => sql`c.slug ILIKE ${"%" + f + "%"}`),
    sql` OR `
  );

  const offset = (page - 1) * PAGE_SIZE;

  const [countRows, rows] = await Promise.all([
    db.execute(sql`
      SELECT COUNT(DISTINCT rs.device_slug) as total
      FROM repair_services rs
      LEFT JOIN categories c ON rs.category_id = c.id
      WHERE rs.is_active = true
        AND rs.device_slug IS NOT NULL
        AND rs.device_model IS NOT NULL
        AND (${likeConditions})
    `),
    db.execute(sql`
      SELECT
        rs.device_brand,
        rs.device_model,
        rs.device_slug,
        MIN(rs.base_price::numeric) as min_price,
        MAX(rs.image_url) as image_url
      FROM repair_services rs
      LEFT JOIN categories c ON rs.category_id = c.id
      WHERE rs.is_active = true
        AND rs.device_slug IS NOT NULL
        AND rs.device_model IS NOT NULL
        AND (${likeConditions})
      GROUP BY rs.device_brand, rs.device_model, rs.device_slug
      ORDER BY rs.device_brand, rs.device_model
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
  ]);

  const total = Number((countRows[0] as Record<string, unknown>)?.total ?? 0);

  const items = (rows as unknown[]).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      deviceBrand: String(row.device_brand ?? ""),
      deviceModel: String(row.device_model ?? ""),
      deviceSlug:  String(row.device_slug ?? ""),
      minPrice:    row.min_price != null ? Number(row.min_price) : null,
      imageUrl:    row.image_url ? String(row.image_url) : null,
    };
  });

  return { items, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}

async function _getDeviceBySlug(slug: string): Promise<DeviceDetail | null> {
  const rows = await db.execute(sql`
    SELECT
      rs.id,
      rs.device_brand,
      rs.device_model,
      rs.device_slug,
      rs.image_url,
      rs.name,
      rs.base_price,
      rs.estimated_min,
      c.slug as category_slug,
      c.name as category_name
    FROM repair_services rs
    LEFT JOIN categories c ON rs.category_id = c.id
    WHERE rs.is_active = true
      AND rs.device_slug = ${slug}
    ORDER BY c.name, rs.name
  `);

  if (!rows.length) return null;

  const first = rows[0] as Record<string, unknown>;

  const services: RepairServiceItem[] = (rows as unknown[]).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      id:           String(row.id),
      name:         String(row.name ?? ""),
      categorySlug: String(row.category_slug ?? ""),
      categoryName: String(row.category_name ?? "Service"),
      basePrice:    row.base_price != null ? Number(row.base_price) : null,
      estimatedMin: row.estimated_min != null ? Number(row.estimated_min) : null,
    };
  });

  return {
    deviceBrand: String(first.device_brand ?? ""),
    deviceModel: String(first.device_model ?? ""),
    deviceSlug:  String(first.device_slug ?? ""),
    imageUrl:    first.image_url ? String(first.image_url) : null,
    services,
  };
}

async function _getBrandsWithCounts(deviceType?: string): Promise<BrandWithCount[]> {
  const typeCondition = deviceType ? sql` AND rs.device_type = ${deviceType}` : sql``;

  const rows = await db.execute(sql`
    SELECT
      rs.device_brand,
      rs.device_type,
      COUNT(DISTINCT rs.device_slug) as cnt,
      MAX(rs.image_url) as image_url
    FROM repair_services rs
    WHERE rs.is_active = true
      AND rs.device_brand IS NOT NULL
      AND rs.device_type IS NOT NULL
      ${typeCondition}
    GROUP BY rs.device_brand, rs.device_type
    ORDER BY cnt DESC
  `);

  return (rows as unknown[]).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      brand:      String(row.device_brand ?? ""),
      deviceType: String(row.device_type ?? "phone") as "phone" | "tablet",
      count:      Number(row.cnt ?? 0),
      imageUrl:   row.image_url ? String(row.image_url) : null,
    };
  });
}

async function _getDevicesByBrand(
  brand: string,
  deviceType?: string,
  page: number = 1
): Promise<PaginatedResult<DeviceBrowseItem>> {
  const typeCondition = deviceType ? sql` AND rs.device_type = ${deviceType}` : sql``;
  const offset = (page - 1) * PAGE_SIZE;

  const [countRows, rows] = await Promise.all([
    db.execute(sql`
      SELECT COUNT(DISTINCT rs.device_slug) as total
      FROM repair_services rs
      WHERE rs.is_active = true
        AND rs.device_brand = ${brand}
        AND rs.device_slug IS NOT NULL
        ${typeCondition}
    `),
    db.execute(sql`
      SELECT
        rs.device_brand,
        rs.device_model,
        rs.device_slug,
        rs.device_type,
        MIN(rs.base_price::numeric) as min_price,
        MAX(rs.image_url) as image_url
      FROM repair_services rs
      WHERE rs.is_active = true
        AND rs.device_brand = ${brand}
        AND rs.device_slug IS NOT NULL
        ${typeCondition}
      GROUP BY rs.device_brand, rs.device_model, rs.device_slug, rs.device_type
      ORDER BY rs.device_model
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `),
  ]);

  const total = Number((countRows[0] as Record<string, unknown>)?.total ?? 0);

  const items = (rows as unknown[]).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      deviceBrand: String(row.device_brand ?? ""),
      deviceModel: String(row.device_model ?? ""),
      deviceSlug:  String(row.device_slug ?? ""),
      deviceType:  (String(row.device_type ?? "phone")) as "phone" | "tablet",
      minPrice:    row.min_price != null ? Number(row.min_price) : null,
      imageUrl:    row.image_url ? String(row.image_url) : null,
    };
  });

  return { items, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) };
}

/* ─── Cached exports ────────────────────────────────────── */

export const getDevicesByCategory = unstable_cache(
  _getDevicesByCategory,
  ["devices-by-category"],
  { revalidate: 300, tags: ["repair-services"] }
);

export const getDeviceBySlug = unstable_cache(
  _getDeviceBySlug,
  ["device-by-slug"],
  { revalidate: 300, tags: ["repair-services"] }
);

export const getBrandsWithCounts = unstable_cache(
  _getBrandsWithCounts,
  ["brands-with-counts"],
  { revalidate: 300, tags: ["repair-services"] }
);

export const getDevicesByBrand = unstable_cache(
  _getDevicesByBrand,
  ["devices-by-brand"],
  { revalidate: 300, tags: ["repair-services"] }
);

export const getMerchantsForDevice = unstable_cache(
  _getMerchantsForDevice,
  ["merchants-for-device"],
  { revalidate: 120, tags: ["repair-services", "merchants"] }
);
