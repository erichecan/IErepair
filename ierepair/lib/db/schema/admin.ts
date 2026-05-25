import {
  pgTable, uuid, varchar, timestamp, pgEnum, boolean,
} from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", ["super_admin", "admin", "finance"]);

export const adminUsers = pgTable("admin_users", {
  id:           uuid("id").primaryKey().defaultRandom(),
  email:        varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name:         varchar("name", { length: 255 }).notNull(),
  role:         adminRoleEnum("role").default("admin").notNull(),
  isActive:     boolean("is_active").default(true).notNull(),
  lastLoginAt:  timestamp("last_login_at"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export type AdminUser    = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
