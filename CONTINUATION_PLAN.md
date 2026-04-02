# IERepair Development Continuation Plan / 开发续接计划
# For Any AI Coder (Cursor / Claude Code / Copilot / etc.)

> **本文档是继续开发的唯一参考依据。**
> Read `PRD.md` for full product spec. Read `DEVELOPMENT_GUIDE.md` for tech stack and architecture.

---

## 0. 项目状态 / Project Status

| 阶段 | 状态 | 说明 |
|------|------|------|
| **架构决策** | ✅ 确定 | Next.js 15 + Drizzle + PostGIS + GCS + GCP |
| **产品文档** | ✅ 完成 | PRD.md v2.0，docs/ 目录 8 篇文档 |
| **旧代码（React+Vite+Express+Prisma）** | ⚠️ 参考用 | `server/` 和 `src/` 可参考业务逻辑，需迁移到新架构 |
| **新代码（Next.js）** | 🔴 待开始 | 需从头按新架构搭建 |

### 已确认的核心决策（不可更改）

| 决策项 | 确认值 |
|--------|--------|
| 平台名 | IERepair |
| 商业模式 | B2B2C SaaS（供应商→平台母库→门店→用户） |
| 前端框架 | Next.js 15 App Router + Tailwind CSS + shadcn/ui |
| ORM | Drizzle ORM |
| 数据库 | PostgreSQL 16 + PostGIS（GCP Cloud SQL） |
| 地理位置 | PostGIS + Google Geocoding API（Eircode → 坐标）+ Redis 缓存 |
| 文件存储 | Google Cloud Storage (GCS) |
| 部署 | GCP Cloud Run |
| 短信 | Twilio |
| 配件佣金 | **0%**（平台托管，月底净额结算给门店） |
| 维修服务佣金 | **8%** 默认全局，可按门店/区域/时间差异化 |
| 保修机制 | **会员套餐制**（碎屏保€29.9/Plus€49.9/全保€99.9），Phase 2 上线 |
| 定金机制 | 服务价格 20%，爽约不退 |
| MVP 规模 | **3 家自有门店** |
| 供应商角色 | 存在（独立后台），MVP 阶段由 HQ 手动维护产品库 |
| 品类管控 | 白名单制，门店不可添加母库以外的商品 |

---

## 1. 旧代码参考指南 / Legacy Code Reference

旧代码在以下目录，**不要直接使用，仅供参考业务逻辑**：

### 可参考的业务逻辑

| 旧文件 | 可参考内容 | 迁移目标 |
|--------|-----------|---------|
| `server/src/services/booking.service.js` | 预约创建、状态流转、QR 生成 | `lib/services/booking.ts` |
| `server/src/services/commission.service.js` | 佣金规则解析、优先级逻辑 | `lib/services/commission.ts` |
| `server/src/services/stripe.service.js` | Stripe Checkout Session 创建、退款 | `lib/stripe.ts` |
| `server/prisma/schema.prisma` | 18 个数据模型参考 | `lib/db/schema/` (Drizzle) |
| `src/pages/customer/` | 用户端 UI 布局和交互逻辑 | `app/(consumer)/` |
| `src/pages/merchant/` | 商家端 UI 布局和交互逻辑 | `app/merchant/` |
| `src/pages/hq/` | 管理后台 UI 布局和交互逻辑 | `app/admin/` |

### 需要丢弃的部分
- `server/src/utils/geo.js` — Haversine 算法，换 PostGIS
- `server/src/config/database.js` — Prisma client，换 Drizzle
- `src/api/client.js` — Axios 封装，换 Next.js fetch/Route Handlers
- `src/context/AuthContext.jsx` — 自定义 Auth context，换 NextAuth.js
- `src/styles/brand-design.css` — 可参考色彩变量，移植到 Tailwind config

---

## 2. 下一步开发任务 / Next Development Tasks

### 第一批（必须先做）

#### Task 1: 搭建 Next.js 项目骨架
```bash
npx create-next-app@latest ierepair --typescript --tailwind --app
cd ierepair
# 安装依赖
npm install drizzle-orm @vercel/postgres postgres @auth/drizzle-adapter
npm install next-auth@beta
npm install stripe @stripe/stripe-js
npm install twilio
npm install @google-cloud/storage
npm install drizzle-kit --save-dev
npm install shadcn/ui  # 按 shadcn 官方文档初始化
```

#### Task 2: Drizzle Schema + PostGIS 建表
参考 `PRD.md` Section 4 的 SQL DDL，创建以下 Drizzle schema 文件：
- `lib/db/schema/users.ts`
- `lib/db/schema/merchants.ts`（含 PostGIS `location GEOGRAPHY(POINT, 4326)`）
- `lib/db/schema/products.ts`（products + product_categories + brands）
- `lib/db/schema/repair-services.ts`（repair_services + merchant_services）
- `lib/db/schema/merchant-products.ts`（merchant_products）
- `lib/db/schema/bookings.ts`（repair_bookings）
- `lib/db/schema/commission.ts`（commission_rules + commission_ledger）
- `lib/db/schema/memberships.ts`（membership_plans + user_memberships — Phase 2）
- `lib/db/schema/admin.ts`（admin_users）

**建表命令：**
```bash
npx drizzle-kit push    # 推送到 Cloud SQL
```

#### Task 3: Eircode 地理位置模块
`lib/geo.ts` — 参考 `DEVELOPMENT_GUIDE.md` Section 5 的代码模板

#### Task 4: 公开 API — 搜索功能
- `app/api/v1/public/search/products/route.ts`
- `app/api/v1/public/search/merchants/route.ts`

