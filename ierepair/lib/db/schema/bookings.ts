import {
  pgTable, uuid, varchar, text, numeric, timestamp, pgEnum, index, boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { merchants } from "./merchants";
import { merchantServices } from "./repair-services";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",       // Created, awaiting merchant acceptance
  "confirmed",     // Merchant accepted
  "checked_in",    // Customer arrived
  "completed",     // Repair done
  "cancelled",     // Cancelled by user or merchant
  "no_show",       // Customer did not show up
]);

export const repairBookings = pgTable("repair_bookings", {
  id:               uuid("id").primaryKey().defaultRandom(),
  bookingRef:       varchar("booking_ref", { length: 20 }).unique().notNull(),
  userId:           uuid("user_id").references(() => users.id),
  merchantId:       uuid("merchant_id").notNull().references(() => merchants.id),
  merchantServiceId: uuid("merchant_service_id").notNull().references(() => merchantServices.id),
  status:           bookingStatusEnum("status").default("pending").notNull(),
  scheduledAt:      timestamp("scheduled_at").notNull(),
  servicePrice:     numeric("service_price", { precision: 10, scale: 2 }).notNull(),
  depositAmount:    numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  depositPaid:      boolean("deposit_paid").default(false).notNull(),
  stripeSessionId:  varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  qrCode:           text("qr_code"),
  customerNotes:    text("customer_notes"),
  merchantNotes:    text("merchant_notes"),
  cancelledAt:      timestamp("cancelled_at"),
  cancelledBy:      varchar("cancelled_by", { length: 20 }), // "user" | "merchant" | "system"
  refundStatus:     varchar("refund_status", { length: 20 }),
  createdAt:        timestamp("created_at").defaultNow().notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("idx_bookings_user").on(t.userId),
  index("idx_bookings_merchant").on(t.merchantId),
  index("idx_bookings_status").on(t.status),
  index("idx_bookings_scheduled").on(t.scheduledAt),
  index("idx_bookings_ref").on(t.bookingRef),
]);

export type RepairBooking    = typeof repairBookings.$inferSelect;
export type NewRepairBooking = typeof repairBookings.$inferInsert;
