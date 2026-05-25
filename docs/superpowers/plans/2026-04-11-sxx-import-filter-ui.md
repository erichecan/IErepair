# SXX Data Import + Filter Browse UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import 1,694 shanxiuxia repair records into the product master library, convert prices (CNY → EUR ×5), copy images to public hosting, and build a jikexiu-style 4-level filter browse UI (Device Type → Brand → Model → Services).

**Architecture:** Schema migration adds `device_type` to `repair_services`. An import script maps Chinese brands/fault-types/item-names to English, upserts categories and services. A new `/repair/browse` page (Server Component + URL params) renders device type tabs, brand pills, and model grid — all linking to the existing `/repair/device/[slug]` detail page.

**Tech Stack:** Drizzle ORM + PostgreSQL (Neon), Next.js App Router, Tailwind CSS, TypeScript, tsx scripts

---

## File Map

| Action | Path |
|--------|------|
| Modify | `ierepair/lib/db/schema/repair-services.ts` — add `deviceType` field |
| Create | `ierepair/scripts/import-sxx.ts` — import script |
| Modify | `ierepair/lib/db/queries/repair.ts` — add browse queries |
| Create | `ierepair/app/(consumer)/repair/browse/page.tsx` — browse page |
| Create | `ierepair/app/(consumer)/repair/browse/BrowseClient.tsx` — client component for filters |

---

### Task 1: Add `device_type` column to `repair_services` schema

**Files:**
- Modify: `ierepair/lib/db/schema/repair-services.ts`

- [ ] **Step 1: Add `deviceType` field to schema**

Open `ierepair/lib/db/schema/repair-services.ts` and add `deviceType` after `deviceSlug`:

```typescript
import {
  pgTable, uuid, varchar, text, numeric, boolean, timestamp, integer, index,
} from "drizzle-orm/pg-core";
import { categories } from "./products";

export const repairServices = pgTable("repair_services", {
  id:           uuid("id").primaryKey().defaultRandom(),
  name:         varchar("name", { length: 255 }).notNull(),
  slug:         varchar("slug", { length: 300 }).unique().notNull(),
  description:  text("description"),
  categoryId:   uuid("category_id").references(() => categories.id),
  deviceModel:  varchar("device_model", { length: 255 }),
  deviceBrand:  varchar("device_brand", { length: 100 }),
  estimatedMin: integer("estimated_min").default(30),
  imageUrl:     text("image_url"),
  basePrice:    numeric("base_price", { precision: 10, scale: 2 }),
  deviceSlug:   varchar("device_slug", { length: 300 }),
  deviceType:   varchar("device_type", { length: 50 }),   // ← NEW: "phone" | "tablet"
  isActive:     boolean("is_active").default(true).notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_repair_services_category").on(t.categoryId),
  index("idx_repair_services_device").on(t.deviceBrand, t.deviceModel),
  index("idx_repair_services_device_slug").on(t.deviceSlug),
  index("idx_repair_services_device_type").on(t.deviceType),
]);

export const merchantServices = pgTable("merchant_services", {
  id:             uuid("id").primaryKey().defaultRandom(),
  merchantId:     uuid("merchant_id").notNull(),
  repairServiceId: uuid("repair_service_id").notNull().references(() => repairServices.id),
  price:          numeric("price", { precision: 10, scale: 2 }).notNull(),
  depositAmount:  numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  isAvailable:    boolean("is_available").default(true).notNull(),
  notes:          text("notes"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  updatedAt:      timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_merchant_services_merchant").on(t.merchantId),
  index("idx_merchant_services_service").on(t.repairServiceId),
]);

export type RepairService    = typeof repairServices.$inferSelect;
export type MerchantService  = typeof merchantServices.$inferSelect;
```

- [ ] **Step 2: Push schema change to DB**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx drizzle-kit push
```

Expected: `device_type varchar(50)` column added to `repair_services`. No error.

- [ ] **Step 3: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/lib/db/schema/repair-services.ts
git commit -m "feat: add device_type column to repair_services schema"
```

---

### Task 2: Copy scraped images to public hosting