#### Task 5: 用户端首页 + 搜索结果页
- `app/(consumer)/page.tsx` — 搜索框 + 品类入口
- `app/(consumer)/search/page.tsx` — 商品列表 + 门店比价

### 第二批

#### Task 6: 商品详情 + 门店详情页
- `app/(consumer)/products/[id]/page.tsx`
- `app/(consumer)/stores/[id]/page.tsx`

#### Task 7: OTP 登录
- `lib/sms.ts` — Twilio 封装
- `app/api/v1/auth/send-otp/route.ts`
- `app/api/v1/auth/verify-otp/route.ts`
- `app/(auth)/auth/login/page.tsx`

#### Task 8: 维修预约流程
- `app/(consumer)/repair/page.tsx` — 选机型→选故障→选门店
- `app/(consumer)/repair/book/page.tsx` — 选时间段→提交→Stripe 定金
- `app/api/v1/user/repair-bookings/route.ts` — 创建预约 + Stripe Checkout

#### Task 9: 商家后台（MVP 最小集）
- `app/merchant/login/page.tsx`
- `app/merchant/products/catalog/page.tsx` — 浏览母库
- `app/merchant/products/page.tsx` — 已选品 + 调价
- `app/merchant/bookings/page.tsx` — 预约列表 + 核销
- `app/merchant/settings/page.tsx` — 门店信息 + 营业时间

### 第三批

#### Task 10: 管理后台（MVP 最小集）
- `app/admin/login/page.tsx`
- `app/admin/merchants/page.tsx` — 门店列表 + 创建账号
- `app/admin/products/page.tsx` — 产品母库管理

#### Task 11: SMS 通知集成
预约确认后发短信给用户和门店（`lib/sms.ts` Twilio 封装）

#### Task 12: Stripe Webhook
`app/api/webhooks/stripe/route.ts` — 确认定金支付，更新 booking status

#### Task 13: 种子数据
创建 `scripts/seed.ts` 写入：
- 1 个 admin 账号
- 3 家门店（含 Eircode 坐标）
- 品类（换屏、换电池等）
- 产品母库 50+ SKU（iPhone/Samsung 主流机型配件 + 维修服务）
- 每家门店选品 10+ 个，设置营业时间

---

## 3. 编码规范 / Coding Conventions

### Next.js App Router 规范

**Server Component（默认，无交互）：**
```typescript
// app/(consumer)/stores/[id]/page.tsx
import { db } from '@/lib/db';
import { merchants } from '@/lib/db/schema/merchants';
import { eq } from 'drizzle-orm';

export default async function StorePage({ params }: { params: { id: string } }) {
  const merchant = await db.query.merchants.findFirst({
    where: eq(merchants.id, params.id),
  });
  return <div>{merchant?.shopName}</div>;
}
```

**Client Component（含交互）：**
```typescript
'use client';
import { useState } from 'react';
// ...
```

**API Route Handler：**
```typescript
// app/api/v1/public/search/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eircode = searchParams.get('eircode');
  // ...
  return NextResponse.json({ success: true, data: [...] });
}
```

### API 响应格式（统一）
```typescript
// 成功
return NextResponse.json({ success: true, data: {...} });

// 列表
return NextResponse.json({ success: true, data: [...], total: N });

// 错误
return NextResponse.json({ success: false, error: 'message' }, { status: 400 });
```

### shadcn/ui 组件使用
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

### Tailwind 色彩 Token（在 tailwind.config.ts 中定义）
```typescript
colors: {
  brand: {
    bg:       '#0A0D11',
    card:     '#121418',
    green:    '#00D084',
    muted:    '#8E95A2',
    border:   'rgba(255,255,255,0.08)',
  }
}
```

---

## 4. 核心业务规则 / Business Rules Reference

| 规则 | 值 |
|------|-----|
| 维修定金 | 服务价格的 **20%** |
| 爽约政策 | 定金不退（平台自动没收） |
| 取消 >24h | 全额退款 |
| 取消 <24h | 不退款 |
| **配件订单佣金** | **0%**（平台托管，月底净额结算） |
| **维修服务佣金** | **8%**（默认全局） |
| 佣金优先级 | merchant > region > global（同级选 priority 最高） |
| 品类管控 | 白名单制，门店不可添加母库以外的商品 |
| 门店激活 | HQ 手动激活 |
| 预约提前天数 | 按门店配置，默认 14 天 |
| 时段时长 | 15/30/60 min，默认 30 min |
| 会员计划 | Phase 2（€29.9/€49.9/€99.9 年度套餐） |
| 供应商后台 | Phase 2（MVP 由 Admin 手动维护产品库） |
| MVP 目标 | **3 家自有门店**打通主流程 |

---

## 5. 旧系统迁移注意事项 / Migration Notes

1. **不要复制 `server/` 目录的任何文件**到新 Next.js 项目，只参考业务逻辑
2. **Prisma schema → Drizzle schema**：参考 `server/prisma/schema.prisma` 的字段定义，但用 Drizzle 语法重写
3. **Haversine → PostGIS**：删除 `server/src/utils/geo.js`，改用 PostGIS `ST_DWithin` + `ST_Distance`
4. **Axios API client → Route Handlers**：前端直接用 `fetch` 调用同项目的 API Routes
5. **JWT 手写 → NextAuth**：所有认证走 NextAuth.js v5

---

*文档版本：2.0 | 更新于：2026-04-02*
*状态：架构决策完成，Next.js 新项目待启动*
