import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import postgres from "postgres";
config({ path: path.resolve(process.cwd(), ".env.local") });
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
async function main() {
  const cats = await sql`SELECT id, name, slug, parent_id FROM categories ORDER BY parent_id NULLS FIRST, slug`;
  for (const c of cats) console.log(`[${c.parent_id ? 'sub' : 'root'}] ${c.name} | ${c.slug} | id=${c.id}`);
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
