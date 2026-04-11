import "dotenv/config";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import postgres from "postgres";

config({ path: path.resolve(process.cwd(), ".env.local") });
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });

const JSON_PATH = path.resolve(
  process.cwd(),
  "..",
  "scripts",
  "scraped-sxx",
  "repair_items.json"
);
const IMG_DIR = path.resolve(process.cwd(), "public", "images", "sxx", "models");

// ─── Mappings ──────────────────────────────────────────────────────────────

const BRAND_MAP: Record<string, { name: string; type: "phone" | "tablet" }> = {
  "1":  { name: "Apple",         type: "phone"  },
  "52": { name: "Huawei",        type: "phone"  },
  "74": { name: "Xiaomi",        type: "phone"  },
  "63": { name: "Honor",         type: "phone"  },
  "5":  { name: "Samsung",       type: "phone"  },
  "10": { name: "OPPO",          type: "phone"  },
  "11": { name: "Vivo",          type: "phone"  },
  "18": { name: "OnePlus",       type: "phone"  },
  "6":  { name: "Meizu",         type: "phone"  },
  "65": { name: "Realme",        type: "phone"  },
  "78": { name: "Other",         type: "phone"  },
  "64": { name: "iPad",          type: "tablet" },
  "88": { name: "Huawei Tablet", type: "tablet" },
  "87": { name: "Xiaomi Tablet", type: "tablet" },
};

const FAULT_TO_CATEGORY: Record<string, string> = {
  "屏幕问题(更换总成 旧屏回收)": "screen-repair",
  "电池/充电问题":                "battery-repair",
  "后壳与边框":                   "back-shell-repair",
  "摄像头问题":                   "camera-repair",
  "按键问题":                     "button-repair",
  "内存扩容/升级":                "memory-upgrade",
  "软件故障/重装":                "software-repair",
  "安装服务":                     "installation-service",
  "面容与感应":                   "face-id-sensors-repair",
  "WiFi/手机信号问题":            "wifi-signal-repair",
  "声音问题":                     "speaker-audio-repair",
  "进水/无法开机/手机摔坏问题":   "power-on-repair",
  "进水与主板维修":               "power-on-repair",
  "打不着火":                     "power-on-repair",
  "其他问题":                     "other-repair",
  "Rokid故障":                    "other-repair",
};

const CATEGORIES: Array<{ slug: string; name: string; sort: number }> = [
  { slug: "screen-repair",          name: "Screen Repair",                  sort: 1  },
  { slug: "battery-repair",         name: "Battery Repair",                 sort: 2  },
  { slug: "back-shell-repair",      name: "Back Shell & Frame Repair",      sort: 3  },
  { slug: "camera-repair",          name: "Camera Repair",                  sort: 4  },
  { slug: "button-repair",          name: "Button Repair",                  sort: 5  },
  { slug: "memory-upgrade",         name: "Memory / Storage Upgrade",       sort: 6  },
  { slug: "software-repair",        name: "Software Repair",                sort: 7  },
  { slug: "installation-service",   name: "Installation Service",           sort: 8  },
  { slug: "face-id-sensors-repair", name: "Face ID & Sensors Repair",       sort: 9  },
  { slug: "wifi-signal-repair",     name: "WiFi & Signal Repair",           sort: 10 },
  { slug: "speaker-audio-repair",   name: "Speaker & Audio Repair",         sort: 11 },
  { slug: "power-on-repair",        name: "Power On / Water Damage Repair", sort: 12 },
  { slug: "other-repair",           name: "Other Repair",                   sort: 13 },
];

