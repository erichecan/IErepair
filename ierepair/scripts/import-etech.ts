/**
 * 从 e-tech.ie 爬取数据导入 IERepair 数据库
 * 导入内容：维修服务类型 + 158 款设备的维修服务（含图片 URL）
 *
 * 用法（在 ierepair/ 目录下）：
 *   npx tsx scripts/import-etech.ts
 *
 * 前提：
 *   - .env.local 中有 DATABASE_URL
 *   - scripts/scraped/ 下有 products.json 和 models.json
 */

import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

// 加载 .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = path.resolve(__dirname, "../../scripts/scraped");

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface ModelRecord {
  modelId: string;
  title: string;
  cover: string;
  brandName: string;
  categoryName: string;
}

interface ProductRecord {
  modelId: string;
  deviceName: string;
  brandName: string;
  repairType: string;
  price: number;
  sku: string;
  estimatedTime: number;
  warrantyDays: number;
  isActive: boolean;
  description: string;
}

async function main() {
  console.log("🔌 连接数据库...");

  const models: ModelRecord[] = JSON.parse(
    fs.readFileSync(path.join(SCRAPED_DIR, "models.json"), "utf8")
  );
  const products: ProductRecord[] = JSON.parse(
    fs.readFileSync(path.join(SCRAPED_DIR, "products.json"), "utf8")
  );

  console.log(`📦 读取 ${models.length} 款设备，${products.length} 条维修记录`);

  // 建立 modelId → cover 图片路径的映射
  // cover 格式: "images/model/20260203-xxx.jpg"
  // 转换为本地 URL: "/images/devices/20260203-xxx.jpg"
  const modelCoverMap: Record<string, string> = {};
  for (const m of models) {
    if (m.cover) {
      const filename = path.basename(m.cover);
      modelCoverMap[m.modelId] = `/images/devices/${filename}`;
    }
  }

  // ── 1. 写入维修类型分类 ──────────────────────────────────────────
  console.log("\n[1/3] 写入维修类型分类...");
  const repairTypes = [...new Set(products.map((p) => p.repairType))].filter(Boolean);

  const categoryMap: Record<string, string> = {};
  for (const repairType of repairTypes) {
    const slug = slugify(repairType);
    const existing = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    let catId: string;
    if (existing.length > 0) {
      catId = existing[0].id;
    } else {
      const [cat] = await db
        .insert(schema.categories)
        .values({ name: repairType, slug, sortOrder: 0 })
        .returning({ id: schema.categories.id });
      catId = cat.id;
    }
    categoryMap[repairType] = catId;
    process.stdout.write(".");
  }
  console.log(` ${repairTypes.length} 个维修类型`);

  // ── 2. 写入维修服务（repair_services）──────────────────────────
  console.log("\n[2/3] 写入维修服务...");
  let created = 0, updated = 0, failed = 0;

  // 按 sku 去重，构建服务数据
  const seenSku = new Set<string>();

  for (const p of products) {
    if (!p.isActive) continue;
    if (seenSku.has(p.sku)) continue;
    seenSku.add(p.sku);

    const categoryId = categoryMap[p.repairType];
    if (!categoryId) { failed++; continue; }

    const imageUrl = modelCoverMap[p.modelId] || null;
    const name = `${p.deviceName} - ${p.repairType}`;
    const slug = slugify(`${p.deviceName}-${p.repairType}-${p.sku.slice(-4)}`);

    try {
      const existing = await db
        .select({ id: schema.repairServices.id })
        .from(schema.repairServices)
        .where(eq(schema.repairServices.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        // 更新图片 URL
        await db
          .update(schema.repairServices)
          .set({ imageUrl, updatedAt: new Date() })
          .where(eq(schema.repairServices.id, existing[0].id));
        updated++;
      } else {
        await db.insert(schema.repairServices).values({
          name,
          slug,
          deviceModel: p.deviceName,
          deviceBrand: p.brandName,
          categoryId,
          imageUrl,
          estimatedMin: p.estimatedTime || 60,
          isActive: true,
        });
        created++;
      }
    } catch (err) {
      console.error(`\n  失败 [${p.sku}]: ${err}`);
      failed++;
    }

    if ((created + updated) % 20 === 0) process.stdout.write(".");
  }
  console.log(`\n  新建: ${created}  更新: ${updated}  失败: ${failed}`);

  // ── 3. 汇总 ────────────────────────────────────────────────────
  const totalServices = await db
    .select()
    .from(schema.repairServices);
  const totalCats = await db.select().from(schema.categories);

  console.log(`\n✅ 导入完成！`);
  console.log(`  维修类型: ${totalCats.length} 个`);
  console.log(`  维修服务: ${totalServices.length} 条`);
  console.log(`  图片 URL 已关联 ${Object.keys(modelCoverMap).length} 款设备`);

  await client.end();
}

main().catch((err) => {
  console.error("导入失败:", err);
  process.exit(1);
});
