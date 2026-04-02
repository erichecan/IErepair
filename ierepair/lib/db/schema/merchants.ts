import {
  pgTable, uuid, varchar, text, numeric, boolean, timestamp, pgEnum, index, integer, jsonb,
} from "drizzle-orm/pg-core";
import { geometry } from "drizzle-orm/pg-core";

export const merchantStatusEnum = pgEnum("merchant_status", [
  "pending", "active", "suspended",
]);

export const merchants = pgTable("merchants", {
  id:            uuid("id").primaryKey().defaultRandom(),
  slug:          varchar("slug", { length: 100 }).unique().notNull(),
  shopName:      varchar("shop_name", { length: 255 }).notNull(),
  email:         varchar("email", { length: 255 }).unique().notNull(),
  passwordHash:  varchar("password_hash", { length: 255 }).notNull(),
  phone:         varchar("phone", { length: 20 }),
  description:   text("description"),
  address:       text("address"),
  city:          varchar("city", { length: 100 }),
  eircode:       varchar("eircode", { length: 10 }),
  location:      geometry("location", { type: "point", mode: "xy", srid: 4326 }),
  logoUrl:       text("logo_url"),
  coverUrl:      text("cover_url"),
  status:        merchantStatusEnum("status").default("pending").notNull(),
  rating:        numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount:   integer("review_count").default(0).notNull(),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  businessHours: jsonb("business_hours").$type<BusinessHours>(),
  slotDurationMin: integer("slot_duration_min").default(30).notNull(),
  maxAdvanceDays:  integer("max_advance_days").default(14).notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_merchants_location").using("gist").on(t.location),
  index("idx_merchants_status").on(t.status),
  index("idx_merchants_city").on(t.city),
]);

export type BusinessHours = {
  [day in "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"]: {
    open: boolean;
    from: string; // "09:00"
    to: string;   // "18:00"
  };
};

export type Merchant    = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