**Files:**
- Source: `scripts/scraped-sxx/images/` (847 model images + 14 brand images)
- Destination: `ierepair/public/images/sxx/models/` and `ierepair/public/images/sxx/brands/`

- [ ] **Step 1: Create destination directories and copy**

```bash
mkdir -p /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/models
mkdir -p /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/brands
cp /Volumes/datacenter/ericworkspace/IErepair/scripts/scraped-sxx/images/models/* \
   /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/models/
cp /Volumes/datacenter/ericworkspace/IErepair/scripts/scraped-sxx/images/brands/* \
   /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/brands/
```

- [ ] **Step 2: Verify copy**

```bash
ls /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/models/ | wc -l
# Expected: 847
ls /Volumes/datacenter/ericworkspace/IErepair/ierepair/public/images/sxx/brands/ | wc -l
# Expected: 14
```

- [ ] **Step 3: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/public/images/sxx/
git commit -m "feat: add scraped sxx device and brand images to public hosting"
```

---

### Task 3: Write and run the SXX import script

**Files:**
- Create: `ierepair/scripts/import-sxx.ts`

This script upserts 13 English categories and 1,694+ repair service rows.

- [ ] **Step 1: Create the import script**

Create `ierepair/scripts/import-sxx.ts`:

```typescript
import "dotenv/config";
import { db } from "@/lib/db";
import { repairServices } from "@/lib/db/schema/repair-services";
import { categories } from "@/lib/db/schema/products";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// CNY → EUR rate (April 2026: 1 CNY ≈ 0.1262 EUR). Update if needed.
const CNY_EUR_RATE = 0.1262;

/* ── Brand mapping: sxx brand_id → { englishName, deviceType } ─ */
const BRAND_MAP: Record<string, { name: string; type: "phone" | "tablet" }> = {
  "1":  { name: "Apple",          type: "phone"  },
  "52": { name: "Huawei",         type: "phone"  },
  "74": { name: "Xiaomi",         type: "phone"  },
  "63": { name: "Honor",          type: "phone"  },
  "5":  { name: "Samsung",        type: "phone"  },
  "10": { name: "OPPO",           type: "phone"  },
  "11": { name: "Vivo",           type: "phone"  },
  "18": { name: "OnePlus",        type: "phone"  },
  "6":  { name: "Meizu",          type: "phone"  },
  "65": { name: "Realme",         type: "phone"  },
  "78": { name: "Other",          type: "phone"  },
  "64": { name: "iPad",           type: "tablet" },
  "88": { name: "Huawei Tablet",  type: "tablet" },
  "87": { name: "Xiaomi Tablet",  type: "tablet" },
};

/* ── Fault type → English category slug ───────────────────── */
const FAULT_CATEGORY_MAP: Record<string, string> = {
  "屏幕问题(更换总成 旧屏回收)": "screen-repair",
  "电池/充电问题":               "battery-repair",
  "后壳与边框":                  "back-shell-repair",
  "摄像头问题":                  "camera-repair",
  "按键问题":                    "button-repair",
  "内存扩容/升级":               "memory-upgrade",
  "软件故障/重装":               "software-repair",
  "安装服务":                    "installation-service",
  "面容与感应":                  "face-id-sensors-repair",
  "WiFi/手机信号问题":           "wifi-signal-repair",
  "声音问题":                    "speaker-audio-repair",
  "进水/无法开机/手机摔坏问题":  "power-on-repair",
  "进水与主板维修":              "power-on-repair",
  "打不着火":                    "power-on-repair",
  "其他问题":                    "other-repair",
  "Rokid故障":                   "other-repair",
};

