# IERepair Development Guide — 开发指南
# For AI Coding Assistants (Cursor / Claude Code / Copilot)

> **写任何代码之前，请先阅读本文档。**
> **Read this document first before writing any code.**

---

## 0. 项目概要 / Project Summary

**IERepair** 是一个面向爱尔兰手机维修与配件销售行业的 **B2B2C SaaS 平台**。

- 供应商提供 SKU → 平台品类管控 → 加盟门店选品定价 → 终端用户搜索预约
- 技术栈：**Next.js 15 App Router + Tailwind CSS + shadcn/ui + Drizzle ORM + PostgreSQL + PostGIS**
- 部署：**GCP（Cloud Run + Cloud SQL）**，文件存储 **GCS**
- MVP 目标：**3 家自有门店**试点，打通"搜索→预约→核销"主流程

**Full PRD:** `PRD.md`（完整产品需求，含 DB schema + API 设计 + 业务规则）。

---

## 1. 当前项目状态 / Current State

> ⚠️ **重要**：现有代码基于 React 19 + Vite + Express + Prisma 构建，**需要迁移到 Next.js 15 + Drizzle** 的新架构。

### 已有但需迁移的代码：
- `server/prisma/schema.prisma` — 18 个 Prisma 模型（参考用，需转为 Drizzle schema）
- `server/src/routes/` — Express 路由（参考用，需改写为 Next.js Route Handlers）
- `server/src/services/` — 业务逻辑（参考用，可复用逻辑）
- `src/pages/` — React 页面组件（参考 UI 布局，需重构为 Next.js 页面）

### 正确的新架构方向：
- 前端：`app/` 目录（Next.js App Router）
- 后端：`app/api/v1/` 目录（Route Handlers，不再需要独立 Express 服务器）
- ORM：Drizzle（不再使用 Prisma）
- 地理位置：PostGIS + Google Geocoding（不再使用 Haversine 算法）

---

## 2. 技术栈 / Tech Stack

| 层次 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js App Router | 15.x |
| UI 框架 | Tailwind CSS + shadcn/ui | latest |
| 数据库 | PostgreSQL 16 + PostGIS | — |
| ORM | Drizzle ORM | latest |
| 缓存 | Redis (Upstash) | — |
| 认证 | NextAuth.js v5 | — |
| 支付 | Stripe + Stripe Connect | — |
| 短信 | Twilio | — |
| 地图/地理 | Google Maps Geocoding API + PostGIS | — |
| 文件存储 | Google Cloud Storage (GCS) | — |
| 部署 | GCP Cloud Run + Cloud SQL | — |

---

## 3. 新架构概览 / New Architecture

