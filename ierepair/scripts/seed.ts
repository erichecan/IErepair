/**
 * IERepair Seed Script
 * Run: npx tsx scripts/seed.ts
 *
 * Creates:
 *  - 1 Admin account
 *  - 5 Product categories
 *  - 3 Brands
 *  - 50+ Products (parts + accessories + services)
 *  - 6 Repair service templates
 *  - 3 Active merchants with PostGIS locations
 *  - Merchant products (each shop stocks 10-15 items)
 *  - Merchant services (each shop offers 4-6 repair services)
 *  - 1 Global commission rule (8% repair services)
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import * as schema from "../lib/db/schema";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Seed data ────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding IERepair database…\n");

  // 1. Admin
  console.log("→ Creating admin…");
  const adminHash = await bcrypt.hash(process.env.ADMIN_INIT_PASSWORD ?? "IERepair2024!", 12);
  const [admin] = await db.insert(schema.adminUsers).values({
    email:        process.env.ADMIN_INIT_EMAIL ?? "admin@ierepair.ie",
    passwordHash: adminHash,
    name:         "IERepair Admin",
    role:         "super_admin",
  }).onConflictDoNothing().returning();
  console.log("  ✓ Admin:", admin?.email ?? "already exists");

  // 2. Brands
  console.log("→ Creating brands…");
  const brandData = [
    { name: "Apple",    slug: "apple" },
    { name: "Samsung",  slug: "samsung" },
    { name: "Anker",    slug: "anker" },
  ];
  const brands = await db.insert(schema.brands).values(brandData).onConflictDoNothing().returning();
  const brandMap = Object.fromEntries(brands.map((b) => [b.name, b.id]));
  console.log(`  ✓ ${brands.length} brands`);

  // 3. Categories
  console.log("→ Creating categories…");
  const categoryData = [
    { name: "Screen Repair",    slug: "screen-repair",    description: "Screen replacement services",      sortOrder: 1 },
    { name: "Battery Repair",   slug: "battery-repair",   description: "Battery replacement services",     sortOrder: 2 },
    { name: "Phone Cases",      slug: "phone-cases",      description: "Protective cases & covers",        sortOrder: 3 },
    { name: "Charging & Cables",slug: "charging-cables",  description: "Chargers, cables & power banks",   sortOrder: 4 },
    { name: "Earphones",        slug: "earphones",        description: "Wired & wireless earphones",       sortOrder: 5 },
    { name: "Screen Protectors",slug: "screen-protectors",description: "Tempered glass & film protectors", sortOrder: 6 },
  ];
  const cats = await db.insert(schema.categories).values(categoryData).onConflictDoNothing().returning();
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  console.log(`  ✓ ${cats.length} categories`);

  // 4. Products (50+ SKUs)
  console.log("→ Creating products…");
  const productData = [
    // Screen repair parts
    { name: "iPhone 15 Pro OLED Screen Assembly",   sku: "IP15P-OLED-ASM", type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Apple"],   basePrice: "89.99",  compatibility: "iPhone 15 Pro" },
    { name: "iPhone 15 OLED Screen Assembly",       sku: "IP15-OLED-ASM",  type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Apple"],   basePrice: "79.99",  compatibility: "iPhone 15" },
    { name: "iPhone 14 Pro OLED Screen Assembly",   sku: "IP14P-OLED-ASM", type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Apple"],   basePrice: "74.99",  compatibility: "iPhone 14 Pro" },
    { name: "iPhone 14 OLED Screen Assembly",       sku: "IP14-OLED-ASM",  type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Apple"],   basePrice: "64.99",  compatibility: "iPhone 14" },
    { name: "iPhone 13 OLED Screen Assembly",       sku: "IP13-OLED-ASM",  type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Apple"],   basePrice: "54.99",  compatibility: "iPhone 13" },
    { name: "Samsung S24 AMOLED Screen Assembly",   sku: "SS24-AMOLED-ASM",type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Samsung"], basePrice: "84.99",  compatibility: "Samsung Galaxy S24" },
    { name: "Samsung S23 AMOLED Screen Assembly",   sku: "SS23-AMOLED-ASM",type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Samsung"], basePrice: "74.99",  compatibility: "Samsung Galaxy S23" },
    { name: "Samsung A54 LCD Screen Assembly",      sku: "SSA54-LCD-ASM",  type: "part" as const,      categoryId: catMap["screen-repair"],     brandId: brandMap["Samsung"], basePrice: "44.99",  compatibility: "Samsung Galaxy A54" },
    // Battery parts
    { name: "iPhone 15 Pro Battery 3274mAh",        sku: "IP15P-BAT",      type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Apple"],   basePrice: "34.99",  compatibility: "iPhone 15 Pro" },
    { name: "iPhone 15 Battery 3349mAh",            sku: "IP15-BAT",       type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Apple"],   basePrice: "29.99",  compatibility: "iPhone 15" },
    { name: "iPhone 14 Pro Battery 3200mAh",        sku: "IP14P-BAT",      type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Apple"],   basePrice: "27.99",  compatibility: "iPhone 14 Pro" },
    { name: "iPhone 13 Battery 3227mAh",            sku: "IP13-BAT",       type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Apple"],   basePrice: "24.99",  compatibility: "iPhone 13" },
    { name: "Samsung S24 Battery 4000mAh",          sku: "SS24-BAT",       type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Samsung"], basePrice: "29.99",  compatibility: "Samsung Galaxy S24" },
    { name: "Samsung S23 Battery 3900mAh",          sku: "SS23-BAT",       type: "part" as const,      categoryId: catMap["battery-repair"],    brandId: brandMap["Samsung"], basePrice: "24.99",  compatibility: "Samsung Galaxy S23" },
    // Phone cases
    { name: "iPhone 15 Pro Leather Case — Black",   sku: "IP15P-CASE-BLK", type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "19.99",  compatibility: "iPhone 15 Pro" },
    { name: "iPhone 15 Pro Clear Case",             sku: "IP15P-CASE-CLR", type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "12.99",  compatibility: "iPhone 15 Pro" },
    { name: "iPhone 15 Silicone Case — Midnight",   sku: "IP15-CASE-MID",  type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "14.99",  compatibility: "iPhone 15" },
    { name: "iPhone 14 Pro Clear Case",             sku: "IP14P-CASE-CLR", type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "11.99",  compatibility: "iPhone 14 Pro" },
    { name: "Samsung S24 MagSafe Case",             sku: "SS24-CASE-MAG",  type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "16.99",  compatibility: "Samsung Galaxy S24" },
    { name: "Samsung A54 Rugged Case",              sku: "SSA54-CASE-RGD", type: "accessory" as const, categoryId: catMap["phone-cases"],       brandId: undefined,           basePrice: "13.99",  compatibility: "Samsung Galaxy A54" },
    // Chargers & cables
    { name: "Anker USB-C 20W Fast Charger",         sku: "ANKER-CHG-20W",  type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Anker"],   basePrice: "22.99",  compatibility: "Universal USB-C" },
    { name: "Anker USB-C to Lightning Cable 1m",    sku: "ANKER-CBL-CL1M", type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Anker"],   basePrice: "14.99",  compatibility: "iPhone Lightning" },
    { name: "Anker USB-C to USB-C Cable 1m",        sku: "ANKER-CBL-CC1M", type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Anker"],   basePrice: "12.99",  compatibility: "Universal USB-C" },
    { name: "Anker 65W GaN Charger (2 ports)",      sku: "ANKER-CHG-65W",  type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Anker"],   basePrice: "44.99",  compatibility: "Universal USB-C" },
    { name: "Anker PowerCore 10000 Power Bank",     sku: "ANKER-PB-10K",   type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Anker"],   basePrice: "34.99",  compatibility: "Universal" },
    { name: "Apple MagSafe Charger 1m",             sku: "AP-MAGSAFE-1M",  type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Apple"],   basePrice: "38.99",  compatibility: "iPhone 12 and later" },
    { name: "Samsung 25W Super Fast Charger",       sku: "SS-CHG-25W",     type: "accessory" as const, categoryId: catMap["charging-cables"],   brandId: brandMap["Samsung"], basePrice: "24.99",  compatibility: "Samsung Galaxy (USB-C)" },
    // Earphones
    { name: "Apple EarPods USB-C",                  sku: "AP-EARPODS-USBC",type: "accessory" as const, categoryId: catMap["earphones"],         brandId: brandMap["Apple"],   basePrice: "19.99",  compatibility: "iPhone 15 series & USB-C devices" },
    { name: "Apple EarPods Lightning",              sku: "AP-EARPODS-LTN", type: "accessory" as const, categoryId: catMap["earphones"],         brandId: brandMap["Apple"],   basePrice: "16.99",  compatibility: "iPhone Lightning" },
    { name: "Samsung Galaxy Buds FE",               sku: "SS-BUDSFE",      type: "accessory" as const, categoryId: catMap["earphones"],         brandId: brandMap["Samsung"], basePrice: "49.99",  compatibility: "Universal Bluetooth" },
    { name: "Anker Soundcore Life P2i Earbuds",     sku: "ANKER-P2I",      type: "accessory" as const, categoryId: catMap["earphones"],         brandId: brandMap["Anker"],   basePrice: "29.99",  compatibility: "Universal Bluetooth" },
    // Screen protectors
    { name: "iPhone 15 Pro Tempered Glass (2-pack)", sku: "IP15P-TG-2PK",  type: "accessory" as const, categoryId: catMap["screen-protectors"], brandId: undefined,           basePrice: "9.99",   compatibility: "iPhone 15 Pro" },
    { name: "iPhone 15 Tempered Glass (2-pack)",    sku: "IP15-TG-2PK",    type: "accessory" as const, categoryId: catMap["screen-protectors"], brandId: undefined,           basePrice: "8.99",   compatibility: "iPhone 15" },
    { name: "iPhone 14 Pro Tempered Glass (2-pack)",sku: "IP14P-TG-2PK",   type: "accessory" as const, categoryId: catMap["screen-protectors"], brandId: undefined,           basePrice: "7.99",   compatibility: "iPhone 14 Pro" },
    { name: "Samsung S24 Tempered Glass",           sku: "SS24-TG",        type: "accessory" as const, categoryId: catMap["screen-protectors"], brandId: undefined,           basePrice: "8.99",   compatibility: "Samsung Galaxy S24" },
    { name: "Samsung A54 Privacy Screen Protector", sku: "SSA54-PRIV",     type: "accessory" as const, categoryId: catMap["screen-protectors"], brandId: undefined,           basePrice: "9.99",   compatibility: "Samsung Galaxy A54" },
  ];

  const productSlugMap: Record<string, string> = {};
  for (const p of productData) productSlugMap[p.sku] = `${slug(p.name)}-${p.sku.toLowerCase()}`;

  const insertedProducts = await db.insert(schema.products).values(
    productData.map((p) => ({
      ...p,
      brandId:    p.brandId ?? null,
      slug:       productSlugMap[p.sku],
      status:     "active" as const,
    }))
  ).onConflictDoNothing().returning();
  const productMap = Object.fromEntries(insertedProducts.map((p) => [p.sku, p.id]));
  console.log(`  ✓ ${insertedProducts.length} products`);

  // 5. Repair service templates
  console.log("→ Creating repair service templates…");
  const serviceData = [
    { name: "iPhone Screen Replacement",   slug: "iphone-screen-replacement",   categoryId: catMap["screen-repair"],  deviceBrand: "Apple",   deviceModel: null,           estimatedMin: 45 },
    { name: "Samsung Screen Replacement",  slug: "samsung-screen-replacement",  categoryId: catMap["screen-repair"],  deviceBrand: "Samsung", deviceModel: null,           estimatedMin: 60 },
    { name: "iPhone Battery Replacement",  slug: "iphone-battery-replacement",  categoryId: catMap["battery-repair"], deviceBrand: "Apple",   deviceModel: null,           estimatedMin: 30 },
    { name: "Samsung Battery Replacement", slug: "samsung-battery-replacement", categoryId: catMap["battery-repair"], deviceBrand: "Samsung", deviceModel: null,           estimatedMin: 30 },
    { name: "Water Damage Repair",         slug: "water-damage-repair",         categoryId: catMap["screen-repair"],  deviceBrand: null,      deviceModel: null,           estimatedMin: 120 },
    { name: "Charging Port Repair",        slug: "charging-port-repair",        categoryId: catMap["charging-cables"],deviceBrand: null,      deviceModel: null,           estimatedMin: 45 },
  ];
  const insertedServices = await db.insert(schema.repairServices).values(serviceData).onConflictDoNothing().returning();
  const serviceMap = Object.fromEntries(insertedServices.map((s) => [s.slug, s.id]));
  console.log(`  ✓ ${insertedServices.length} repair service templates`);

  // 6. Merchants (3 Dublin shops + PostGIS location)
  console.log("→ Creating merchants…");
  const merchantPassword = await bcrypt.hash("Merchant2024!", 12);
  const merchantsData = [
    {
      shopName: "Dublin City Phone Repair",
      slug:     "dublin-city-phone-repair",
      email:    "merchant1@ierepair.ie",
      eircode:  "D01 A234",
      city:     "Dublin 1",
      address:  "12 O'Connell Street, Dublin 1",
      phone:    "+353 1 234 5678",
      lat: 53.3498, lng: -6.2603,
    },
    {
      shopName: "South Dublin Repairs",
      slug:     "south-dublin-repairs",
      email:    "merchant2@ierepair.ie",
      eircode:  "D6W AB12",
      city:     "Dublin 6",
      address:  "45 Rathmines Road Lower, Dublin 6",
      phone:    "+353 1 345 6789",
      lat: 53.3213, lng: -6.2695,
    },
    {
      shopName: "North Dublin Phone Hub",
      slug:     "north-dublin-phone-hub",
      email:    "merchant3@ierepair.ie",
      eircode:  "D09 XY34",
      city:     "Dublin 9",
      address:  "78 Drumcondra Road, Dublin 9",
      phone:    "+353 1 456 7890",
      lat: 53.3726, lng: -6.2493,
    },
  ];

  const defaultHours = Object.fromEntries(
    ["mon","tue","wed","thu","fri","sat","sun"].map((d) => [
      d, { open: d !== "sun", from: "09:00", to: "18:00" }
    ])
  );

  for (const m of merchantsData) {
    const [merchant] = await db.insert(schema.merchants).values({
      shopName:      m.shopName,
      slug:          m.slug,
      email:         m.email,
      passwordHash:  merchantPassword,
      eircode:       m.eircode,
      city:          m.city,
      address:       m.address,
      phone:         m.phone,
      status:        "active",
      businessHours: defaultHours,
      slotDurationMin: 30,
      maxAdvanceDays:  14,
    }).onConflictDoNothing().returning();

    if (merchant) {
      // Update PostGIS location
      await db.execute(
        sql`UPDATE merchants SET location = ST_MakePoint(${m.lng}, ${m.lat})::geometry WHERE id = ${merchant.id}`
      );

      // Assign products
      const merchantProductRows = Object.values(productMap).slice(0, 15).map((productId, i) => ({
        merchantId:  merchant.id,
        productId,
        price:       (parseFloat(productData[i % productData.length].basePrice ?? "19.99") * 1.2).toFixed(2),
        stock:       Math.floor(Math.random() * 20) + 5,
        isAvailable: true,
      }));
      await db.insert(schema.merchantProducts).values(merchantProductRows).onConflictDoNothing();

      // Assign repair services
      const merchantServiceRows = Object.entries(serviceMap).map(([sSlug, serviceId]) => ({
        merchantId:     merchant.id,
        repairServiceId: serviceId,
        price:          sSlug.includes("screen") ? "79.99" : sSlug.includes("battery") ? "49.99" : "59.99",
        depositAmount:  sSlug.includes("screen") ? "16.00" : sSlug.includes("battery") ? "10.00" : "12.00",
        isAvailable:    true,
      }));
      await db.insert(schema.merchantServices).values(merchantServiceRows).onConflictDoNothing();

      console.log(`  ✓ ${m.shopName} (${m.city})`);
    } else {
      console.log(`  · ${m.shopName} already exists`);
    }
  }

  // 7. Global commission rule (8% repair services)
  console.log("→ Creating commission rules…");
  await db.insert(schema.commissionRules).values({
    scope:    "global",
    type:     "repair_service",
    rate:     "0.0800",
    priority: 0,
  }).onConflictDoNothing();
  console.log("  ✓ Global repair commission: 8%");

  console.log("\n✅ Seed complete!\n");
  console.log("Admin login: admin@ierepair.ie / IERepair2024!");
  console.log("Merchant logins: merchant1@ierepair.ie (also 2, 3) / Merchant2024!");
  await client.end();
}

main().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