/* ── Categories to upsert ─────────────────────────────────── */
const CATEGORY_DEFS = [
  { slug: "screen-repair",         name: "Screen Repair",                    sort: 1  },
  { slug: "battery-repair",        name: "Battery Repair",                   sort: 2  },
  { slug: "back-shell-repair",     name: "Back Shell & Frame Repair",        sort: 3  },
  { slug: "camera-repair",         name: "Camera Repair",                    sort: 4  },
  { slug: "button-repair",         name: "Button Repair",                    sort: 5  },
  { slug: "memory-upgrade",        name: "Memory / Storage Upgrade",         sort: 6  },
  { slug: "software-repair",       name: "Software Repair",                  sort: 7  },
  { slug: "installation-service",  name: "Installation Service",             sort: 8  },
  { slug: "face-id-sensors-repair",name: "Face ID & Sensors Repair",         sort: 9  },
  { slug: "wifi-signal-repair",    name: "WiFi & Signal Repair",             sort: 10 },
  { slug: "speaker-audio-repair",  name: "Speaker & Audio Repair",           sort: 11 },
  { slug: "power-on-repair",       name: "Power On / Water Damage Repair",   sort: 12 },
  { slug: "other-repair",          name: "Other Repair",                     sort: 13 },
];

/* ── Chinese item name → English translation ─────────────── */
const ITEM_NAME_MAP: Record<string, string> = {
  "原装电池":                              "OEM Battery Replacement",
  "华为原装电池":                          "Huawei OEM Battery Replacement",
  "更换标准容量电池":                      "Standard Battery Replacement",
  "升级大容量电池":                        "High-Capacity Battery Upgrade",
  "更换充电接口":                          "Charging Port Replacement",
  "充电":                                  "Charging Repair",
  "外屏碎(显示正常，旧屏回收)":           "Outer Screen (Display OK, Trade-in)",
  "外屏碎(显示正常，旧屏回收)更优显示屏": "Outer Screen - Premium Display (Trade-in)",
  "外屏碎(显示正常，旧屏回收，换LCD屏)":  "Outer Screen LCD (Trade-in)",
  "外屏碎(显示正常，旧屏回收，换OLED屏)": "Outer Screen OLED (Trade-in)",
  "外屏碎（仅更换外屏玻璃盖板，需到店）": "Outer Glass Panel Only (In-Store)",
  "外屏碎（显示正常，旧屏回收）特价屏":   "Outer Screen Budget Option (Trade-in)",
  "内屏显示异常":                          "Screen Display Repair",
  "内屏显示异常（换LCD屏）":               "Screen Display Repair - LCD",
  "内屏显示异常（换OLED 屏）":            "Screen Display Repair - OLED",
  "内屏显示异常（无指纹版）":              "Screen Display Repair (No Fingerprint)",
  "内屏显示异常（更优显示屏）":            "Screen Display Repair - Premium",
  "原装屏幕总成":                          "OEM Screen Assembly",
  "屏幕上门安装（屏幕自备）":             "Screen Installation (Part Provided)",
  "屏幕转接排线":                          "Screen Flex Cable",
  "更换后盖玻璃":                          "Back Glass Replacement",
  "更换后壳":                              "Back Housing Replacement",
  "后壳上门安装(后壳自备)":              "Back Shell Installation (Part Provided)",
  "更换后摄像头":                          "Rear Camera Replacement",
  "更换前摄像头":                          "Front Camera Replacement",
  "更换后摄像头镜片":                      "Rear Camera Lens Replacement",
  "摄像头支架":                            "Camera Bracket Repair",
  "排线（开机/音量/指纹）":               "Button Flex Cable (Power/Volume/Fingerprint)",
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
  "安装服务（自备物料）":                  "Installation Service (Parts Provided)",
  "上门贴膜(高清钢化膜)":                "Screen Protector Installation - HD",
  "上门贴膜(防窥膜)":                     "Screen Protector Installation - Privacy",
  "到店贴膜(高清钢化膜)":                "In-Store Screen Protector - HD",
  "到店贴膜(防窥膜)":                     "In-Store Screen Protector - Privacy",
  "面容修复":                              "Face ID Repair",
  "手机无信号(主板)":                     "No Signal Repair (Motherboard)",
  "无WIFI(主板)":                         "No WiFi Repair (Motherboard)",
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

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-");
}

function convertPrice(cnyPrice: number): number {
  if (!cnyPrice || cnyPrice <= 0) return 0;
  const eur = (cnyPrice / CNY_EUR_RATE) * 5;
  return Math.round(eur * 100) / 100;
}

