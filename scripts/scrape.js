#!/usr/bin/env node
/**
 * e-tech.ie 数据爬取脚本
 *
 * 用法：node scripts/scrape.js
 *
 * 输出：
 *   scripts/scraped/categories.json      — 分类树
 *   scripts/scraped/models.json          — 所有型号摘要
 *   scripts/scraped/model-details/*.json — 每个型号的完整维修选项
 *   scripts/scraped/products.json        — 整合后的产品数据（供 import.js 使用）
 *   ierepair/public/images/devices/      — 型号封面图
 *   ierepair/public/images/brands/       — 品牌图标
 *   ierepair/public/images/categories/   — 分类图标
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCRAPED_DIR = path.join(__dirname, 'scraped');
const MODEL_DETAILS_DIR = path.join(SCRAPED_DIR, 'model-details');
const IMG_BASE = 'https://e-tech.ie/';
const API_BASE = 'https://e-tech.ie/api';

// 图片保存目录（相对于 ierepair/ 子项目）
const IMG_DIRS = {
  devices:    path.join(ROOT, 'ierepair', 'public', 'images', 'devices'),
  brands:     path.join(ROOT, 'ierepair', 'public', 'images', 'brands'),
  categories: path.join(ROOT, 'ierepair', 'public', 'images', 'categories'),
};

// 延迟函数，避免请求过快
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 带重试的 fetch
async function fetchJSON(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://www.e-tech.ie',
          'Referer': 'https://www.e-tech.ie/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.code !== 200) throw new Error(`API code ${json.code}`);
      return json.data;
    } catch (err) {
      console.warn(`  [warn] ${url} 第 ${i + 1} 次失败: ${err.message}`);
      if (i < retries - 1) await sleep(1500);
    }
  }
  return null;
}

// 下载图片，返回本地相对路径（供 JSON 记录）
async function downloadImage(relPath, destDir, filename) {
  if (!relPath) return null;
  const url = IMG_BASE + relPath;
  const ext = path.extname(relPath) || '.jpg';
  const localFile = path.join(destDir, filename + ext);

  // 已存在则跳过
  if (fs.existsSync(localFile)) {
    return `/images/${path.basename(destDir)}/${filename}${ext}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localFile, buf);
    return `/images/${path.basename(destDir)}/${filename}${ext}`;
  } catch (err) {
    console.warn(`  [warn] 图片下载失败 ${url}: ${err.message}`);
    return null;
  }
}

// 把字符串转为文件名安全的 slug
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---- 主分类映射 ----
// 只抓取含型号的叶子分类（不抓 Accessories、Gaming 等）
// 根据侦查结果，device 分类的 parentId 层级如下：
//   Phone(1017) → 品牌(如 Samsung=2) → 系列(如 Galaxy A=193)
//   Apple(1) → 设备类型(如 iPhone=173, iPad=178, MacBook=181)
//
// 策略：parentId 不为 0 且 picture 指向 images/category/ 的，都可能有型号。
// 实际上我们拉一下就知道有没有。

async function main() {
  // 初始化目录
  Object.values(IMG_DIRS).forEach(ensureDir);
  ensureDir(MODEL_DETAILS_DIR);

  // ── Step 1: 获取所有分类 ──────────────────────────────────────────
  console.log('\n[1/4] 获取分类列表...');
  const allCategories = await fetchJSON(`${API_BASE}/category/list`);
  if (!allCategories) { console.error('分类获取失败，退出'); process.exit(1); }

  fs.writeFileSync(
    path.join(SCRAPED_DIR, 'categories.json'),
    JSON.stringify(allCategories, null, 2),
  );
  console.log(`  → 共 ${allCategories.length} 个分类`);

  // 下载分类图标
  console.log('  → 下载分类图标...');
  for (const cat of allCategories) {
    if (!cat.picture) continue;
    const slug = toSlug(cat.name);
    await downloadImage(cat.picture, IMG_DIRS.categories, `cat-${cat.id}-${slug}`);
    await sleep(100);
  }

  // ── Step 2: 确定需要爬的分类（叶子分类，即含型号的） ──────────────
  // 从 category list 分析层级树，找到叶子节点（没有子节点的）
  const idSet = new Set(allCategories.map((c) => c.id));
  const parentIds = new Set(allCategories.map((c) => c.parentId));
  // 叶子 = 自己不是任何节点的 parentId，且 parentId 不为 0（排除顶级）
  const leafCategories = allCategories.filter(
    (c) => !parentIds.has(c.id) && c.parentId !== 0,
  );

  console.log(`\n[2/4] 遍历 ${leafCategories.length} 个叶子分类，获取型号列表...`);

  // 构建品牌映射（parentId → brand name）
  const catMap = Object.fromEntries(allCategories.map((c) => [c.id, c]));

  // ── Step 3: 获取每个分类下的型号 ─────────────────────────────────
  const allModels = []; // { modelId, title, cover, categoryId, categoryName, brandName }

  for (const cat of leafCategories) {
    process.stdout.write(`  [${leafCategories.indexOf(cat) + 1}/${leafCategories.length}] ${cat.name} (id=${cat.id}) ...`);
    const models = await fetchJSON(`${API_BASE}/model/category/${cat.id}`);
    if (!models || models.length === 0) {
      console.log(' 无型号，跳过');
      continue;
    }

    // 解析品牌名（往上找 parentId 直到根）
    let brandName = cat.name;
    let cursor = cat;
    const ancestors = [];
    while (cursor && cursor.parentId !== 0) {
      cursor = catMap[cursor.parentId];
      if (cursor) ancestors.unshift(cursor.name);
    }
    // ancestors[0] 是最顶层品牌（如 Apple / Samsung / Phone）
    // 对于 iPhone 系列：Apple → iPhone，品牌 = Apple
    // 对于 Galaxy A：Samsung → Galaxy A，品牌 = Samsung
    if (ancestors.length > 0) brandName = ancestors[0] === 'Phone' ? ancestors[1] || cat.name : ancestors[0];

    for (const m of models) {
      allModels.push({
        modelId: m.id,
        title: m.title,
        cover: m.cover,
        categoryId: cat.id,
        categoryName: cat.name,
        brandName,
      });
    }
    console.log(` ${models.length} 个型号`);
    await sleep(300);
  }

  fs.writeFileSync(
    path.join(SCRAPED_DIR, 'models.json'),
    JSON.stringify(allModels, null, 2),
  );
  console.log(`\n  → 合计 ${allModels.length} 个型号`);

  // ── Step 4: 获取每个型号的详情（维修选项 + 价格）─────────────────
  console.log(`\n[3/4] 获取 ${allModels.length} 个型号详情（含维修价格）...`);

  const products = []; // 最终整合数据

  for (let i = 0; i < allModels.length; i++) {
    const m = allModels[i];
    const detailFile = path.join(MODEL_DETAILS_DIR, `${m.modelId}.json`);

    let detail;
    // 已爬过则读缓存
    if (fs.existsSync(detailFile)) {
      detail = JSON.parse(fs.readFileSync(detailFile, 'utf8'));
    } else {
      process.stdout.write(`  [${i + 1}/${allModels.length}] ${m.title} ...`);
      detail = await fetchJSON(`${API_BASE}/model/${m.modelId}`);
      if (!detail) { console.log(' 失败'); continue; }
      fs.writeFileSync(detailFile, JSON.stringify(detail, null, 2));
      console.log(` ${detail.options?.length || 0} 个维修项`);
      await sleep(200);
    }

    // 下载型号封面图
    const deviceSlug = toSlug(m.title.replace(/\s*repair\s*/i, '').trim());
    const localCover = await downloadImage(m.cover, IMG_DIRS.devices, deviceSlug);

    // 整合成产品记录（每个 option 对应一个 MasterProduct）
    if (detail.options && detail.options.length > 0) {
      for (const opt of detail.options) {
        products.push({
          // 型号信息
          modelId: m.modelId,
          deviceName: m.title.replace(/\s*repair\s*/i, '').trim(),
          deviceImageUrl: localCover,
          brandName: m.brandName,
          categoryName: m.categoryName,

          // 维修项信息
          repairType: opt.name.trim(),
          price: parseFloat(opt.price) || 0,

          // 自动生成 SKU：品牌缩写-设备slug-维修类型缩写
          sku: generateSku(m.brandName, deviceSlug, opt.name),

          // 其他字段默认值
          estimatedTime: guessTime(opt.name),
          warrantyDays: 90, // e-tech.ie 写的 3 months warranty
          isActive: true,
          description: detail.description || null,
        });
      }
    }

    await sleep(50);
  }

  fs.writeFileSync(
    path.join(SCRAPED_DIR, 'products.json'),
    JSON.stringify(products, null, 2),
  );

  console.log(`\n[4/4] 完成！`);
  console.log(`  型号数：${allModels.length}`);
  console.log(`  产品数（维修项）：${products.length}`);
  console.log(`  输出目录：${SCRAPED_DIR}`);
}

