import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import postgres from "postgres";

config({ path: path.resolve(process.cwd(), ".env.local") });
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  const rows = await sql<Array<{ device_model: string; device_brand: string; category_slug: string; name: string; base_price: string | null }>>`
    SELECT rs.device_model, rs.device_brand, c.slug as category_slug, rs.name, rs.base_price
    FROM repair_services rs
    LEFT JOIN categories c ON rs.category_id = c.id
    WHERE rs.is_active = true
    ORDER BY rs.device_brand, rs.device_model, c.slug
    LIMIT 80
  `;
  for (const r of rows) {
    console.log(`[${r.device_brand}] ${r.device_model} | ${r.category_slug} | price: ${r.base_price ?? "none"}`);
  }
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
