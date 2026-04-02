import {
  pgTable, uuid, varchar, numeric, timestamp, pgEnum, integer, index, text,
} from "drizzle-orm/pg-core";
import { repairBookings } from "./bookings";
import { merchants } from "./merchants";

export const commissionScopeEnum = pgEnum("commission_scope", [
  "global", "region", "merchant",
]);

export const commissionTypeEnum = pgEnum("commission_type", [
  "repair_service", "product",
]);

// Commission rules (priority: merchant > region > global)
export const commissionRules = pgTable("commission_rules", {
  id:         uuid("id").primaryKey().defaultRandom(),
  scope:      commissionScopeEnum("scope").notNull(),
  type:       commissionTypeEnum("type").notNull(),
  merchantId: uuid("merchant_id").references(() => merchants.id), // null for global/region
  region:     varchar("region", { length: 100 }),                 // null for global/merchant
  rate:       numeric("rate", { precision: 5, scale: 4 }).notNull(), // e.g. 0.08 = 8%
  priority:   integer("priority").default(0).notNull(),
  validFrom:  timestamp("valid_from"),
  validTo:    timestamp("valid_to"),
  createdAt:  timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_commission_scope").on(t.scope, t.type),
  index("idx_commission_merchant").on(t.merchantId),
]);

export const commissionLedger = pgTable("commission_ledger", {
  id:           uuid("id").primaryKey().defaultRandom(),
  bookingId:    uuid("booking_id").references(() => repairBookings.id),
  merchantId:   uuid("merchant_id").notNull().references(() => merchants.id),
  ruleId:       uuid("rule_id").references(() => commissionRules.id),
  grossAmount:  numeric("gross_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 4 }).notNull(),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).notNull(),
  netAmount:    numeric("net_amount", { precision: 10, scale: 2 }).notNull(),
  settledAt:    timestamp("settled_at"),
  notes:        text("notes"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("idx_ledger_merchant").on(t.merchantId),
  index("idx_ledger_settled").on(t.settledAt),
]);

export type CommissionRule   = typeof commissionRules.$inferSelect;
export type CommissionLedger = typeof commissionLedger.$inferSelect;
