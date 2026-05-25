/**
 * Seed base prices and device_slug into repair_services.
 * Run: npx tsx scripts/seed-prices.ts
 */
import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import postgres from "postgres";

config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Exact model + category-slug combinations with prices (based on actual DB data)
const PRICE_MAP: Array<{ modelContains: string; categoryContains: string; price: number }> = [
  // iPhone - Screen
  { modelContains: "iphone 17 pro max",  categoryContains: "screen",   price: 195 },
  { modelContains: "iphone 17 pro",      categoryContains: "screen",   price: 185 },
  { modelContains: "iphone 17",          categoryContains: "screen",   price: 120 },
  { modelContains: "iphone 16 pro max",  categoryContains: "screen",   price: 165 },
  { modelContains: "iphone 16 plus",     categoryContains: "screen",   price: 120 },
  { modelContains: "iphone 16 pro",      categoryContains: "screen",   price: 145 },
  { modelContains: "iphone 16e",         categoryContains: "screen",   price: 80  },
  { modelContains: "iphone 16",          categoryContains: "screen",   price: 105 },
  { modelContains: "iphone 15 pro max",  categoryContains: "screen",   price: 135 },
  { modelContains: "iphone 15 pro",      categoryContains: "screen",   price: 120 },
  { modelContains: "iphone 15 plus",     categoryContains: "screen",   price: 105 },
  { modelContains: "iphone 15",          categoryContains: "screen",   price: 90  },
  { modelContains: "iphone 14 pro max",  categoryContains: "screen",   price: 120 },
  { modelContains: "iphone 14 pro",      categoryContains: "screen",   price: 110 },
  { modelContains: "iphone 14",          categoryContains: "screen",   price: 80  },
  { modelContains: "iphone 13 pro max",  categoryContains: "screen",   price: 110 },
  { modelContains: "iphone 13 pro",      categoryContains: "screen",   price: 95  },
  { modelContains: "iphone 13",          categoryContains: "screen",   price: 80  },
  { modelContains: "iphone 12 pro",      categoryContains: "screen",   price: 80  },
  { modelContains: "iphone 12",          categoryContains: "screen",   price: 70  },
  { modelContains: "iphone 11 pro",      categoryContains: "screen",   price: 70  },
  { modelContains: "iphone 11",          categoryContains: "screen",   price: 60  },
  { modelContains: "iphonese 3",         categoryContains: "screen",   price: 55  },
  { modelContains: "iphone x",           categoryContains: "screen",   price: 60  },
  { modelContains: "iphone 8 plus",      categoryContains: "screen",   price: 50  },
  { modelContains: "iphone 8",           categoryContains: "screen",   price: 45  },

  // iPhone - Battery
  { modelContains: "iphone 17 pro max",  categoryContains: "battery",  price: 120 },
  { modelContains: "iphone 17 pro",      categoryContains: "battery",  price: 110 },
  { modelContains: "iphone 17",          categoryContains: "battery",  price: 100 },
  { modelContains: "iphone 16 pro max",  categoryContains: "battery",  price: 95  },
  { modelContains: "iphone 16 plus",     categoryContains: "battery",  price: 80  },
  { modelContains: "iphone 16 pro",      categoryContains: "battery",  price: 90  },
  { modelContains: "iphone 16",          categoryContains: "battery",  price: 80  },
  { modelContains: "iphone 15 pro max",  categoryContains: "battery",  price: 80  },
  { modelContains: "iphone 15 pro",      categoryContains: "battery",  price: 80  },
  { modelContains: "iphone 15 plus",     categoryContains: "battery",  price: 70  },
  { modelContains: "iphone 15",          categoryContains: "battery",  price: 70  },
  { modelContains: "iphone 14 pro max",  categoryContains: "battery",  price: 75  },
  { modelContains: "iphone 14 pro",      categoryContains: "battery",  price: 70  },
  { modelContains: "iphone 14",          categoryContains: "battery",  price: 65  },
  { modelContains: "iphone 13 pro",      categoryContains: "battery",  price: 65  },
  { modelContains: "iphone 13",          categoryContains: "battery",  price: 60  },
  { modelContains: "iphone 12 pro",      categoryContains: "battery",  price: 60  },
  { modelContains: "iphone 12",          categoryContains: "battery",  price: 55  },
  { modelContains: "iphone 11 pro",      categoryContains: "battery",  price: 55  },
  { modelContains: "iphone 11",          categoryContains: "battery",  price: 50  },
  { modelContains: "iphonese 3",         categoryContains: "battery",  price: 45  },
  { modelContains: "iphone x",           categoryContains: "battery",  price: 45  },
  { modelContains: "iphone 8 plus",      categoryContains: "battery",  price: 40  },
  { modelContains: "iphone 8",           categoryContains: "battery",  price: 40  },

  // iPhone - Back Glass
  { modelContains: "iphone 17 pro max",  categoryContains: "back",     price: 149 },
  { modelContains: "iphone 16 plus",     categoryContains: "back",     price: 129 },
  { modelContains: "iphone 16 pro",      categoryContains: "back",     price: 139 },
  { modelContains: "iphone 15 pro max",  categoryContains: "back",     price: 149 },
  { modelContains: "iphone 15 pro",      categoryContains: "back",     price: 129 },
  { modelContains: "iphone 15",          categoryContains: "back",     price: 119 },
  { modelContains: "iphone 14 pro max",  categoryContains: "back",     price: 139 },
  { modelContains: "iphone 14 pro",      categoryContains: "back",     price: 129 },
  { modelContains: "iphone 14",          categoryContains: "back",     price: 99  },
  { modelContains: "iphone 13 pro",      categoryContains: "back",     price: 119 },
  { modelContains: "iphone 13",          categoryContains: "back",     price: 89  },
  { modelContains: "iphone 12 pro",      categoryContains: "back",     price: 99  },
  { modelContains: "iphone 11 pro",      categoryContains: "back",     price: 89  },
  { modelContains: "iphone x",           categoryContains: "back",     price: 79  },

  // iPhone - Charging Port
  { modelContains: "iphone 17 pro max",  categoryContains: "charging", price: 80  },
  { modelContains: "iphone 16 plus",     categoryContains: "charging", price: 70  },
  { modelContains: "iphone 16 pro",      categoryContains: "charging", price: 75  },
  { modelContains: "iphone 15 pro max",  categoryContains: "charging", price: 70  },
  { modelContains: "iphone 15 pro",      categoryContains: "charging", price: 65  },
  { modelContains: "iphone 15",          categoryContains: "charging", price: 60  },
  { modelContains: "iphone 14 pro max",  categoryContains: "charging", price: 65  },
  { modelContains: "iphone 14 pro",      categoryContains: "charging", price: 60  },
  { modelContains: "iphone 14",          categoryContains: "charging", price: 55  },
  { modelContains: "iphone 13 pro",      categoryContains: "charging", price: 55  },
  { modelContains: "iphone 13",          categoryContains: "charging", price: 50  },
  { modelContains: "iphone 12 pro",      categoryContains: "charging", price: 50  },
  { modelContains: "iphone 11 pro",      categoryContains: "charging", price: 45  },
  { modelContains: "iphone x",           categoryContains: "charging", price: 45  },
  { modelContains: "iphone 8",           categoryContains: "charging", price: 40  },

  // Samsung A Series - Screen
  { modelContains: "galaxy a56",  categoryContains: "screen", price: 140 },
  { modelContains: "galaxy a55",  categoryContains: "screen", price: 130 },
  { modelContains: "galaxy a54",  categoryContains: "screen", price: 130 },
  { modelContains: "galaxy a53",  categoryContains: "screen", price: 130 },
  { modelContains: "galaxy a52",  categoryContains: "screen", price: 120 },
  { modelContains: "galaxy a51",  categoryContains: "screen", price: 95  },
  { modelContains: "galaxy a35",  categoryContains: "screen", price: 120 },
  { modelContains: "galaxy a25",  categoryContains: "screen", price: 110 },

  // Samsung S Series - Screen
  { modelContains: "s25 ultra",   categoryContains: "screen", price: 280 },
  { modelContains: "s25+",        categoryContains: "screen", price: 250 },
  { modelContains: "s25 plus",    categoryContains: "screen", price: 250 },
  { modelContains: "s25",         categoryContains: "screen", price: 230 },
  { modelContains: "s24 ultra",   categoryContains: "screen", price: 260 },
  { modelContains: "s24+",        categoryContains: "screen", price: 230 },
  { modelContains: "s24 plus",    categoryContains: "screen", price: 230 },
  { modelContains: "s24",         categoryContains: "screen", price: 210 },
  { modelContains: "s23 ultra",   categoryContains: "screen", price: 250 },
  { modelContains: "s23",         categoryContains: "screen", price: 200 },
  { modelContains: "s22 ultra",   categoryContains: "screen", price: 220 },
  { modelContains: "s22",         categoryContains: "screen", price: 180 },

  // Google Pixel - Screen
  { modelContains: "pixel 9 pro", categoryContains: "screen", price: 180 },
  { modelContains: "pixel 9",     categoryContains: "screen", price: 160 },
  { modelContains: "pixel 8 pro", categoryContains: "screen", price: 170 },
  { modelContains: "pixel 8",     categoryContains: "screen", price: 150 },
  { modelContains: "pixel 7 pro", categoryContains: "screen", price: 150 },
  { modelContains: "pixel 7",     categoryContains: "screen", price: 140 },
  { modelContains: "pixel 6 pro", categoryContains: "screen", price: 140 },
  { modelContains: "pixel 6",     categoryContains: "screen", price: 130 },

  // OnePlus - Screen
  { modelContains: "oneplus 8",     categoryContains: "screen", price: 130 },
  { modelContains: "oneplus 7t",    categoryContains: "screen", price: 110 },
  { modelContains: "oneplus 7 pro", categoryContains: "screen", price: 160 },
  { modelContains: "oneplus 7",     categoryContains: "screen", price: 95  },
  { modelContains: "oneplus 6t",    categoryContains: "screen", price: 90  },
  { modelContains: "oneplus 6",     categoryContains: "screen", price: 90  },

  // MacBook
  { modelContains: "macbook air",   categoryContains: "screen",  price: 299 },
  { modelContains: "macbook air",   categoryContains: "battery", price: 199 },
  { modelContains: "macbook pro",   categoryContains: "screen",  price: 349 },
  { modelContains: "macbook pro",   categoryContains: "battery", price: 229 },

  // iPad
  { modelContains: "ipad pro",   categoryContains: "screen",  price: 299 },
  { modelContains: "ipad pro",   categoryContains: "battery", price: 149 },
  { modelContains: "ipad air",   categoryContains: "screen",  price: 199 },
  { modelContains: "ipad air",   categoryContains: "battery", price: 99  },
  { modelContains: "ipad mini",  categoryContains: "screen",  price: 169 },
  { modelContains: "ipad mini",  categoryContains: "battery", price: 89  },
  { modelContains: "ipad",       categoryContains: "screen",  price: 149 },
  { modelContains: "ipad",       categoryContains: "battery", price: 79  },

  // Gaming / Other
  { modelContains: "ps5",  categoryContains: "hdmi", price: 120 },
  { modelContains: "ps4",  categoryContains: "hdmi", price: 80  },
  { modelContains: "xbox", categoryContains: "hdmi", price: 90  },
];