```
ierepair/                              ← Next.js 项目根目录
├── app/                               ← Next.js App Router
│   ├── (consumer)/                    ← 用户端（移动端优先）
│   │   ├── layout.tsx                 底部导航栏 layout
│   │   ├── page.tsx                   首页（搜索 + 品类入口）
│   │   ├── search/page.tsx            搜索结果
│   │   ├── products/[id]/page.tsx     商品详情
│   │   ├── stores/[id]/page.tsx       门店详情
│   │   ├── repair/page.tsx            维修预约入口
│   │   ├── repair/book/page.tsx       预约表单
│   │   └── account/page.tsx           个人中心
│   │
│   ├── (auth)/
│   │   └── auth/login/page.tsx        手机号 OTP 登录
│   │
│   ├── merchant/                      ← 商家后台（桌面侧边栏）
│   │   ├── layout.tsx                 侧边栏 layout（需登录）
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx         工作台
│   │   ├── products/page.tsx          已选品 + 调价
│   │   ├── products/catalog/page.tsx  浏览母库选品
│   │   ├── bookings/page.tsx          预约列表 + 核销
│   │   └── settings/page.tsx          门店信息 + 营业时间
│   │
│   ├── admin/                         ← 管理后台（桌面侧边栏）
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── merchants/page.tsx         门店管理
│   │   ├── products/page.tsx          产品母库
│   │   ├── categories/page.tsx        品类管理
│   │   ├── commission/page.tsx        佣金规则（Phase 2）
│   │   └── finance/page.tsx           财务报表（Phase 2）
│   │
│   └── api/                           ← 后端 API（Route Handlers）
│       ├── v1/
│       │   ├── public/
│       │   │   ├── search/products/route.ts
│       │   │   ├── search/merchants/route.ts
│       │   │   ├── products/[id]/route.ts
│       │   │   └── stores/[id]/route.ts
│       │   ├── auth/
│       │   │   ├── send-otp/route.ts
│       │   │   ├── verify-otp/route.ts
│       │   │   ├── merchant/login/route.ts
│       │   │   └── admin/login/route.ts
│       │   ├── user/
│       │   │   ├── me/route.ts
│       │   │   └── repair-bookings/
│       │   │       ├── route.ts           GET list / POST create
│       │   │       └── [id]/
│       │   │           ├── route.ts       GET detail
│       │   │           └── cancel/route.ts
│       │   ├── merchant/
│       │   │   ├── me/route.ts
│       │   │   ├── dashboard/route.ts
│       │   │   ├── products/route.ts
│       │   │   ├── products/catalog/route.ts
│       │   │   ├── products/[id]/route.ts
│       │   │   ├── bookings/route.ts
│       │   │   ├── bookings/[id]/route.ts
│       │   │   ├── bookings/[id]/accept/route.ts
│       │   │   ├── bookings/[id]/check-in/route.ts
│       │   │   ├── bookings/[id]/complete/route.ts
│       │   │   ├── bookings/[id]/no-show/route.ts
│       │   │   └── settings/route.ts
│       │   ├── admin/
│       │   │   ├── merchants/route.ts
│       │   │   ├── merchants/[id]/route.ts
│       │   │   ├── merchants/[id]/activate/route.ts
│       │   │   ├── products/route.ts
│       │   │   ├── products/[id]/route.ts
│       │   │   └── categories/route.ts
│       │   └── webhooks/stripe/route.ts
│       └── auth/[...nextauth]/route.ts    ← NextAuth handler
│
├── lib/
│   ├── db/
│   │   ├── index.ts               Drizzle 连接（Cloud SQL）
│   │   └── schema/
│   │       ├── users.ts
│   │       ├── merchants.ts
│   │       ├── products.ts
│   │       ├── repair-services.ts
│   │       ├── bookings.ts
│   │       ├── commission.ts
│   │       └── memberships.ts
│   ├── geo.ts                     Eircode → 坐标（Google Geocoding + Redis 缓存）
│   ├── sms.ts                     Twilio 短信封装
│   ├── storage.ts                 GCS 文件上传封装
│   ├── stripe.ts                  Stripe 实例 + 工具函数
│   └── auth.ts                    NextAuth 配置
│
├── components/
│   ├── consumer/                  用户端专用组件
│   ├── merchant/                  商家端专用组件
│   ├── admin/                     管理后台专用组件
│   └── ui/                        shadcn/ui 基础组件
│
├── .env.local                     本地环境变量
├── drizzle.config.ts              Drizzle 配置
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## 4. Drizzle Schema 示例

```typescript
// lib/db/schema/merchants.ts
import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { geometry } from 'drizzle-orm/pg-core'; // PostGIS 扩展

export const merchants = pgTable('merchants', {
  id:             uuid('id').primaryKey().defaultRandom(),
  slug:           varchar('slug', { length: 100 }).unique().notNull(),
  shopName:       varchar('shop_name', { length: 255 }).notNull(),
  email:          varchar('email', { length: 255 }).unique().notNull(),
  passwordHash:   varchar('password_hash', { length: 255 }).notNull(),
  eircode:        varchar('eircode', { length: 10 }),
  location:       geometry('location', { type: 'point', mode: 'xy', srid: 4326 }),
  status:         varchar('status', { length: 20 }).default('pending'),
  createdAt:      timestamp('created_at').defaultNow(),
}, (t) => ({
  locationIdx: index('idx_merchants_location').using('gist').on(t.location),
  statusIdx:   index('idx_merchants_status').on(t.status),
}));
```

---

## 5. 地理位置实现 / Geo Implementation

### Eircode 解析（`lib/geo.ts`）

```typescript
import { redis } from './redis';

export async function eircodeToCoords(eircode: string): Promise<{ lat: number; lng: number }> {
  const key = `eircode:${eircode.replace(/\s/g, '').toUpperCase()}`;

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached as string);

  const url = `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(eircode + ', Ireland')}` +
    `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const data = await fetch(url).then(r => r.json());
  const coords = data.results[0]?.geometry?.location;
  if (!coords) throw new Error(`Cannot resolve Eircode: ${eircode}`);

  await redis.setex(key, 60 * 60 * 24 * 30, JSON.stringify(coords)); // 缓存 30 天
  return coords;
}
```

### 附近门店查询（PostGIS）

```typescript
// lib/db/queries/merchants.ts
import { db } from '../index';
import { sql } from 'drizzle-orm';

export async function findNearbyMerchants(lat: number, lng: number, radiusKm = 20) {
  return db.execute(sql`
    SELECT id, shop_name, eircode, city,
      ST_Distance(location, ST_MakePoint(${lng}, ${lat})::GEOGRAPHY) / 1000 AS distance_km
    FROM merchants
    WHERE status = 'active'
      AND ST_DWithin(location, ST_MakePoint(${lng}, ${lat})::GEOGRAPHY, ${radiusKm * 1000})
    ORDER BY distance_km ASC
    LIMIT 20
  `);
}
```