const ITEM_NAME_MAP: Record<string, string> = {
  "原装电池":                              "OEM Battery Replacement",
  "华为原装电池":                          "Huawei OEM Battery Replacement",
  "更换标准容量电池":                      "Standard Battery Replacement",
  "升级大容量电池":                        "High-Capacity Battery Upgrade",
  "更换充电接口":                          "Charging Port Replacement",
  "充电":                                  "Charging Repair",
  "外屏碎(显示正常，旧屏回收)":            "Outer Screen (Display OK, Trade-in)",
  "外屏碎(显示正常，旧屏回收)更优显示屏":  "Outer Screen - Premium Display (Trade-in)",
  "外屏碎(显示正常，旧屏回收，换LCD屏)":   "Outer Screen LCD (Trade-in)",
  "外屏碎(显示正常，旧屏回收，换OLED屏)":  "Outer Screen OLED (Trade-in)",
  "外屏碎（仅更换外屏玻璃盖板，需到店）":  "Outer Glass Panel Only (In-Store)",
  "外屏碎（显示正常，旧屏回收）特价屏":    "Outer Screen Budget Option (Trade-in)",
  "内屏显示异常":                          "Screen Display Repair",
  "内屏显示异常（换LCD屏）":               "Screen Display Repair - LCD",
  "内屏显示异常（换OLED 屏）":             "Screen Display Repair - OLED",
  "内屏显示异常（无指纹版）":              "Screen Display Repair (No Fingerprint)",
  "内屏显示异常（更优显示屏）":            "Screen Display Repair - Premium",
  "原装屏幕总成":                          "OEM Screen Assembly",
  "屏幕上门安装（屏幕自备）":              "Screen Installation (Part Provided)",
  "屏幕转接排线":                          "Screen Flex Cable",
  "更换后盖玻璃":                          "Back Glass Replacement",
  "更换后壳":                              "Back Housing Replacement",
  "后壳上门安装(后壳自备)":                "Back Shell Installation (Part Provided)",
  "更换后摄像头":                          "Rear Camera Replacement",
  "更换前摄像头":                          "Front Camera Replacement",
  "更换后摄像头镜片":                      "Rear Camera Lens Replacement",
  "摄像头支架":                            "Camera Bracket Repair",
  "排线（开机/音量/指纹）":                "Button Flex Cable (Power/Volume/Fingerprint)",
  "更换按键排线":                          "Button Flex Cable Replacement",
  "电源键":                                "Power Button Repair",
  "音量键":                                "Volume Button Repair",
  "音量排线":                              "Volume Flex Cable",
  "指纹":                                  "Fingerprint Sensor Repair",
  "指纹排线":                              "Fingerprint Flex Cable",
  "HOME键":                                "Home Button Repair",
  "静音键":                                "Mute Switch Repair",
  "卡槽":                                  "SIM Card Tray Repair",
  "升级为32G":                             "Storage Upgrade to 32GB",
  "升级为64G":                             "Storage Upgrade to 64GB",
  "升级为128G":                            "Storage Upgrade to 128GB",
  "升级为256G":                            "Storage Upgrade to 256GB",
  "升级为512G":                            "Storage Upgrade to 512GB",
  "升级为1TB":                             "Storage Upgrade to 1TB",
  "软件故障":                              "Software Issue Fix",
  "重装调试":                              "Software Reinstall & Setup",
  "刷机错误":                              "Firmware Flash Error Fix",
  "手机软件垃圾清理":                      "Software Cleanup & Optimisation",
  "安装服务(自备物料)":                    "Installation Service (Parts Provided)",
  "安装服务（自备物料）":                  "Installation Service (Parts Provided)",
  "上门贴膜(高清钢化膜)":                  "Screen Protector Installation - HD",
  "上门贴膜(防窥膜)":                      "Screen Protector Installation - Privacy",
  "到店贴膜(高清钢化膜)":                  "In-Store Screen Protector - HD",
  "到店贴膜(防窥膜)":                      "In-Store Screen Protector - Privacy",
  "面容修复":                              "Face ID Repair",
  "手机无信号(主板)":                      "No Signal Repair (Motherboard)",
  "无WIFI(主板)":                          "No WiFi Repair (Motherboard)",
  "无法开机(主板)":                        "Won't Power On (Motherboard)",
  "主板维修":                              "Motherboard Repair",
  "主板故障":                              "Motherboard Fault Diagnosis",
  "喇叭":                                  "Speaker Repair",
  "更换听筒":                              "Earpiece Replacement",
  "更换听筒网":                            "Earpiece Mesh Replacement",
  "更换扬声器":                            "Loudspeaker Replacement",
  "耳机插口":                              "Headphone Jack Repair",
  "送话器":                                "Microphone Repair",
  "振动器":                                "Vibration Motor Repair",
  "闪光灯":                                "Flash Repair",
  "待确认":                                "To Be Confirmed",
};

// ─── Helpers ───────────────────────────────────────────────────────────────

// Matches the Python scraper's slugify() so image filenames line up.
// Python used \w which, with re.UNICODE, keeps Chinese characters.
// JS regex \w is ASCII-only; we emulate by stripping only disallowed punctuation.
function slugify(text: string): string {
  const lower = text.toLowerCase();
  // Remove anything that's NOT a letter/digit/underscore/whitespace/hyphen.
  // Keep unicode letters (matches Python \w under re.UNICODE).
  const stripped = lower.replace(/[^\p{L}\p{N}\s_-]+/gu, "");
  const hyphenated = stripped.replace(/[\s_-]+/g, "-");
  return hyphenated.replace(/^-+|-+$/g, "").slice(0, 60);
}

function convertPrice(cny: number | null | undefined): string | null {
  if (!cny || cny <= 0) return null;
  const eur = Math.round((cny / 0.1262) * 5 * 100) / 100;
  return eur.toFixed(2);
}

const imageFileCache = new Set(
  fs.existsSync(IMG_DIR) ? fs.readdirSync(IMG_DIR) : []
);

function resolveImage(modelId: string, slug: string): string | null {
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const name = `model-${modelId}-${slug}.${ext}`;
    if (imageFileCache.has(name)) {
      return `/images/sxx/models/${name}`;
    }
  }
  return null;
}

