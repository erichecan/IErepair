#!/usr/bin/env node
/**
 * 数据导入脚本 — 把 scrape.js 输出的 JSON 写入 Prisma 数据库
 *
 * 前提：
 *   1. 已运行 node scripts/scrape.js 并检查过 scripts/scraped/products.json
 *   2. server/.env 中配置了 DATABASE_URL
 *   3. 在 server/ 目录下执行过 npx prisma migrate dev
 *
 * 用法（在项目根目录）：
 *   node --env-file=server/.env scripts/import.js
 *
 * 或：
 *   cd server && npx dotenv -e .env -- node ../scripts/import.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = path.join(__dirname, 'scraped');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const productsFile = path.join(SCRAPED_DIR, 'products.json');
  if (!fs.existsSync(productsFile)) {
    console.error('找不到 scripts/scraped/products.json，请先运行 node scripts/scrape.js');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  console.log(`\n读取到 ${products.length} 条产品数据`);

  // ── 1. 构建去重集合 ──────────────────────────────────────────────
  const brandsSet = new Set(products.map((p) => p.brandName));
  const categoriesSet = new Set(products.map((p) => p.repairType));

  // deviceName → brandName 映射
  const deviceBrandMap = {};
  const deviceImageMap = {};
  for (const p of products) {
    deviceBrandMap[p.deviceName] = p.brandName;
    if (p.deviceImageUrl) deviceImageMap[p.deviceName] = p.deviceImageUrl;
  }
  const devicesSet = new Set(Object.keys(deviceBrandMap));

  console.log(`  品牌：${brandsSet.size} 个`);
  console.log(`  设备：${devicesSet.size} 个`);
  console.log(`  维修类型：${categoriesSet.size} 个`);

  // ── 2. 写入 MasterBrand ──────────────────────────────────────────
  console.log('\n[1/4] 写入品牌...');
  const brandMap = {}; // name → id
  for (const name of brandsSet) {
    const brand = await prisma.masterBrand.upsert({
      where: { id: `brand-${toSlug(name)}` },
      create: { id: `brand-${toSlug(name)}`, name, sortOrder: 0 },
      update: { name },
    });
    brandMap[name] = brand.id;
    process.stdout.write('.');
  }
  console.log(` ${brandsSet.size} 个品牌完成`);

  // ── 3. 写入 MasterDevice ─────────────────────────────────────────
  console.log('\n[2/4] 写入设备型号...');
  const deviceMap = {}; // deviceName → id
  let deviceCount = 0;
  for (const deviceName of devicesSet) {
    const brandId = brandMap[deviceBrandMap[deviceName]];
    if (!brandId) continue;
    const deviceId = `device-${toSlug(deviceName)}`;
    const device = await prisma.masterDevice.upsert({
      where: { id: deviceId },
      create: {
        id: deviceId,
        brandId,
        name: deviceName,
        imageUrl: deviceImageMap[deviceName] || null,
        sortOrder: 0,
      },
      update: {
        imageUrl: deviceImageMap[deviceName] || undefined,
      },
    });
    deviceMap[deviceName] = device.id;
    deviceCount++;
    if (deviceCount % 10 === 0) process.stdout.write('.');
  }
  console.log(` ${deviceCount} 个设备完成`);

  // ── 4. 写入 MasterCategory ───────────────────────────────────────
  console.log('\n[3/4] 写入维修类型...');
  const categoryMap = {}; // repairType → id
  for (const name of categoriesSet) {
    const catId = `cat-${toSlug(name)}`;
    const cat = await prisma.masterCategory.upsert({
      where: { id: catId },
      create: { id: catId, name, sortOrder: 0 },
      update: { name },
    });
    categoryMap[name] = cat.id;
    process.stdout.write('.');
  }
  console.log(` ${categoriesSet.size} 个维修类型完成`);

  // ── 5. 写入 MasterProduct ────────────────────────────────────────
  console.log('\n[4/4] 写入产品（维修项）...');
  let created = 0, skipped = 0, failed = 0;

  for (const p of products) {
    const deviceId = deviceMap[p.deviceName];
    const categoryId = categoryMap[p.repairType];
    if (!deviceId || !categoryId) { skipped++; continue; }

    // SKU 去重
    const sku = ensureUniqueSku(p.sku, created);

    try {
      await prisma.masterProduct.upsert({
        where: { sku },
        create: {
          deviceId,
          categoryId,
          sku,
          name: `${p.deviceName} — ${p.repairType}`,
          description: p.description ? stripHtml(p.description) : null,
          baseCost: p.price * 0.65, // 估算成本 = 65% 定价
          suggestedPrice: p.price,
          imageUrl: p.deviceImageUrl || null,
          estimatedTime: p.estimatedTime,
          warrantyDays: p.warrantyDays,
          isActive: p.isActive,
        },
        update: {
          suggestedPrice: p.price,
          baseCost: p.price * 0.65,
          estimatedTime: p.estimatedTime,
        },
      });
      created++;
      if (created % 20 === 0) process.stdout.write('.');
    } catch (err) {
      console.warn(`\n  [warn] 写入失败 ${sku}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n\n导入完成！`);
  console.log(`  成功：${created}`);
  console.log(`  跳过：${skipped}`);
  console.log(`  失败：${failed}`);

  await prisma.$disconnect();
}

// 简单去 HTML 标签
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);
}

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const usedSkus = new Set();
function ensureUniqueSku(sku, idx) {
  let candidate = sku;
  let i = 2;
  while (usedSkus.has(candidate)) {
    candidate = `${sku.slice(0, 27)}-${i}`;
    i++;
  }
  usedSkus.add(candidate);
  return candidate;
}

main().catch((err) => {
  console.error('\n[error]', err);
  prisma.$disconnect();
  process.exit(1);
});