// 根据品牌/设备/维修类型生成 SKU
function generateSku(brand, deviceSlug, repairType) {
  const brandCode = brand.toUpperCase().slice(0, 3);
  const deviceCode = deviceSlug.toUpperCase().replace(/-/g, '').slice(0, 8);
  const typeMap = {
    'screen': 'SCR', 'battery': 'BAT', 'charging': 'CHG', 'port': 'CHG',
    'camera': 'CAM', 'back': 'BGL', 'glass': 'BGL', 'speaker': 'SPK',
    'microphone': 'MIC', 'button': 'BTN', 'water': 'WTR', 'software': 'SFT',
    'keyboard': 'KBD', 'trackpad': 'TKP', 'ram': 'RAM', 'ssd': 'SSD',
    'hd': 'HDD', 'lcd': 'LCD', 'oled': 'LCD',
  };
  const lower = repairType.toLowerCase();
  let typeCode = 'SVC';
  for (const [kw, code] of Object.entries(typeMap)) {
    if (lower.includes(kw)) { typeCode = code; break; }
  }
  return `${brandCode}-${deviceCode}-${typeCode}`.slice(0, 30);
}

// 根据维修类型估算时间（分钟）
function guessTime(repairType) {
  const lower = repairType.toLowerCase();
  if (lower.includes('screen') || lower.includes('lcd') || lower.includes('oled')) return 60;
  if (lower.includes('battery')) return 30;
  if (lower.includes('charging') || lower.includes('port')) return 45;
  if (lower.includes('camera')) return 45;
  if (lower.includes('back glass')) return 60;
  if (lower.includes('water')) return 90;
  if (lower.includes('software')) return 30;
  if (lower.includes('keyboard')) return 90;
  return 45;
}

main().catch((err) => {
  console.error('\n[error]', err);
  process.exit(1);
});