async function main() {
  const services = await sql<Array<{
    id: string;
    device_model: string;
    device_brand: string;
    name: string;
    category_slug: string | null;
    base_price: string | null;
  }>>`
    SELECT rs.id, rs.device_model, rs.device_brand, rs.name,
           c.slug as category_slug, rs.base_price
    FROM repair_services rs
    LEFT JOIN categories c ON rs.category_id = c.id
    WHERE rs.is_active = true
  `;

  console.log(`Found ${services.length} repair services to process`);

  let priced = 0;
  let slugOnly = 0;

  for (const svc of services) {
    const deviceSlug = slugify(svc.device_model || "unknown");
    const modelLower = (svc.device_model || "").toLowerCase();
    const catSlugLower = (svc.category_slug || "").toLowerCase();

    // Find best price match: longest modelContains match wins to avoid partial match issues
    let bestMatch: { modelContains: string; categoryContains: string; price: number } | null = null;
    for (const p of PRICE_MAP) {
      if (modelLower.includes(p.modelContains) && catSlugLower.includes(p.categoryContains)) {
        if (!bestMatch || p.modelContains.length > bestMatch.modelContains.length) {
          bestMatch = p;
        }
      }
    }

    if (bestMatch) {
      await sql`
        UPDATE repair_services
        SET base_price = ${bestMatch.price}, device_slug = ${deviceSlug}
        WHERE id = ${svc.id}
      `;
      priced++;
    } else {
      await sql`
        UPDATE repair_services SET device_slug = ${deviceSlug} WHERE id = ${svc.id}
      `;
      slugOnly++;
    }
  }

  console.log(`\n✅ Done: ${priced} priced, ${slugOnly} slug-only`);

  // Show sample of results
  const sample = await sql<Array<{ device_model: string; category_slug: string; base_price: string | null }>>`
    SELECT rs.device_model, c.slug as category_slug, rs.base_price
    FROM repair_services rs
    LEFT JOIN categories c ON rs.category_id = c.id
    WHERE rs.base_price IS NOT NULL
    ORDER BY rs.device_brand, rs.device_model
    LIMIT 30
  `;
  console.log("\nSample priced services:");
  for (const r of sample) {
    console.log(`  ${r.device_model} | ${r.category_slug} | €${r.base_price}`);
  }

  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