---

## 6. 认证机制 / Auth

| 角色 | 认证方式 |
|------|---------|
| 终端用户（Consumer） | 手机号 OTP（Twilio SMS） via NextAuth |
| 商家（Merchant） | 邮箱 + 密码（bcrypt） via NextAuth Credentials |
| 供应商（Supplier） | 邮箱 + 密码（Phase 2） |
| 管理员（Admin） | 邮箱 + 密码（bcrypt） via NextAuth Credentials |

```typescript
// lib/auth.ts - NextAuth v5 配置示意
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'merchant',
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => { /* 验证商家账号 */ },
    }),
    Credentials({
      id: 'admin',
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => { /* 验证管理员 */ },
    }),
    Credentials({
      id: 'otp',
      credentials: { phone: {}, code: {} },
      authorize: async (credentials) => { /* 验证 OTP */ },
    }),
  ],
});
```

---

## 7. 开发任务优先级 / Development Priority

### 第一批（必须先做，是其他功能的基础）

1. **数据库建表**：创建 Drizzle schema，运行 `drizzle-kit push` 建表（含 PostGIS）
2. **Eircode 解析 + PostGIS 搜索**：`lib/geo.ts` + 附近门店查询
3. **产品母库 API**：`/api/v1/admin/products` + `/api/v1/public/search`
4. **用户端首页 + 搜索**：`app/(consumer)/page.tsx` + `search/page.tsx`

### 第二批（第一批完成后）

5. **商家后台**：登录 + 选品 + 调价（`app/merchant/`）
6. **门店详情页**：`app/(consumer)/stores/[id]/page.tsx`
7. **OTP 登录**：手机号 + Twilio
8. **维修预约流程**：用户端表单 + 商家端接单

### 第三批（收尾）

9. **SMS 通知**：Twilio 集成（预约确认，发用户+门店）
10. **管理后台**：创建门店 + 产品库管理
11. **营业时间 + 时段配置**
12. **联调测试**：跑通 PRD 三个验证场景

---

## 8. 核心业务规则 / Key Business Rules

| 规则 | 值 |
|------|-----|
| 维修定金 | 服务价格的 20% |
| 爽约 | 定金不退 |
| 取消 >24h | 全额退款 |
| 取消 <24h | 不退款 |
| **配件佣金** | **0%**（平台持有资金，月底净额结算） |
| **维修服务佣金** | **8%**（默认全局） |
| 佣金优先级 | merchant > region > global |
| 品类限制 | 白名单制 |
| MVP 规模 | 3 家门店 |

---

## 9. 环境变量 / Environment Variables

```bash
# .env.local

# Database (GCP Cloud SQL)
DATABASE_URL=postgresql://user:pass@/dbname?host=/cloudsql/project:region:instance

# Cache (Upstash Redis)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Google Maps (Eircode 解析)
GOOGLE_MAPS_API_KEY=...

# Google Cloud Storage
GCS_BUCKET_NAME=ierepair-uploads
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+353...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin 初始账号（仅开发用）
ADMIN_INIT_EMAIL=admin@ierepair.ie
ADMIN_INIT_PASSWORD=admin123
```

---

## 10. 常用命令 / Commands

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev          # Next.js dev server (port 3000)

# 数据库
npx drizzle-kit generate    # 生成迁移文件
npx drizzle-kit push        # 推送 schema 变更到数据库（开发用）
npx drizzle-kit studio      # 可视化数据库浏览器

# 构建
npm run build
npm run start

# 类型检查
npx tsc --noEmit
```

---

## 11. 设计规范 / Design System

使用 **Tailwind CSS + shadcn/ui**，移动端优先。

**色彩（保留现有品牌色）：**
```css
--bg-deep:      #0A0D11     /* 页面背景 */
--bg-card:      #121418     /* 卡片/侧边栏背景 */
--primary:      #00D084     /* 品牌绿色 accent */
--text-main:    #FFFFFF
--text-muted:   #8E95A2
--border-muted: rgba(255,255,255,0.08)
```

**字体：** Inter（正文）+ Outfit（标题）

**用户端：** 底部导航，最大宽度 390px，按钮最小 44×44px
**商家/管理后台：** 左侧固定侧边栏，桌面优先

---

*文档版本：2.0 | 更新于：2026-04-02*
*状态：架构重构阶段 — 从 React+Vite+Express 迁移至 Next.js 15*