// ─── Main ──────────────────────────────────────────────────────────────────

type RawItem = {
  fault_type: string;
  item_name: string;
  price: number;
  original_price: number;
  pmid: string;
  malid: string;
};

type RawRecord = {
  brand_id: string;
  model_id: string;
  model_name: string;
  model_img_url: string;
  fault_types: string[];
  repair_items: RawItem[];
  brand_name: string;
};

async function main() {
  const raw: RawRecord[] = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  console.log(`[sxx] loaded ${raw.length} device records`);

  // 1. Upsert categories and collect slug→id
  console.log("[sxx] upserting categories…");
  const categoryIdBySlug = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const [row] = await sql<Array<{ id: string }>>`
      INSERT INTO categories (name, slug, sort_order)
      VALUES (${cat.name}, ${cat.slug}, ${cat.sort})
      ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order
      RETURNING id
    `;
    categoryIdBySlug.set(cat.slug, row.id);
  }
  console.log(`[sxx] categories ready: ${categoryIdBySlug.size}`);

  // 2. Build rows for repair_services
  const rows: Array<{
    name: string;
    slug: string;
    category_id: string;
    device_model: string;
    device_brand: string;
    device_slug: string;
    device_type: string;
    image_url: string | null;
    base_price: string | null;
  }> = [];

  let skippedBrand = 0;
  let skippedFault = 0;
  let skippedItem = 0;
  let imagesFound = 0;
  const seenSlugs = new Set<string>();

  for (const rec of raw) {
    const brand = BRAND_MAP[rec.brand_id];
    if (!brand) {
      skippedBrand++;
      continue;
    }
    const deviceSlug = slugify(rec.model_name);
    const imgUrl = resolveImage(rec.model_id, deviceSlug);
    if (imgUrl) imagesFound++;

    for (const item of rec.repair_items) {
      const catSlug = FAULT_TO_CATEGORY[item.fault_type];
      if (!catSlug) {
        skippedFault++;
        continue;
      }
      const catId = categoryIdBySlug.get(catSlug);
      if (!catId) {
        skippedFault++;
        continue;
      }
      const englishName = ITEM_NAME_MAP[item.item_name];
      if (!englishName) {
        skippedItem++;
        continue;
      }
      const serviceSlug = `${deviceSlug}-${catSlug}-${item.pmid}`;
      if (seenSlugs.has(serviceSlug)) continue;
      seenSlugs.add(serviceSlug);

      rows.push({
        name: englishName,
        slug: serviceSlug,
        category_id: catId,
        device_model: rec.model_name,
        device_brand: brand.name,
        device_slug: deviceSlug,
        device_type: brand.type,
        image_url: imgUrl,
        base_price: convertPrice(item.price),
      });
    }
  }

  console.log(`[sxx] prepared ${rows.length} rows`);
  console.log(
    `[sxx] images matched: ${imagesFound}/${raw.length} devices ` +
      `(${Math.round((imagesFound / raw.length) * 100)}%)`
  );
  console.log(
    `[sxx] skipped: brand=${skippedBrand} fault=${skippedFault} item=${skippedItem}`
  );

  // 3. Insert in batches with upsert-on-slug
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await sql`
      INSERT INTO repair_services ${sql(
        batch,
        "name",
        "slug",
        "category_id",
        "device_model",
        "device_brand",
        "device_slug",
        "device_type",
        "image_url",
        "base_price"
      )}
      ON CONFLICT (slug) DO UPDATE SET
        name         = EXCLUDED.name,
        category_id  = EXCLUDED.category_id,
        device_model = EXCLUDED.device_model,
        device_brand = EXCLUDED.device_brand,
        device_slug  = EXCLUDED.device_slug,
        device_type  = EXCLUDED.device_type,
        image_url    = EXCLUDED.image_url,
        base_price   = EXCLUDED.base_price,
        updated_at   = NOW()
    `;
    inserted += batch.length;
    process.stdout.write(`\r[sxx] inserted ${inserted}/${rows.length}`);
  }
  process.stdout.write("\n");

  // 4. Verify
  const [{ count: total }] = await sql<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM repair_services
  `;
  const [{ count: withImg }] = await sql<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM repair_services WHERE image_url IS NOT NULL
  `;
  const [{ count: withPrice }] = await sql<Array<{ count: string }>>`
    SELECT COUNT(*)::text AS count FROM repair_services WHERE base_price IS NOT NULL
  `;
  const brandCounts = await sql<Array<{ device_brand: string; c: string }>>`
    SELECT device_brand, COUNT(*)::text AS c
    FROM repair_services
    GROUP BY device_brand
    ORDER BY device_brand
  `;
  console.log(
    `[sxx] done. total=${total} with_image=${withImg} with_price=${withPrice}`
  );
  console.log("[sxx] rows per brand:");
  for (const r of brandCounts) console.log(`  ${r.device_brand}: ${r.c}`);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
