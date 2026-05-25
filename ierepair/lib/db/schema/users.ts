import {
  pgTable, uuid, varchar, text, boolean, timestamp, pgEnum,
} from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);

export const users = pgTable("users", {
  id:          uuid("id").primaryKey().defaultRandom(),
  phone:       varchar("phone", { length: 20 }).unique().notNull(),
  name:        varchar("name", { length: 255 }),
  email:       varchar("email", { length: 255 }),
  avatarUrl:   text("avatar_url"),
  status:      userStatusEnum("status").default("active").notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id:        uuid("id").primaryKey().defaultRandom(),
  phone:     varchar("phone", { length: 20 }).notNull(),
  code:      varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used:      boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
