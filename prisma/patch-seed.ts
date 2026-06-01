import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

type SvcDef = { modelName: string; repairTypeEn: string; price: number };

async function addMerchantServices(merchantEmail: string, services: SvcDef[]) {
  const merchant = await prisma.merchant.findUnique({ where: { email: merchantEmail } });
  if (!merchant) { console.log(`  ✗ Merchant ${merchantEmail} not found`); return; }
  
  const catId = (await prisma.deviceCategory.findFirst({ where: { slug: "smartphone" } }))!.id;
  let count = 0;
  
  for (const svc of services) {
    const model = await prisma.deviceModel.findFirst({
      where: { name: svc.modelName, brand: { categoryId: catId } },
    });
    if (!model) { console.log(`  ✗ Model not found: ${svc.modelName}`); continue; }
    
    const rt = await prisma.repairType.findFirst({ where: { categoryId: catId, nameEn: svc.repairTypeEn } });
    if (!rt) { console.log(`  ✗ Repair type not found: ${svc.repairTypeEn}`); continue; }
    
    const repairService = await prisma.repairService.findFirst({
      where: { deviceModelId: model.id, repairTypeId: rt.id },
    });
    if (!repairService) { console.log(`  ✗ RepairService not found: ${svc.modelName} + ${svc.repairTypeEn}`); continue; }
    
    await prisma.merchantService.upsert({
      where: { merchantId_repairServiceId: { merchantId: merchant.id, repairServiceId: repairService.id } },
      update: { price: svc.price },
      create: { merchantId: merchant.id, repairServiceId: repairService.id, price: svc.price },
    });
    count++;
  }
  console.log(`  ✓ ${merchant.name}: ${count} services added`);
}

