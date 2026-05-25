import {
  pgTable, uuid, varchar, text, numeric, boolean, timestamp, integer, pgEnum, index,
} from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("product_type", ["part", "accessory", "service"]);
export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "pending_review"]);

export const brands = pgTable("brands", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      varchar("name", { length: 100 }).unique().notNull(),
  slug:      varchar("slug", { length: 100 }).unique().notNull(),
  logoUrl:   text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id:          uuid("id").primaryKey().defaultRandom(),
  name:        varchar("name", { length: 100 }).notNull(),
  slug:        varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  iconUrl:     text("icon_url"),
  parentId:    uuid("parent_id"),
  sortOrder:   integer("sort_order").default(0).notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id:           uuid("id").primaryKey().defaultRandom(),
  sku:          varchar("sku", { length: 100 }).unique().notNull(),
  name:         varchar("name", { length: 255 }).notNull(),
  slug:         varchar("slug", { length: 300 }).unique().notNull(),
  description:  text("description"),
  type:         productTypeEnum("type").notNull(),
  status:       productStatusEnum("status").default("active").notNull(),
  brandId:      uuid("brand_id").references(() => brands.id),
  categoryId:   uuid("category_id").references(() => categories.id),
  imageUrls:    text("image_urls").array(),
  basePrice:    numeric("base_price", { precision: 10, scale: 2 }),
  compatibility: text("compatibility"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_products_category").on(t.categoryId),
  index("idx_products_brand").on(t.brandId),
  index("idx_products_status").on(t.status),
  index("idx_products_type").on(t.type),
]);

// Merchant's selected products from master catalog
export const merchantProducts = pgTable("merchant_products", {
  id:          uuid("id").primaryKey().defaultRandom(),
  merchantId:  uuid("merchant_id").notNull(),
  productId:   uuid("product_id").notNull().references(() => products.id),
  price:       numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock:       integer("stock").default(0).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_merchant_products_merchant").on(t.merchantId),
  index("idx_merchant_products_product").on(t.productId),
]);

export type Brand           = typeof brands.$inferSelect;
export type Category        = typeof categories.$inferSelect;
export type Product         = typeof products.$inferSelect;
export type MerchantProduct = typeof merchantProducts.$inferSelect;