async function upsertCategories(): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>();

  for (const cat of CATEGORY_DEFS) {
    const result = await db.execute(sql.raw(`
      INSERT INTO categories (id, name, slug, sort_order, created_at)
      VALUES (gen_random_uuid(), '${cat.name.replace(/'/g, "''")}', '${cat.slug}', ${cat.sort}, now())
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order
      RETURNING id, slug
    `));
    const row = (result as unknown[])[0] as Record<string, unknown>;
    slugToId.set(String(row.slug), String(row.id));
  }

  console.log(`✓ Upserted ${CATEGORY_DEFS.length} categories`);
  return slugToId;
}

async function main() {
  console.log("=== SXX Import Script ===");
  console.log(`CNY/EUR rate: ${CNY_EUR_RATE} | Price multiplier: ×5`);

  // Step 1: Upsert categories
  const categorySlugToId = await upsertCategories();

  // Step 2: Load scraped data
  const dataPath = path.join(__dirname, "../../scripts/scraped-sxx/repair_items.json");
  const rawData = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as Array<{
    brand_id: string;
    model_id: string;
    model_name: string;
    model_img_url: string;
    fault_types: string[];
    repair_items: Array<{
      fault_type: string;
      item_name: string;
      price: number;
      original_price: number;
      pmid: string;
      malid: string;
    }>;
    brand_name: string;
  }>;

  console.log(`Loaded ${rawData.length} device records`);

  let inserted = 0;
  let skipped = 0;

  for (const device of rawData) {
    const brandInfo = BRAND_MAP[device.brand_id];
    if (!brandInfo) {
      console.warn(`Unknown brand_id ${device.brand_id} (${device.brand_name}), skipping`);
      skipped++;
      continue;
    }

    const deviceSlug = slugify(device.model_name);

    // Determine local image path
    // Image files are named: model-{model_id}-{slugified-name}.{ext}
    const imgSlug = slugify(device.model_name);
    const imgExtensions = ["png", "jpg", "jpeg", "webp"];
    let imageUrl: string | null = null;
    for (const ext of imgExtensions) {
      const localFile = `model-${device.model_id}-${imgSlug}.${ext}`;
      const fullPath = path.join(
        __dirname,
        "../../scripts/scraped-sxx/images/models",
        localFile
      );
      if (fs.existsSync(fullPath)) {
        imageUrl = `/images/sxx/models/${localFile}`;
        break;
      }
    }

    for (const item of device.repair_items) {
      const categorySlug = FAULT_CATEGORY_MAP[item.fault_type];
      if (!categorySlug) {
        console.warn(`Unknown fault_type: "${item.fault_type}", using other-repair`);
      }
      const resolvedCategorySlug = categorySlug || "other-repair";
      const categoryId = categorySlugToId.get(resolvedCategorySlug);

      const englishName = ITEM_NAME_MAP[item.item_name] || item.item_name;
      const basePrice = item.price > 0 ? convertPrice(item.price) : null;

      // Slug: device-slug + category-slug fragment + pmid (unique)
      const serviceSlug = `${deviceSlug}-${resolvedCategorySlug}-${item.pmid}`;

      await db.execute(sql.raw(`
        INSERT INTO repair_services (
          id, name, slug, category_id, device_model, device_brand,
          device_slug, device_type, image_url, base_price,
          estimated_min, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          '${englishName.replace(/'/g, "''")}',
          '${serviceSlug.replace(/'/g, "''")}',
          ${categoryId ? `'${categoryId}'` : "NULL"},
          '${device.model_name.replace(/'/g, "''")}',
          '${brandInfo.name.replace(/'/g, "''")}',
          '${deviceSlug.replace(/'/g, "''")}',
          '${brandInfo.type}',
          ${imageUrl ? `'${imageUrl}'` : "NULL"},
          ${basePrice !== null ? basePrice : "NULL"},
          30,
          true,
          now(), now()
        )
        ON CONFLICT (slug) DO UPDATE SET
          name         = EXCLUDED.name,
          category_id  = EXCLUDED.category_id,
          device_model = EXCLUDED.device_model,
          device_brand = EXCLUDED.device_brand,
          device_slug  = EXCLUDED.device_slug,
          device_type  = EXCLUDED.device_type,
          image_url    = COALESCE(EXCLUDED.image_url, repair_services.image_url),
          base_price   = EXCLUDED.base_price,
          updated_at   = now()
      `));
      inserted++;
    }
  }

  console.log(`✓ Upserted ${inserted} repair services`);
  console.log(`  Skipped: ${skipped} devices (unknown brand)`);

  const countResult = await db.execute(sql.raw(
    "SELECT COUNT(*) as cnt FROM repair_services WHERE device_slug IS NOT NULL"
  ));
  const row = (countResult as unknown[])[0] as Record<string, unknown>;
  console.log(`✓ Total repair_services in DB: ${row.cnt}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the import script**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx tsx scripts/import-sxx.ts
```

Expected output:
```
=== SXX Import Script ===
CNY/EUR rate: 0.1262 | Price multiplier: ×5
✓ Upserted 13 categories
Loaded 1694 device records
✓ Upserted ~7000+ repair services
  Skipped: 0 devices
✓ Total repair_services in DB: ~7100+
```

- [ ] **Step 3: Verify in DB**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx tsx -e "
import 'dotenv/config';
import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function check() {
  const r = await db.execute(sql.raw(\`
    SELECT device_type, COUNT(*) as cnt FROM repair_services
    WHERE device_type IS NOT NULL GROUP BY device_type
  \`));
  console.log('By device_type:', JSON.stringify(r));

  const r2 = await db.execute(sql.raw(\`
    SELECT device_brand, COUNT(*) as cnt FROM repair_services
    WHERE device_type IS NOT NULL GROUP BY device_brand ORDER BY cnt DESC
  \`));
  console.log('By brand:', JSON.stringify(r2));
  process.exit(0);
}
check();
" 2>&1 | head -20
```

Wait, inline tsx with top-level await fails. Write a quick-check script instead:

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
cat > scripts/check-import.ts << 'EOF'
import "dotenv/config";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const byType = await db.execute(sql.raw(
    "SELECT device_type, COUNT(*) as cnt FROM repair_services WHERE device_type IS NOT NULL GROUP BY device_type"
  ));
  console.log("By device_type:", JSON.stringify(byType));

  const byBrand = await db.execute(sql.raw(
    "SELECT device_brand, COUNT(*) as cnt FROM repair_services WHERE device_type IS NOT NULL GROUP BY device_brand ORDER BY cnt DESC"
  ));
  console.log("By brand:", JSON.stringify(byBrand));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
EOF
npx tsx scripts/check-import.ts
```

Expected: phone count >> 0, tablet count > 0, multiple brands listed.

- [ ] **Step 4: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/scripts/import-sxx.ts ierepair/scripts/check-import.ts
git commit -m "feat: import 1694 sxx devices into repair_services with CNY→EUR×5 pricing"
```

---

### Task 4: Add browse queries to repair.ts

**Files:**
- Modify: `ierepair/lib/db/queries/repair.ts`

- [ ] **Step 1: Add new types and queries**

Append to `ierepair/lib/db/queries/repair.ts`:

```typescript
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
  deviceType: string;
  minPrice: number | null;
  imageUrl: string | null;
};

/** Returns all brands with service counts, optionally filtered by deviceType */
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
      deviceType:  String(row.device_type ?? "phone"),
      minPrice:    row.min_price != null ? Number(row.min_price) : null,
      imageUrl:    row.image_url ? String(row.image_url) : null,
    };
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx tsc --noEmit 2>&1 | grep -i error | head -20
```

Expected: no errors (or zero lines).

- [ ] **Step 3: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/lib/db/queries/repair.ts
git commit -m "feat: add getBrandsWithCounts and getDevicesByBrand queries"
```

---

### Task 5: Build the `/repair/browse` page

**Files:**
- Create: `ierepair/app/(consumer)/repair/browse/page.tsx`
- Create: `ierepair/app/(consumer)/repair/browse/BrowseClient.tsx`

The page uses URL search params for state: `?type=phone&brand=Apple`

- [ ] **Step 1: Create the client component `BrowseClient.tsx`**

Create `ierepair/app/(consumer)/repair/browse/BrowseClient.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Wrench, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BrandWithCount, DeviceBrowseItem } from "@/lib/db/queries/repair";

type Props = {
  deviceType: string;
  brands: BrandWithCount[];
  selectedBrand: string | null;
  devices: DeviceBrowseItem[];
};

const DEVICE_TYPES = [
  { value: "phone",  label: "Phone" },
  { value: "tablet", label: "Tablet" },
];

export default function BrowseClient({ deviceType, brands, selectedBrand, devices }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setType(type: string) {
    router.push(`/repair/browse?type=${type}`);
  }

  function setBrand(brand: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("brand", brand);
    router.push(`/repair/browse?${params.toString()}`);
  }

  return (
    <div className="pb-10">
      {/* ── Device Type Tabs ────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex gap-0">
            {DEVICE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  deviceType === t.value
                    ? "border-[#242424] text-[#242424]"
                    : "border-transparent text-[#898989] hover:text-[#242424]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-6">
        {/* ── Brand Pills ──────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("type", deviceType);
              router.push(`/repair/browse?${params.toString()}`);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              !selectedBrand
                ? "bg-[#242424] text-white border-[#242424]"
                : "bg-white text-[#242424] border-[rgba(34,42,53,0.16)] hover:border-[#242424]"
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.brand}
              onClick={() => setBrand(b.brand)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedBrand === b.brand
                  ? "bg-[#242424] text-white border-[#242424]"
                  : "bg-white text-[#242424] border-[rgba(34,42,53,0.16)] hover:border-[#242424]"
              }`}
            >
              {b.brand}
              <span className="ml-1.5 text-xs opacity-60">{b.count}</span>
            </button>
          ))}
        </div>

        {/* ── Model Grid ───────────────────────────────────── */}
        {devices.length === 0 ? (
          <div className="text-center py-16 text-[#898989] text-sm">
            {selectedBrand
              ? `No devices found for ${selectedBrand}.`
              : "Select a brand to see devices."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {devices.map((device) => (
              <Link
                key={device.deviceSlug}
                href={`/repair/device/${device.deviceSlug}`}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:bg-[#f8f8f8] transition-colors group"
                style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.03) 0px 2px 8px" }}
              >
                {/* Device image */}
                <div className="w-16 h-16 rounded-xl bg-[#f5f5f5] flex items-center justify-center relative overflow-hidden">
                  {device.imageUrl ? (
                    <Image
                      src={device.imageUrl}
                      alt={device.deviceModel}
                      fill
                      className="object-contain p-1.5"
                      sizes="64px"
                      unoptimized
                    />
                  ) : (
                    <Wrench size={24} className="text-[#898989]" />
                  )}
                </div>

                {/* Model name */}
                <div className="text-xs font-semibold text-[#242424] text-center leading-tight line-clamp-2">
                  {device.deviceModel}
                </div>

                {/* Price */}
                {device.minPrice != null ? (
                  <div className="text-xs text-[#e05c2a] font-medium">
                    From €{device.minPrice.toFixed(0)}
                  </div>
                ) : (
                  <div className="text-xs text-[#898989]">On request</div>
                )}

                <ChevronRight size={14} className="text-[#c0c0c0] group-hover:text-[#242424] transition-colors mt-auto" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the server page `page.tsx`**

Create `ierepair/app/(consumer)/repair/browse/page.tsx`:

```tsx
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBrandsWithCounts, getDevicesByBrand } from "@/lib/db/queries/repair";
import BrowseClient from "./BrowseClient";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; brand?: string }>;
}) {
  const { type, brand } = await searchParams;
  const deviceType = type === "tablet" ? "tablet" : "phone";
  const selectedBrand = brand ?? null;

  const [brands, devices] = await Promise.all([
    getBrandsWithCounts(deviceType),
    selectedBrand ? getDevicesByBrand(selectedBrand, deviceType) : Promise.resolve([]),
  ]);

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-6 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#898989] hover:text-[#242424] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1
          className="text-2xl md:text-3xl font-bold text-[#242424]"
          style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
        >
          Browse Repairs
        </h1>
        <p className="text-sm text-[#898989] mt-1">
          Select your device brand and model to see all available repairs
        </p>
      </div>

      {/* ── Client filter UI ─────────────────────────────── */}
      <Suspense>
        <BrowseClient
          deviceType={deviceType}
          brands={brands}
          selectedBrand={selectedBrand}
          devices={devices}
        />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx tsc --noEmit 2>&1 | grep -i error | head -20
```

Expected: zero errors.

- [ ] **Step 4: Start dev server and verify browse page**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm run dev
```

Open: `http://localhost:3000/repair/browse`

Check:
- Phone / Tablet tabs visible
- Brand pills show (Apple, Samsung, Huawei, etc. with device counts)
- Clicking Apple shows iPhone model grid with images
- Clicking a model navigates to `/repair/device/[slug]` and shows services

- [ ] **Step 5: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/app/(consumer)/repair/browse/
git commit -m "feat: add /repair/browse page with device type tabs, brand pills, and model grid"
```

---

### Task 6: Add browse entry point to homepage

**Files:**
- Modify: `ierepair/app/(consumer)/page.tsx`

The homepage already has iPhone/Android repair sections. We need to add a "Browse All Devices" CTA button linking to `/repair/browse`.

- [ ] **Step 1: Find the CTA section in page.tsx and add browse link**

Read `ierepair/app/(consumer)/page.tsx` to locate the section after the repair cards (around line 120-180 based on prior context). Add a "Browse All Devices" button block before or after the existing repair grid. The button should look like:

```tsx
{/* ── Browse All CTA ─────────────────────────── */}
<div className="text-center mt-8">
  <Link
    href="/repair/browse"
    className="inline-flex items-center gap-2 px-6 py-3 bg-[#242424] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
  >
    Browse All Devices
    <ChevronRight size={16} />
  </Link>
</div>
```

Find the appropriate location by reading the file, then add the block. Make sure `ChevronRight` is imported from `lucide-react` (it likely already is).

- [ ] **Step 2: Verify page loads without errors**

Open: `http://localhost:3000`

Check: "Browse All Devices" button visible. Clicking it navigates to `/repair/browse`.

- [ ] **Step 3: Run build check**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm run build 2>&1 | tail -20
```

Expected: no build errors.

- [ ] **Step 4: Commit**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair
git add ierepair/app/(consumer)/page.tsx
git commit -m "feat: add Browse All Devices link to homepage"
```

---

## Self-Review

**Spec coverage:**
- ✅ 1,694 records imported → Task 3
- ✅ CNY → EUR ×5 price conversion → Task 3 (`convertPrice`)
- ✅ Images accessible on website → Task 2 (copied to `/public/images/sxx/`)
- ✅ Chinese categories translated to English → Task 3 (`CATEGORY_DEFS` + `FAULT_CATEGORY_MAP`)
- ✅ New English categories created if not exist → Task 3 (`upsertCategories`)
- ✅ jikexiu-style filter UI → Task 5 (Device Type tabs → Brand pills → Model grid)
- ✅ Linking to existing device detail page → Task 5 (`/repair/device/[slug]`)
- ✅ `device_type` field for phone/tablet split → Task 1

**Type consistency:**
- `getBrandsWithCounts` returns `BrandWithCount[]` → used in `BrowseClient` Props ✅
- `getDevicesByBrand` returns `DeviceBrowseItem[]` → used in `BrowseClient` Props ✅
- `deviceType` string propagated from URL param through page → client ✅

**Placeholder scan:** No TBDs or "implement later" patterns found.

**Image path note:** Images are copied to `/public/images/sxx/models/model-{id}-{slug}.{ext}`. The import script resolves the exact filename by checking for .png/.jpg/.jpeg/.webp variants. If a model has no local image, `image_url` is set to NULL (gracefully handled by the device page with a Wrench icon fallback).
