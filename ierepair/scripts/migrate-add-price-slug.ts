import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import postgres from "postgres";

config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

async function main() {
  await sql`ALTER TABLE repair_services ADD COLUMN IF NOT EXISTS base_price numeric(10,2)`;
  await sql`ALTER TABLE repair_services ADD COLUMN IF NOT EXISTS device_slug varchar(300)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_services_device_slug ON repair_services (device_slug)`;
  console.log("Migration done: added base_price, device_slug to repair_services");
  await sql.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
