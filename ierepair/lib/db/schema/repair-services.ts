import {
  pgTable, uuid, varchar, text, numeric, boolean, timestamp, integer, index,
} from "drizzle-orm/pg-core";
import { categories } from "./products";

// Platform-level repair service templates
export const repairServices = pgTable("repair_services", {
  id:           uuid("id").primaryKey().defaultRandom(),
  name:         varchar("name", { length: 255 }).notNull(),
  slug:         varchar("slug", { length: 300 }).unique().notNull(),
  description:  text("description"),
  categoryId:   uuid("category_id").references(() => categories.id),
  deviceModel:  varchar("device_model", { length: 255 }), // e.g. "iPhone 15 Pro"
  deviceBrand:  varchar("device_brand", { length: 100 }), // e.g. "Apple"
  estimatedMin: integer("estimated_min").default(30), // minutes
  imageUrl:     text("image_url"),
  basePrice:    numeric("base_price", { precision: 10, scale: 2 }),
  deviceSlug:   varchar("device_slug", { length: 300 }),
  deviceType:   varchar("device_type", { length: 50 }),
  isActive:     boolean("is_active").default(true).notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_repair_services_category").on(t.categoryId),
  index("idx_repair_services_device").on(t.deviceBrand, t.deviceModel),
  index("idx_repair_services_device_slug").on(t.deviceSlug),
  index("idx_repair_services_device_type").on(t.deviceType),
]);

// Merchant's offered repair services with their own pricing
export const merchantServices = pgTable("merchant_services", {
  id:             uuid("id").primaryKey().defaultRandom(),
  merchantId:     uuid("merchant_id").notNull(),
  repairServiceId: uuid("repair_service_id").notNull().references(() => repairServices.id),
  price:          numeric("price", { precision: 10, scale: 2 }).notNull(),
  depositAmount:  numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(), // 20% of price
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