async function main() {
  console.log("🌱 Patching merchant services...");
  
  await addMerchantServices("rathmines@ierepair.ie", [
    { modelName: "Galaxy S23",      repairTypeEn: "Screen Replacement",  price: 139 },
    { modelName: "Galaxy S23",      repairTypeEn: "Battery Replacement", price: 65  },
    { modelName: "Galaxy S23 Ultra",repairTypeEn: "Screen Replacement",  price: 249 },
    { modelName: "Galaxy S22",      repairTypeEn: "Screen Replacement",  price: 119 },
    { modelName: "Galaxy S22",      repairTypeEn: "Battery Replacement", price: 59  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Screen Replacement",  price: 89  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Battery Replacement", price: 49  },
    { modelName: "iPhone 13",       repairTypeEn: "Screen Replacement",  price: 109 },
    { modelName: "iPhone 13",       repairTypeEn: "Battery Replacement", price: 59  },
    { modelName: "iPhone 12",       repairTypeEn: "Screen Replacement",  price: 89  },
    { modelName: "iPhone 12",       repairTypeEn: "Battery Replacement", price: 49  },
    { modelName: "Galaxy S23",      repairTypeEn: "Water Damage Repair", price: 109 },
    { modelName: "Galaxy S22",      repairTypeEn: "Charging Port Repair",price: 55  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Charging Port Repair",price: 55  },
  ]);

  await addMerchantServices("swords@ierepair.ie", [
    { modelName: "iPhone 12",       repairTypeEn: "Screen Replacement",  price: 85  },
    { modelName: "iPhone 12",       repairTypeEn: "Battery Replacement", price: 45  },
    { modelName: "iPhone 11",       repairTypeEn: "Screen Replacement",  price: 75  },
    { modelName: "iPhone 11",       repairTypeEn: "Battery Replacement", price: 45  },
    { modelName: "iPhone 11",       repairTypeEn: "Charging Port Repair",price: 45  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Screen Replacement",  price: 79  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Battery Replacement", price: 45  },
    { modelName: "Galaxy A54 5G",   repairTypeEn: "Charging Port Repair",price: 40  },
    { modelName: "Pixel 7",         repairTypeEn: "Screen Replacement",  price: 109 },
    { modelName: "Pixel 7",         repairTypeEn: "Battery Replacement", price: 55  },
    { modelName: "iPhone 13",       repairTypeEn: "Battery Replacement", price: 55  },
    { modelName: "iPhone 12",       repairTypeEn: "Water Damage Repair", price: 89  },
  ]);

  // Add bookings for Rathmines and Swords
  async function findSvc(modelName: string, repairTypeEn: string) {
    const catId = (await prisma.deviceCategory.findFirst({ where: { slug: "smartphone" } }))!.id;
    const model = await prisma.deviceModel.findFirst({ where: { name: modelName, brand: { categoryId: catId } } });
    if (!model) return null;
    const rt = await prisma.repairType.findFirst({ where: { categoryId: catId, nameEn: repairTypeEn } });
    if (!rt) return null;
    return prisma.repairService.findFirst({ where: { deviceModelId: model.id, repairTypeId: rt.id } });
  }

  const rathminesMerchant = await prisma.merchant.findUnique({ where: { email: "rathmines@ierepair.ie" } });
  const swordsMerchant = await prisma.merchant.findUnique({ where: { email: "swords@ierepair.ie" } });

  const gs23Screen  = await findSvc("Galaxy S23", "Screen Replacement");
  const gs23Battery = await findSvc("Galaxy S23", "Battery Replacement");
  const i12Screen   = await findSvc("iPhone 12",  "Screen Replacement");
  const i11Battery  = await findSvc("iPhone 11",  "Battery Replacement");
  const ga54Screen  = await findSvc("Galaxy A54 5G", "Screen Replacement");

  const now = new Date();
  const dt = (offsetDays: number, hour = 10) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  const bookings = [
    { orderNumber: "RB-DEMO-0005", merchantId: rathminesMerchant?.id, repairServiceId: gs23Screen?.id,
      status: "pending_confirm", userName: "Fionnuala Brady", userPhone: "+353 87 222 3344",
      userEmail: "fionnuala@example.com", appointmentTime: dt(2, 11), quotedPrice: 139 },
    { orderNumber: "RB-DEMO-0006", merchantId: rathminesMerchant?.id, repairServiceId: gs23Battery?.id,
      status: "confirmed", userName: "Darragh Quinn", userPhone: "+353 86 333 4455",
      appointmentTime: dt(3, 14), quotedPrice: 65 },
    { orderNumber: "RB-DEMO-0007", merchantId: rathminesMerchant?.id, repairServiceId: gs23Screen?.id,
      status: "completed", userName: "Niamh Ryan", userPhone: "+353 85 111 9988",
      userEmail: "niamh@example.com", appointmentTime: dt(-5, 10), quotedPrice: 139, actualPrice: 139 },
    { orderNumber: "RB-DEMO-0008", merchantId: swordsMerchant?.id, repairServiceId: i12Screen?.id,
      status: "pending_confirm", userName: "Conor Fitzgerald", userPhone: "+353 83 777 8899",
      userEmail: "conor@example.com", appointmentTime: dt(1, 13), quotedPrice: 85 },
    { orderNumber: "RB-DEMO-0009", merchantId: swordsMerchant?.id, repairServiceId: i11Battery?.id,
      status: "in_progress", userName: "Roisín Gallagher", userPhone: "+353 87 555 6677",
      appointmentTime: dt(0, 10), quotedPrice: 45 },
    { orderNumber: "RB-DEMO-0010", merchantId: swordsMerchant?.id, repairServiceId: ga54Screen?.id,
      status: "completed", userName: "Seán McCarthy", userPhone: "+353 86 666 7788",
      appointmentTime: dt(-3, 14), quotedPrice: 79, actualPrice: 79 },
  ].filter(b => b.merchantId && b.repairServiceId);

  let bookingCount = 0;
  for (const b of bookings) {
    await prisma.repairBooking.upsert({
      where: { orderNumber: b.orderNumber },
      update: {},
      create: b as any,
    });
    bookingCount++;
  }
  console.log(`  ✓ ${bookingCount} demo bookings added for Rathmines & Swords`);
  console.log("✅ Patch complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());
