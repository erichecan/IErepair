import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

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

/** Returns distinct devices that have at least one service in the given category group */
export async function getDevicesByCategory(category: string): Promise<DeviceListItem[]> {
  const fragments = CATEGORY_GROUPS[category];
  if (!fragments) return [];

  // Build LIKE conditions for category slug matching
  const likeConditions = fragments.map((f) => `c.slug ILIKE '%${f}%'`).join(" OR ");

  const rows = await db.execute(sql.raw(`
    SELECT DISTINCT
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
  `));

  return (rows as unknown[]).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      deviceBrand: String(row.device_brand ?? ""),
      deviceModel: String(row.device_model ?? ""),
      deviceSlug:  String(row.device_slug ?? ""),
      minPrice:    row.min_price != null ? Number(row.min_price) : null,
      imageUrl:    row.image_url ? String(row.image_url) : null,
    };
  });
}

/** Returns all services for a device, grouped by service category */
export async function getDeviceBySlug(slug: string): Promise<DeviceDetail | null> {
  const rows = await db.execute(sql.raw(`
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
      AND rs.device_slug = '${slug.replace(/'/g, "''")}'
    ORDER BY c.name, rs.name
  `));

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

/** Returns all brands with device counts, optionally filtered by deviceType */
export async function getBrandsWithCounts(deviceType?: string): Promise<BrandWithCount[]> {
  const typeFilter = deviceType ? `AND rs.device_type = '${deviceType.replace(/'/g, "''")}'` : "";

  const rows = await db.execute(sql.raw(`
    SELECT
      rs.device_brand,
      rs.device_type,
      COUNT(DISTINCT rs.device_slug) as cnt,
      MAX(rs.image_url) as image_url
    FROM repair_services rs
    WHERE rs.is_active = true
      AND rs.device_brand IS NOT NULL
      AND rs.device_type IS NOT NULL
      ${typeFilter}
    GROUP BY rs.device_brand, rs.device_type
    ORDER BY cnt DESC
  `));

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

/** Returns all devices for a brand, optionally filtered by deviceType */
export async function getDevicesByBrand(
  brand: string,
  deviceType?: string
): Promise<DeviceBrowseItem[]> {
  const typeFilter = deviceType ? `AND rs.device_type = '${deviceType.replace(/'/g, "''")}'` : "";

  const rows = await db.execute(sql.raw(`
    SELECT DISTINCT
      rs.device_brand,
      rs.device_model,
      rs.device_slug,
      rs.device_type,
      MIN(rs.base_price::numeric) as min_price,
      MAX(rs.image_url) as image_url
    FROM repair_services rs
    WHERE rs.is_active = true
      AND rs.device_brand = '${brand.replace(/'/g, "''")}'
      AND rs.device_slug IS NOT NULL
      ${typeFilter}
    GROUP BY rs.device_brand, rs.device_model, rs.device_slug, rs.device_type
    ORDER BY rs.device_model
  `));

  return (rows as unknown[]).map((r: unknown) => {
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
}
