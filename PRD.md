# Ireland Repair Alliance (IRA) — Product Requirements Document
# 爱尔兰维修联盟 (IRA) — 产品需求文档

---

## 1. Product Overview / 产品概述

### 1.1 What is IRA? / IRA 是什么？
A **Fresha-style multi-tenant SaaS platform** for the mobile repair industry across Ireland. Each repair shop gets its own branded micro-site for customers to browse services, compare prices, and book repairs online with deposit payment. The platform provides a unified warranty network across all member shops.

一个面向全爱尔兰手机维修行业的 **Fresha 模式多租户 SaaS 平台**。每家维修店拥有自己的品牌微站，客户可以浏览服务、比较价格、在线预约维修并支付定金。平台提供覆盖所有成员店铺的统一保修网络。

### 1.2 Core Value Proposition / 核心价值主张
- **For Customers / 对客户:** Transparent pricing, online booking, deposit-secured appointments, 180-day all-island cross-shop warranty. / 透明定价、在线预约、定金锁定服务、180 天全岛跨店联保。
- **For Merchants / 对商户:** Zero-cost booking system, exposure to local customers, supply chain access, automated warranty settlement. / 零成本预约系统、本地客流曝光、供应链接入、自动化保修结算。
- **For HQ / 对总部:** Platform commission revenue, supply chain control, brand standardization across 3000+ shops. / 平台佣金收入、供应链掌控、3000+ 店铺品牌统一化。

### 1.3 Business Model (Fresha-style) / 商业模式（Fresha 模式）
- Platform is **free for merchants to join** (HQ manually activates accounts). / 商户**免费加入**平台（总部手动激活账号）。
- Revenue from **per-transaction commission** (0%–15%, configurable by time period / region / individual shop). / 收入来源：**按单抽佣**（0%–15%，可按时间段/区域/单店配置）。
- Customers pay a **deposit (20% of repair cost)** when booking; remainder paid at shop. / 客户预约时支付**定金（维修费的 20%）**，余款到店支付。
- No-show policy: **deposit is non-refundable** if customer doesn't show up. / 爽约政策：客户未到店，**定金不退**。

---

## 2. Tech Stack / 技术栈

| Layer / 层 | Technology / 技术 |
|-------|-----------|
| Frontend / 前端 | React 19 + Vite (existing / 现有) |
| Backend / 后端 | Node.js + Express |
| Database / 数据库 | PostgreSQL |
| ORM | Prisma |
| Auth / 认证 | JWT + bcrypt (merchant/HQ / 商户/总部), email/phone OTP (customers / 客户) |
| Payment / 支付 | Stripe (Checkout Sessions for deposits / 定金支付, Connect for merchant payouts / 商户分账) |
| Maps/LBS / 地图/定位 | Google Maps JavaScript API + Geocoding API |
| File Storage / 文件存储 | Google Cloud Storage (shop photos / 店铺照片, product images / 产品图片) |
| Deployment / 部署 | Google Cloud Platform (Cloud Run + Cloud SQL) |
| Realtime / 实时通信 | WebSocket (optional Phase 2 / 可选第二阶段 — order status updates / 订单状态更新) |

---

## 3. Architecture / 系统架构

### 3.1 Multi-Tenant Design / 多租户设计
This is a **single-database multi-tenant** system. All merchants share one PostgreSQL database. Data isolation is enforced by `merchant_id` foreign keys on all merchant-scoped tables. There is **no separate database or deployment per shop**.

这是一个**单数据库多租户**系统。所有商户共享一个 PostgreSQL 数据库。通过 `merchant_id` 外键在所有商户相关表上实现数据隔离。**不为每家店铺创建独立数据库或部署**。

### 3.2 Three-Tier Structure / 三端分离架构

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND / 前端 (React)                │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  C-End   │  │  Merchant-End │  │   HQ-End     │  │
│  │  客户端   │  │  商户端        │  │   总部端      │  │
│  │ /        │  │ /merchant/*   │  │ /hq/*        │  │
│  └──────────┘  └───────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────┘
                         │ REST API
┌────────────────────────┴────────────────────────────┐
│           BACKEND / 后端 (Node.js + Express)        │
│  /api/v1/client/*   /api/v1/merchant/*  /api/v1/hq/*│
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│          PostgreSQL (Single Database / 单数据库)     │
│     All tenants, isolated by merchant_id            │
│     所有租户，通过 merchant_id 隔离                    │
└─────────────────────────────────────────────────────┘
```

### 3.3 URL Routing Design / URL 路由设计

```
C-End (Customer-facing / 客户端):
  /                              → Homepage / 首页 (search + nearby shops / 搜索 + 附近店铺)
  /search?device=X&issue=Y&lat=&lng= → Search results / 搜索结果 / shop comparison / 店铺比价
  /shop/:slug                    → Shop micro-site / 店铺微站 (Fresha-style)
  /shop/:slug/book/:productId    → Booking flow / 预约流程 (select time → pay deposit / 选时间 → 付定金)
  /booking/:bookingId            → Booking confirmation + QR code / 预约确认 + 二维码
  /my/bookings                   → My booking history / 我的预约记录
  /my/warranties                 → My warranty wallet / 我的保修钱包
  /login                         → Customer login / 客户登录 (email/phone OTP)

Merchant-End / 商户端:
  /merchant/login                → Merchant login / 商户登录
  /merchant/dashboard            → Today's schedule, revenue summary / 今日日程、营收概览
  /merchant/calendar             → Weekly/daily calendar view / 周/日日历视图
  /merchant/pricing              → Browse master catalog, toggle products, set prices / 浏览母库、开关产品、设定价格
  /merchant/orders               → All orders / 所有订单 (pending / confirmed / completed)
  /merchant/scan                 → QR scan to check-in customer / 扫码核销
  /merchant/warranty             → Warranty claims & settlement pool / 保修索赔与结算池
  /merchant/settings             → Shop info, photos, business hours, time slots / 店铺信息、照片、营业时间、时段设置
  /merchant/settings/hours       → Business hours & booking slot configuration / 营业时间与预约时段配置

HQ-End / 总部端:
  /hq/login                      → HQ admin login / 总部管理员登录
  /hq/catalog                    → Master product catalog CRUD / 母产品库增删改查
  /hq/merchants                  → Merchant management / 商户管理 (activate/suspend/edit / 激活/暂停/编辑)
  /hq/commission                 → Commission rules engine / 佣金规则引擎
  /hq/finance                    → Deposit ledger, commission reports, settlement / 定金账本、佣金报表、结算
  /hq/analytics                  → Platform-wide dashboard / 全平台数据看板
```

---

## 4. Database Schema / 数据库结构

### 4.1 Core Tables / 核心表

```sql
-- ============================================================
-- USERS & AUTH / 用户与认证
-- ============================================================

CREATE TABLE customers (                           -- 客户表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(20) UNIQUE,
  name            VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255),          -- nullable if using OTP-only / 仅用OTP时可为空
  avatar_url      VARCHAR(500),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hq_admins (                           -- 总部管理员表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50) DEFAULT 'admin',  -- 'super_admin' | 'admin' | 'finance' / 超级管理员|管理员|财务
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MERCHANTS (Multi-tenant core) / 商户表（多租户核心）
-- ============================================================

CREATE TABLE merchants (                           -- 商户/加盟店表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL,   -- URL-friendly / URL友好格式: "oneills-dublin"
  name            VARCHAR(255) NOT NULL,           -- 店铺名称
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  address         TEXT NOT NULL,                   -- 详细地址
  city            VARCHAR(100) NOT NULL,           -- 城市
  county          VARCHAR(100) NOT NULL,           -- 郡
  eircode         VARCHAR(10),                     -- 爱尔兰邮编
  latitude        DECIMAL(10, 7) NOT NULL,         -- 纬度
  longitude       DECIMAL(10, 7) NOT NULL,         -- 经度
  logo_url        VARCHAR(500),                    -- 店铺logo
  cover_photo_url VARCHAR(500),                    -- 封面图
  description     TEXT,                            -- 店铺描述
  rating_avg      DECIMAL(2, 1) DEFAULT 0.0,       -- 平均评分
  rating_count    INTEGER DEFAULT 0,               -- 评价数量
  status          VARCHAR(20) DEFAULT 'pending',  -- 状态: 'pending'待审 | 'active'已激活 | 'suspended'已暂停
  activated_at    TIMESTAMPTZ,                     -- 激活时间
  activated_by    UUID REFERENCES hq_admins(id),   -- 激活操作人
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merchant_photos (                     -- 商户照片表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  url             VARCHAR(500) NOT NULL,
  sort_order      INTEGER DEFAULT 0,               -- 排序顺序
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSINESS HOURS & BOOKING SLOTS / 营业时间与预约时段
-- ============================================================

CREATE TABLE merchant_business_hours (             -- 商户营业时间表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL,              -- 星期几: 0=周日, 1=周一, ..., 6=周六
  open_time       TIME NOT NULL,                  -- 开门时间 e.g. '09:00'
  close_time      TIME NOT NULL,                  -- 关门时间 e.g. '18:00'
  is_closed       BOOLEAN DEFAULT FALSE,           -- 是否休息
  UNIQUE(merchant_id, day_of_week)
);

CREATE TABLE merchant_booking_slots (              -- 商户预约时段配置表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  slot_duration   INTEGER NOT NULL DEFAULT 30,     -- 每个时段时长(分钟): 15/30/60
  max_concurrent  INTEGER NOT NULL DEFAULT 3,      -- 每时段最大并发预约数
  buffer_minutes  INTEGER NOT NULL DEFAULT 0,      -- 时段间隔(分钟)
  advance_days    INTEGER NOT NULL DEFAULT 14       -- 可提前预约天数
);

-- ============================================================
-- MASTER PRODUCT CATALOG (HQ-managed) / 母产品库（总部管理）
-- ============================================================

CREATE TABLE master_categories (                   -- 维修分类表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,           -- 分类名: '换屏', '换电池'
  icon            VARCHAR(50),                     -- 图标 (emoji or icon class)
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE master_brands (                       -- 品牌表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,           -- 品牌名: 'Apple', 'Samsung', 'Google'
  logo_url        VARCHAR(500),
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE master_devices (                      -- 设备型号表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID NOT NULL REFERENCES master_brands(id),
  name            VARCHAR(255) NOT NULL,           -- 型号: 'iPhone 15 Pro', 'Galaxy S24 Ultra'
  image_url       VARCHAR(500),
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE master_products (                     -- 母产品/维修服务表（核心）
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id       UUID NOT NULL REFERENCES master_devices(id),
  category_id     UUID NOT NULL REFERENCES master_categories(id),
  sku             VARCHAR(50) UNIQUE NOT NULL,     -- 库存编码: 'APL-IP15P-SCR'
  name            VARCHAR(255) NOT NULL,           -- 服务名: 'iPhone 15 Pro 换屏'
  description     TEXT,                            -- 描述
  base_cost       DECIMAL(10, 2) NOT NULL,         -- 总部批发成本价
  suggested_price DECIMAL(10, 2) NOT NULL,         -- 建议零售价
  image_url       VARCHAR(500),
  estimated_time  INTEGER,                         -- 预计维修时间(分钟)
  warranty_days   INTEGER DEFAULT 180,             -- 保修天数
  is_active       BOOLEAN DEFAULT TRUE,            -- 是否上架
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MERCHANT-PRODUCT MAP (Multi-tenant pricing core)
-- 商户-产品映射表（多租户定价核心）
-- ============================================================

CREATE TABLE merchant_products (                   -- 商户产品表（中间表）
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES master_products(id),
  my_price        DECIMAL(10, 2) NOT NULL,         -- 本店价格
  is_active       BOOLEAN DEFAULT TRUE,            -- 本店是否开启该服务
  in_stock        BOOLEAN DEFAULT TRUE,            -- 配件是否有货
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, product_id)
);

-- ============================================================
-- BOOKINGS & PAYMENTS / 预约与支付
-- ============================================================

CREATE TABLE bookings (                            -- 预约/订单表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number  VARCHAR(20) UNIQUE NOT NULL,     -- 人类可读编号: 'IRA-20260330-XXXX'
  customer_id     UUID NOT NULL REFERENCES customers(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  merchant_product_id UUID NOT NULL REFERENCES merchant_products(id),

  -- Snapshot at booking time (prices can change later)
  -- 预约时快照（价格后续可能变动）
  service_name    VARCHAR(255) NOT NULL,           -- 服务名称快照
  service_price   DECIMAL(10, 2) NOT NULL,         -- 预约时的商户价格
  deposit_amount  DECIMAL(10, 2) NOT NULL,         -- 定金金额 (service_price 的 20%)
  remaining_amount DECIMAL(10, 2) NOT NULL,        -- 到店待付金额 (80%)

  -- Schedule / 日程
  booking_date    DATE NOT NULL,                   -- 预约日期
  booking_time    TIME NOT NULL,                   -- 预约时间
  estimated_duration INTEGER,                      -- 预计时长(分钟)

  -- Status / 状态
  status          VARCHAR(20) DEFAULT 'confirmed',
  -- 'confirmed'已确认 → 'checked_in'已签到 → 'in_progress'维修中 → 'completed'已完成
  -- 'confirmed'已确认 → 'no_show'爽约 (auto or manual / 自动或手动)
  -- 'confirmed'已确认 → 'cancelled_by_customer'客户取消 | 'cancelled_by_merchant'商户取消

  checked_in_at   TIMESTAMPTZ,                     -- 签到时间
  completed_at    TIMESTAMPTZ,                     -- 完成时间

  -- Customer info snapshot / 客户信息快照
  customer_name   VARCHAR(255) NOT NULL,
  customer_phone  VARCHAR(20) NOT NULL,
  customer_note   TEXT,                            -- 客户备注: "屏幕左上角有裂痕"

  -- QR code / 二维码
  qr_code         VARCHAR(255) NOT NULL,           -- 用于签到扫码的唯一令牌

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deposits (                            -- 定金记录表
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID NOT NULL REFERENCES bookings(id),
  amount              DECIMAL(10, 2) NOT NULL,     -- 定金金额
  stripe_payment_id   VARCHAR(255) NOT NULL,       -- Stripe PaymentIntent ID
  stripe_checkout_id  VARCHAR(255),                -- Stripe Checkout Session ID
  status              VARCHAR(20) DEFAULT 'paid',  -- 'paid'已付 | 'refunded'已退款 | 'forfeited'已没收
  refunded_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMISSION RULES ENGINE / 佣金规则引擎
-- ============================================================

CREATE TABLE commission_rules (                    -- 佣金规则表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,           -- 规则名: "默认费率", "都柏林夏季促销"
  rate            DECIMAL(4, 2) NOT NULL,          -- 费率: 0.00 到 15.00 (百分比)
  scope_type      VARCHAR(20) NOT NULL,            -- 作用域类型: 'global'全局 | 'region'区域 | 'merchant'单店
  scope_value     VARCHAR(255),                    -- 作用域值: NULL=全局, county=区域, merchant_id=单店
  start_date      DATE,                            -- 开始日期 (NULL=无限制)
  end_date        DATE,                            -- 结束日期 (NULL=无限制)
  priority        INTEGER DEFAULT 0,               -- 优先级 (数值越高优先级越高)
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES hq_admins(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Resolution logic / 解析逻辑: find all active rules matching (merchant_id, region, date).
-- 查找所有匹配(商户ID, 区域, 日期)的活跃规则。
-- Pick the one with highest priority. If tie, most specific scope wins (merchant > region > global).
-- 选优先级最高的。如平级，最具体的作用域优先（单店 > 区域 > 全局）。

CREATE TABLE commission_ledger (                   -- 佣金流水表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  rule_id         UUID REFERENCES commission_rules(id),
  service_price   DECIMAL(10, 2) NOT NULL,         -- 服务价格
  commission_rate DECIMAL(4, 2) NOT NULL,          -- 适用佣金费率
  commission_amount DECIMAL(10, 2) NOT NULL,       -- 佣金金额 = service_price * rate / 100
  status          VARCHAR(20) DEFAULT 'pending',   -- 'pending'待收 | 'collected'已收 | 'waived'已免除
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WARRANTY SYSTEM / 保修系统
-- ============================================================

CREATE TABLE warranties (                          -- 保修卡表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_number VARCHAR(30) UNIQUE NOT NULL,     -- 保修编号: 'IRA-W-20260330-XXXX'
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  original_merchant_id UUID NOT NULL REFERENCES merchants(id),  -- 原始维修店铺
  product_id      UUID NOT NULL REFERENCES master_products(id),

  -- Snapshot / 快照
  device_name     VARCHAR(255) NOT NULL,           -- 设备名称
  service_name    VARCHAR(255) NOT NULL,           -- 服务名称

  start_date      DATE NOT NULL,                   -- 保修起始日
  end_date        DATE NOT NULL,                   -- 保修截止日 (start_date + 180天)
  status          VARCHAR(20) DEFAULT 'active',    -- 'active'生效中 | 'claimed'已索赔 | 'expired'已过期 | 'void'已作废

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warranty_claims (                     -- 保修索赔表
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warranty_id           UUID NOT NULL REFERENCES warranties(id),
  claiming_merchant_id  UUID NOT NULL REFERENCES merchants(id),  -- 执行保修维修的店铺
  original_merchant_id  UUID NOT NULL REFERENCES merchants(id),  -- 原始维修店铺

  -- Settlement / 结算
  part_cost             DECIMAL(10, 2) NOT NULL,   -- 配件成本 (来自 master_products.base_cost)
  labor_subsidy         DECIMAL(10, 2) NOT NULL DEFAULT 30.00,  -- 劳务补贴 (固定€30)
  total_compensation    DECIMAL(10, 2) NOT NULL,   -- 总补偿 = part_cost + labor_subsidy

  status                VARCHAR(20) DEFAULT 'pending',  -- 'pending'待审 | 'approved'已批准 | 'settled'已结算 | 'rejected'已拒绝
  approved_by           UUID REFERENCES hq_admins(id),  -- 审批人
  settled_at            TIMESTAMPTZ,               -- 结算时间

  customer_note         TEXT,                      -- 客户描述
  merchant_note         TEXT,                      -- 商户备注
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS / 评价
-- ============================================================

CREATE TABLE reviews (                             -- 评价表
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- 1-5星评分
  comment         TEXT,                            -- 评价内容
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Key Indexes / 关键索引

```sql
CREATE INDEX idx_merchants_location ON merchants USING gist (
  point(longitude, latitude)
);                                                 -- 地理位置索引，加速附近店铺查询
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchant_products_merchant ON merchant_products(merchant_id);
CREATE INDEX idx_merchant_products_product ON merchant_products(product_id);
CREATE INDEX idx_bookings_merchant_date ON bookings(merchant_id, booking_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_warranties_customer ON warranties(customer_id);
CREATE INDEX idx_commission_rules_scope ON commission_rules(scope_type, scope_value);
```

---

## 5. API Endpoints / API 接口

### 5.1 Client API / 客户端 API (`/api/v1/client`)

```
AUTH / 认证:
  POST   /auth/send-otp          { email | phone }              -- 发送验证码
  POST   /auth/verify-otp        { email | phone, code } → { token, customer }  -- 验证码校验
  GET    /auth/me                → current customer profile     -- 获取当前客户信息

BROWSE / 浏览:
  GET    /brands                 → list all brands              -- 所有品牌列表
  GET    /brands/:id/devices     → list devices for brand       -- 品牌下的设备列表
  GET    /devices/:id/services   → list service categories for device  -- 设备可用的维修服务
  GET    /search                 → ?device_id=&category_id=&lat=&lng=&radius=20
                                    Returns: nearby shops with their prices for this service,
                                    sorted by distance. Each result includes:
                                    { shop, distance_km, price, rating, available_slots_today }
                                    -- 返回：附近店铺及其该服务的价格，按距离排序

SHOP / 店铺:
  GET    /shops/:slug            → shop detail (info, photos, hours, services with prices)  -- 店铺详情
  GET    /shops/:slug/services   → all active services with prices  -- 店铺所有在售服务
  GET    /shops/:slug/reviews    → paginated reviews            -- 分页评价
  GET    /shops/:slug/slots      → ?date=2026-03-31 → available time slots  -- 可用预约时段

BOOKING / 预约:
  POST   /bookings               { merchant_product_id, date, time, name, phone, note }
                                    → creates booking, returns Stripe Checkout URL
                                    -- 创建预约，返回 Stripe 支付页面链接
  GET    /bookings/:id           → booking detail + QR code     -- 预约详情 + 二维码
  POST   /bookings/:id/cancel    → cancel (deposit refund only if > 24h before)  -- 取消预约

PAYMENT WEBHOOK / 支付回调:
  POST   /webhooks/stripe        → Stripe webhook handler (confirm deposit payment)  -- 确认定金支付

WARRANTY / 保修:
  GET    /warranties             → customer's warranty cards    -- 客户的保修卡列表
  GET    /warranties/:id         → warranty detail              -- 保修详情
```

### 5.2 Merchant API / 商户端 API (`/api/v1/merchant`)

```
AUTH / 认证:
  POST   /auth/login             { email, password } → { token, merchant }  -- 商户登录
  GET    /auth/me                → current merchant profile     -- 获取当前商户信息

DASHBOARD / 仪表盘:
  GET    /dashboard/today        → today's bookings count, revenue, pending check-ins  -- 今日概览
  GET    /dashboard/stats        → weekly/monthly revenue, booking trends  -- 统计趋势

PRICING / 定价:
  GET    /catalog                → full master catalog with merchant's prices overlaid  -- 母库+本店价格
  POST   /catalog/sync           { product_id, my_price, is_active } → add/update product  -- 同步单个产品
  PATCH  /catalog/:merchantProductId  { my_price?, is_active?, in_stock? }  -- 更新产品设置
  POST   /catalog/bulk-sync      [{ product_id, my_price, is_active }, ...] → batch  -- 批量同步

ORDERS / 订单:
  GET    /bookings               → ?status=confirmed&date=2026-03-31 → paginated list  -- 预约列表
  GET    /bookings/:id           → booking detail               -- 预约详情
  POST   /bookings/:id/check-in  { qr_code } → verify QR, mark as checked_in  -- 扫码签到
  POST   /bookings/:id/start     → mark as in_progress         -- 开始维修
  POST   /bookings/:id/complete  → mark as completed, trigger warranty creation  -- 完成维修，自动创建保修卡
  POST   /bookings/:id/no-show   → mark as no_show, forfeit deposit  -- 标记爽约，没收定金

WARRANTY / 保修:
  GET    /warranty-claims        → claims where this shop is involved  -- 本店相关的保修索赔
  POST   /warranty-claims        { warranty_number, customer_note } → create claim  -- 发起跨店保修索赔

SETTINGS / 设置:
  GET    /settings               → shop profile                 -- 获取店铺信息
  PATCH  /settings               { name?, address?, description?, ... }  -- 更新店铺信息
  PUT    /settings/hours         [{ day_of_week, open_time, close_time, is_closed }]  -- 设置营业时间
  PATCH  /settings/slots         { slot_duration, max_concurrent, buffer_minutes, advance_days }  -- 设置时段
  POST   /settings/photos        → upload photo (multipart)     -- 上传照片
  DELETE /settings/photos/:id    → remove photo                 -- 删除照片
```

### 5.3 HQ API / 总部端 API (`/api/v1/hq`)

```
AUTH / 认证:
  POST   /auth/login             { email, password } → { token, admin }  -- 总部登录

CATALOG / 产品库:
  GET    /catalog                → full master catalog (paginated, searchable)  -- 母产品库列表
  POST   /catalog                { device_id, category_id, sku, name, base_cost, suggested_price, ... }  -- 新增产品
  PATCH  /catalog/:id            { base_cost?, suggested_price?, is_active?, ... }  -- 更新产品
  DELETE /catalog/:id            → soft delete                  -- 软删除

  GET    /brands                 → CRUD                         -- 品牌管理
  POST   /brands
  GET    /devices                → CRUD                         -- 设备型号管理
  POST   /devices
  GET    /categories             → CRUD                         -- 维修分类管理
  POST   /categories

MERCHANTS / 商户管理:
  GET    /merchants              → ?status=pending → paginated list  -- 商户列表（可按状态筛选）
  GET    /merchants/:id          → detail with stats            -- 商户详情+统计
  POST   /merchants/:id/activate → set status='active', record activated_by  -- 激活商户
  POST   /merchants/:id/suspend  → set status='suspended'      -- 暂停商户

COMMISSION / 佣金:
  GET    /commission/rules       → all rules                    -- 所有佣金规则
  POST   /commission/rules       { name, rate, scope_type, scope_value, start_date, end_date, priority }  -- 新建规则
  PATCH  /commission/rules/:id   → update                      -- 更新规则
  DELETE /commission/rules/:id   → deactivate                  -- 停用规则

FINANCE / 财务:
  GET    /finance/deposits       → ?from=&to= → deposit ledger  -- 定金流水
  GET    /finance/commissions    → ?from=&to= → commission ledger  -- 佣金流水
  GET    /finance/settlements    → warranty settlement ledger   -- 保修结算流水

WARRANTY / 保修:
  GET    /warranty-claims        → all claims platform-wide     -- 全平台保修索赔
  POST   /warranty-claims/:id/approve  -- 批准索赔
  POST   /warranty-claims/:id/reject   -- 拒绝索赔
  POST   /warranty-claims/:id/settle   → mark compensation as paid  -- 标记已结算
```

---

## 6. User Flows (Step-by-Step) / 用户流程（逐步详解）

### 6.1 Customer: Search & Book a Repair / 客户：搜索并预约维修

```
1. Customer opens irepair.ie
   客户打开 irepair.ie
2. Homepage shows: / 首页展示：
   - Search bar: "What needs fixing?" / 搜索栏："需要修什么？"
   - Brand icons (Apple, Samsung, Google, Huawei, ...) / 品牌图标
   - "Popular repairs near you" (if location granted) / "你附近的热门维修"（需定位授权）
3. Customer taps "Apple" → sees device list (iPhone 15 Pro, iPhone 14, ...)
   客户点击 "Apple" → 看到设备列表
4. Customer taps "iPhone 15 Pro" → sees service categories:
   客户点击 "iPhone 15 Pro" → 看到服务分类：
   - Screen Replacement (from €285) / 换屏（起价 €285）
   - Battery Replacement (from €79) / 换电池（起价 €79）
   - Charging Port (from €89) / 换充电口（起价 €89）
5. Customer taps "Screen Replacement"
   客户点击"换屏"
6. Browser requests location permission (Google Maps)
   浏览器请求定位权限
7. System calls GET /api/v1/client/search?device_id=X&category_id=Y&lat=53.35&lng=-6.26
   系统调用搜索接口
8. Results page shows shop cards sorted by distance:
   结果页按距离排序展示店铺卡片：
   ┌──────────────────────────────────────┐
   │ O'Neill's Repairs          €299.00  │
   │ ⭐ 4.8 (312 reviews)    1.2 km away │
   │ 12 O'Connell St, Dublin 1           │
   │ Next available: Today 14:30         │
   │ 最早可约：今天 14:30                   │
   │                        [Book Now →] │
   └──────────────────────────────────────┘
9. Customer taps "Book Now" → goes to /shop/oneills-dublin
   客户点击"立即预约" → 进入店铺微站
10. Shop micro-site shows: / 店铺微站展示：
    - Shop photos carousel / 店铺照片轮播
    - Business hours / 营业时间
    - All services with prices / 所有服务及价格
    - Reviews / 评价
11. Customer taps "Book" on "iPhone 15 Pro Screen - €299"
    客户在"iPhone 15 Pro 换屏 - €299"上点击"预约"
12. Booking page shows: / 预约页展示：
    - Calendar (next 14 days, greyed out closed days) / 日历（未来14天，休息日灰显）
    - Available time slots for selected day (30-min intervals) / 可选时段（30分钟一格）
    - Customer fills: Name, Phone, optional note / 填写：姓名、电话、备注（选填）
    - Summary / 费用摘要: Service €299 | Deposit (20%) €59.80 | Pay at shop €239.20
      服务费 €299 | 定金(20%) €59.80 | 到店付 €239.20
13. Customer taps "Pay Deposit & Confirm"
    客户点击"支付定金并确认"
14. Redirect to Stripe Checkout (€59.80)
    跳转至 Stripe 支付页面
15. After payment → redirect to /booking/IRA-20260330-XXXX
    支付完成 → 跳转到预约确认页
    - Shows: booking details, shop address on map, QR code
      展示：预约详情、地图上的店铺地址、二维码
    - QR code contains: booking_id + qr_code token
      二维码包含：预约ID + 验证令牌
16. Customer receives email/SMS confirmation
    客户收到邮件/短信确认
```

### 6.2 Customer: Check-in at Shop / 客户：到店签到

```
1. Customer arrives at shop, opens booking page on phone
   客户到店，在手机上打开预约页面
2. Shows QR code to merchant
   向商户出示二维码
3. Merchant scans QR → system marks booking as 'checked_in'
   商户扫码 → 系统标记为"已签到"
4. Merchant performs repair, marks as 'in_progress'
   商户开始维修，标记为"维修中"
5. Repair complete → merchant marks as 'completed'
   维修完成 → 商户标记为"已完成"
6. System auto-creates warranty record (180 days)
   系统自动生成保修记录（180天）
7. Customer pays remaining €239.20 at shop (cash/card — outside platform)
   客户到店支付余款 €239.20（现金/刷卡 — 平台外支付）
8. Customer receives warranty card in /my/warranties
   客户在"我的保修"中收到电子保修卡
```

### 6.3 Customer: No-Show / 客户：爽约

```
1. Booking time passes, customer doesn't arrive
   预约时间已过，客户未到店
2. Merchant taps "No Show" on dashboard (or auto after 30 min)
   商户在面板点击"标记爽约"（或30分钟后自动标记）
3. Deposit (€59.80) is forfeited — NOT refunded
   定金（€59.80）被没收 — 不退款
4. Deposit goes to: platform commission + merchant compensation
   定金分配：平台佣金 + 商户补偿
5. No warranty is issued
   不发放保修卡
```

### 6.4 Merchant: Set Up Shop / 商户：店铺入驻设置

```
1. Merchant applies via website (fills name, address, email, phone)
   商户通过网站申请（填写名称、地址、邮箱、电话）
2. Status = 'pending' → appears in HQ /hq/merchants?status=pending
   状态 = '待审核' → 出现在总部商户管理列表
3. HQ admin reviews and clicks "Activate"
   总部管理员审核并点击"激活"
4. Merchant receives email with login credentials
   商户收到包含登录凭据的邮件
5. Merchant logs in to /merchant/dashboard
   商户登录后台
6. First-time setup wizard: / 首次设置向导：
   a. Upload shop photos / 上传店铺照片
   b. Set business hours for each day of week / 设置每天营业时间
   c. Set booking slot duration (15/30/60 min) and max concurrent bookings / 设置时段时长和最大并发预约数
   d. Browse master catalog → toggle services ON, set custom prices / 浏览母库 → 开启服务、设定本店价格
7. Shop micro-site goes live at /shop/{slug}
   店铺微站上线
```

### 6.5 Merchant: Daily Operations / 商户：日常运营

```
1. Merchant opens /merchant/dashboard each morning
   商户每天早上打开仪表盘
2. Sees: today's bookings (timeline/list), pending check-ins
   看到：今日预约（时间线/列表）、待签到
3. Customer arrives → merchant scans QR code at /merchant/scan
   客户到店 → 商户扫码签到
4. Booking moves to 'checked_in' → 'in_progress' → 'completed'
   预约状态流转：已签到 → 维修中 → 已完成
5. End of day: reviews completed bookings, handles any no-shows
   一天结束：回顾已完成订单、处理爽约
```

### 6.6 Warranty Claim (Cross-Shop) / 跨店保修索赔

```
1. Customer's iPhone 15 screen (repaired at Shop A in Dublin) breaks again
   客户的 iPhone 15 屏幕（在都柏林 A 店修的）又坏了
2. Customer is now in Cork, visits Shop B
   客户现在在科克，去了 B 店
3. Customer shows warranty card (warranty_number)
   客户出示保修卡（保修编号）
4. Shop B staff enters warranty number at /merchant/warranty-claims
   B 店员工在保修索赔页输入保修编号
5. System verifies: warranty is active + within 180 days
   系统验证：保修有效 + 在180天内
6. Shop B creates claim → HQ approves
   B 店发起索赔 → 总部审批
7. Settlement: Shop A's balance is debited (base_cost + €30 labor subsidy)
   结算：从 A 店余额扣除（配件成本 + €30 劳务补贴）
8. Shop B receives compensation
   B 店收到补偿
```

### 6.7 HQ: Commission Configuration / 总部：佣金配置

```
Example commission setup: / 佣金配置示例：
1. Global default: 10% on all bookings / 全局默认：所有订单 10%
2. Dublin region promo: 5% for shops in Dublin (Mar–Jun 2026) / 都柏林区域促销：5%（2026年3-6月）
3. New shop incentive: 0% for "Western Repairs" first 3 months / 新店激励：前3个月 0%
4. Premium rate: 15% for shops that want "Featured" placement / 高级费率：15%（换取"推荐位"展示）

Resolution: When calculating commission for a booking:
解析逻辑：计算某笔预约的佣金时：
  → Find all active rules matching (merchant_id, merchant.county, current_date)
    查找所有匹配（商户ID、所在郡、当前日期）的活跃规则
  → Pick highest priority
    选优先级最高的
  → If tie: merchant-specific > region > global
    如平级：单店级 > 区域级 > 全局级
```

---

## 7. Page Specifications / 页面规格

### 7.1 C-End Pages / 客户端页面

#### Homepage `/` / 首页
- **Header:** IRA logo, "Find a Repair" tagline / 顶部：IRA logo，"Find a Repair" 标语
- **Search bar:** Full-width, placeholder "What needs fixing?" / 搜索栏：全宽，占位符"需要修什么？"
- **Brand grid:** 2x3 grid of brand icons (Apple, Samsung, Google, Huawei, Xiaomi, Other) / 品牌网格：2x3 品牌图标
- **Popular nearby:** 3 cards showing popular services at nearest shops (requires location) / 附近热门：3张最近店铺的热门服务卡片
- **Trust bar:** "3000+ shops | 180-day warranty | Transparent pricing" / 信任栏："3000+门店 | 180天保修 | 透明定价"
- **Footer:** About, Contact, Terms, Privacy / 页脚：关于、联系、条款、隐私

#### Search Results `/search` / 搜索结果页
- **Filter bar:** Sort by (Distance / Price / Rating), radius slider / 筛选栏：排序（距离/价格/评分）、距离滑块
- **Results list:** Shop cards with: / 结果列表：店铺卡片包含：
  - Shop name, rating (stars + count), distance / 店名、评分（星级+数量）、距离
  - Price for the searched service / 所搜服务的价格
  - Next available slot / 最早可约时段
  - "Book Now" button / "立即预约"按钮
- **Map toggle:** Switch between list view and map view (Google Maps with pins) / 地图切换：列表视图 ↔ 地图视图

#### Shop Micro-site `/shop/:slug` / 店铺微站
*This is the Fresha-equivalent shop page. / 这是类似 Fresha 的店铺页面。*
- **Hero:** Shop cover photo with logo overlay / 顶部大图：封面照片+logo叠加
- **Info bar:** Address, phone, rating, "Open Now" / "Closed" badge / 信息栏：地址、电话、评分、"营业中"/"已关门"
- **Tabs: / 标签页：**
  - **Services** (default): Grouped by category, each showing name + price + "Book" button / **服务**（默认）：按分类分组，每项显示名称+价格+"预约"按钮
  - **About:** Description, business hours table, shop photos gallery / **关于**：描述、营业时间表、照片
  - **Reviews:** Star breakdown + individual review cards / **评价**：星级分布+逐条评价
- **Sticky bottom bar:** "Book a Repair" CTA button / 底部固定栏："预约维修"按钮

#### Booking Flow `/shop/:slug/book/:productId` / 预约流程
- **Step 1 — Date / 第1步 — 选日期:** Calendar picker (next 14 days, closed days greyed) / 日历选择器（未来14天，休息日灰显）
- **Step 2 — Time / 第2步 — 选时间:** Available time slots as tappable pills / 可用时段以可点击胶囊展示
- **Step 3 — Details / 第3步 — 填信息:** Name, phone, note input fields / 姓名、电话、备注输入框
- **Step 4 — Summary / 第4步 — 确认:**
  ```
  iPhone 15 Pro Screen Replacement / iPhone 15 Pro 换屏
  at O'Neill's Repairs, Dublin / 在 O'Neill's Repairs, 都柏林
  Date: 31 Mar 2026, 14:30 / 日期：2026年3月31日 14:30

  Service total / 服务总价:     €299.00
  Deposit (20%) / 定金(20%):    €59.80  ← pay now / 现在支付
  Due at shop / 到店付:         €239.20
  ```
- **Button:** "Pay Deposit & Confirm" → redirects to Stripe / 按钮："支付定金并确认" → 跳转 Stripe

#### Booking Confirmation `/booking/:bookingId` / 预约确认页
- **Status badge:** "Confirmed" (green) / 状态徽章："已确认"（绿色）
- **QR code:** Large, centered (for merchant to scan) / 二维码：大号居中（供商户扫描）
- **Details:** Service, shop name + address + Google Maps embed, date/time / 详情：服务、店名+地址+地图嵌入、日期/时间
- **Actions:** "Cancel Booking", "Add to Calendar" / 操作："取消预约"、"添加到日历"

#### My Bookings `/my/bookings` / 我的预约
- **Tabs:** Upcoming | Past / 标签：即将到来 | 已完成
- **Cards:** Booking number, service name, shop, date, status badge / 卡片：预约编号、服务名、店铺、日期、状态

#### Warranty Wallet `/my/warranties` / 保修钱包
- **Cards styled as digital certificates: / 卡片样式为电子证书：**
  - Warranty number / 保修编号
  - Device + service name / 设备+服务名称
  - Original shop / 原始维修店铺
  - Valid until date / 有效期至
  - Status badge (Active / Expired / Claimed) / 状态（生效中/已过期/已索赔）
  - "Valid at any IRA member shop" note / "可在任意 IRA 成员店铺使用"提示

### 7.2 Merchant-End Pages / 商户端页面

#### Dashboard `/merchant/dashboard` / 仪表盘
- **Today's overview cards:** Bookings count, Revenue, Pending Check-ins, Completed / 今日概览卡片：预约数、营收、待签到、已完成
- **Today's timeline:** Chronological list of bookings with status indicators / 今日时间线：按时间排列的预约，带状态指示
- **Quick actions:** "Scan QR", "Mark No-Show" / 快速操作："扫码"、"标记爽约"

#### Pricing `/merchant/pricing` / 定价管理
- **Table columns:** #, Product Name (device + service), HQ Base Cost, Status (toggle), Your Price (editable input) / 表格列：#、产品名（设备+服务）、总部成本价、状态（开关）、本店价格（可编辑）
- **Search/filter bar:** By brand, category / 搜索/筛选：按品牌、分类
- **Bulk actions:** "Enable All Screen Repairs", "Set all prices to suggested" / 批量操作："启用所有换屏服务"、"全部设为建议价"
- **"Sync from HQ" button:** Refresh master catalog / "从总部同步"按钮：刷新母库

#### Calendar `/merchant/calendar` / 日历
- **Weekly view** (default) or daily view / **周视图**（默认）或日视图
- **Color-coded blocks:** Confirmed (blue), Checked-in (yellow), In-progress (orange), Completed (green) / 颜色编码：已确认(蓝)、已签到(黄)、维修中(橙)、已完成(绿)
- **Click block → booking detail sidebar** / 点击色块 → 侧边栏显示预约详情

#### Scan `/merchant/scan` / 扫码签到
- **Camera view** with QR scanner overlay / 摄像头视图 + 二维码扫描框
- **After scan:** Shows booking details → "Confirm Check-in" button / 扫码后：显示预约详情 → "确认签到"按钮

#### Settings `/merchant/settings` / 店铺设置
- **Shop info form:** Name, address, description, phone / 店铺信息表单：名称、地址、描述、电话
- **Photo upload:** Drag & drop, up to 10 photos, reorder / 照片上传：拖拽上传，最多10张，可排序
- **Business hours:** 7-row table (Mon–Sun), each with open/close time pickers + "Closed" toggle / 营业时间：7行表格（周一至周日），每行有开关门时间选择器+"休息"开关
- **Slot settings:** Duration dropdown (15/30/60), max concurrent input, buffer minutes, advance days / 时段设置：时长下拉(15/30/60)、最大并发数、缓冲分钟、可提前天数

### 7.3 HQ-End Pages / 总部端页面

#### Master Catalog `/hq/catalog` / 母产品库
- **Table:** SKU, Product Name, Device, Category, Base Cost, Suggested Price, Status, Actions / 表格：SKU、产品名、设备、分类、成本价、建议价、状态、操作
- **Add Product modal:** Form with all fields + image upload / 新增产品弹窗：所有字段表单+图片上传
- **Edit inline** or modal / 行内编辑或弹窗编辑

#### Merchants `/hq/merchants` / 商户管理
- **Tabs:** Pending | Active | Suspended / 标签：待审核 | 已激活 | 已暂停
- **Table:** Name, City/County, Email, Status, Rating, Joined date, Actions / 表格：名称、城市/郡、邮箱、状态、评分、加入日期、操作
- **Actions:** View Detail, Activate, Suspend / 操作：查看详情、激活、暂停
- **Detail page:** Full merchant info + their active products + booking stats / 详情页：完整商户信息+已开启的产品+预约统计

#### Commission Rules `/hq/commission` / 佣金规则
- **Rules list table:** Name, Rate%, Scope, Date Range, Priority, Status / 规则列表：名称、费率%、作用域、日期范围、优先级、状态
- **Add Rule modal: / 新增规则弹窗：**
  - Name / 名称
  - Rate (0–15% slider) / 费率（0-15% 滑块）
  - Scope type: Global / Region (county dropdown) / Merchant (merchant search) / 作用域类型：全局/区域(郡下拉)/单店(店铺搜索)
  - Date range (optional) / 日期范围（可选）
  - Priority (number) / 优先级（数字）

#### Finance `/hq/finance` / 财务
- **Tabs:** Deposits | Commissions | Warranty Settlements / 标签：定金 | 佣金 | 保修结算
- **Deposits:** Date, Booking#, Customer, Amount, Status (paid/refunded/forfeited) / 定金：日期、订单号、客户、金额、状态
- **Commissions:** Date, Booking#, Merchant, Service Price, Rate, Commission Amount / 佣金：日期、订单号、商户、服务价、费率、佣金额
- **Settlements:** Date, Claim#, Original Shop, Servicing Shop, Amount, Status / 结算：日期、索赔号、原始店、执行店、金额、状态
- **Summary cards:** Total deposits this month, Total commission earned, Outstanding settlements / 汇总卡片：本月定金总额、已赚佣金、待结算

---

## 8. Anti-Fraud: Preventing Off-Platform Transactions / 防飞单机制

The entire system is designed to make on-platform transactions more attractive than off-platform:
整个系统的设计让线上交易比线下私单更有吸引力：

1. **Deposit required for booking.** No walk-in bookings through the platform. Customers must pay 20% upfront. / **预约必须付定金。** 平台不支持 walk-in 预约，客户必须预付 20%。
2. **QR check-in mandatory.** Warranty is only issued for bookings that go through the full lifecycle: confirmed → checked_in → completed. / **二维码签到强制。** 只有经历完整生命周期的预约才发放保修卡。
3. **Warranty as incentive.** 180-day all-island warranty ONLY for on-platform bookings. If merchant takes payment off-platform, customer gets no warranty. Customer self-interest enforces compliance. / **保修作为激励。** 180天全岛联保仅限平台预约。商户私下收款则客户无保修。客户自身利益驱动合规。
4. **No warranty = customer complaint.** Customers who learn about the warranty will demand on-platform booking. / **无保修=客户投诉。** 了解保修政策的客户会主动要求走平台。
5. **Deposit bonus (Phase 2).** Online deposit of €X can be worth €X+5 at the shop (platform subsidizes to drive online bookings). / **定金膨胀（第二阶段）。** 线上定金 €X 到店可抵扣 €X+5（平台补贴以推动线上预约）。

---

## 9. MVP Scope Definition / MVP 范围定义

### In Scope (Phase 1 — Build Now) / 范围内（第一阶段 — 立即构建）

| Feature / 功能 | C-End / 客户端 | Merchant / 商户端 | HQ / 总部 |
|---------|-------|----------|----|
| Browse brands → devices → services / 浏览品牌→设备→服务 | Yes | — | — |
| Search nearby shops by service + location / 按服务+位置搜索附近店铺 | Yes | — | — |
| Shop micro-site (info, services, prices, reviews) / 店铺微站 | Yes | — | — |
| Book repair + pay deposit (Stripe) / 预约维修+付定金 | Yes | — | — |
| Booking confirmation + QR code / 预约确认+二维码 | Yes | — | — |
| View booking history / 查看预约记录 | Yes | — | — |
| Warranty wallet / 保修钱包 | Yes | — | — |
| Login (email OTP for customers) / 客户登录（邮箱验证码） | Yes | — | — |
| Login (email + password for merchants) / 商户登录（邮箱+密码） | — | Yes | — |
| Dashboard (today's bookings + stats) / 仪表盘 | — | Yes | — |
| Browse master catalog + set prices / 浏览母库+设定价格 | — | Yes | — |
| QR scan check-in / 扫码签到 | — | Yes | — |
| Order lifecycle management / 订单生命周期管理 | — | Yes | — |
| Shop settings (hours, photos, info) / 店铺设置 | — | Yes | — |
| Master catalog CRUD / 母产品库增删改查 | — | — | Yes |
| Merchant activation/suspension / 商户激活/暂停 | — | — | Yes |
| Commission rules engine / 佣金规则引擎 | — | — | Yes |
| Finance ledger (deposits, commissions) / 财务账本 | — | — | Yes |

### Out of Scope (Phase 2+) / 范围外（第二阶段+）

- Online parts purchasing / e-commerce store / 线上配件购买/电商
- Push notifications / SMS reminders / 推送通知/短信提醒
- In-app messaging (customer ↔ merchant) / 站内消息
- Merchant mobile app (native) / 商户原生移动应用
- Supply chain integration (upstream wholesaler API) / 供应链对接（上游批发商API）
- Deposit bonus/promotion system / 定金膨胀/促销系统
- Loyalty program / 会员积分
- Multi-language (Irish/Polish) / 多语言
- Advanced analytics / BI dashboard / 高级数据分析/BI看板
- Merchant self-registration (currently HQ-only activation) / 商户自助注册

---

## 10. Project Structure / 项目结构

```
IErepair/
├── client/                          # React frontend / React 前端
│   ├── src/
│   │   ├── App.jsx                  # Router setup / 路由配置
│   │   ├── api/                     # API client (axios instance) / API 客户端
│   │   ├── hooks/                   # Custom React hooks / 自定义 hooks
│   │   ├── context/                 # Auth context, Cart context / 认证上下文
│   │   ├── pages/
│   │   │   ├── customer/            # C-end pages / 客户端页面
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── SearchPage.jsx
│   │   │   │   ├── ShopPage.jsx
│   │   │   │   ├── BookingFlow.jsx
│   │   │   │   ├── BookingConfirmation.jsx
│   │   │   │   ├── MyBookings.jsx
│   │   │   │   ├── WarrantyWallet.jsx
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── merchant/            # Merchant-end pages / 商户端页面
│   │   │   │   ├── MerchantLogin.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Pricing.jsx
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── ScanCheckIn.jsx
│   │   │   │   ├── WarrantyClaims.jsx
│   │   │   │   └── Settings.jsx
│   │   │   └── hq/                  # HQ-end pages / 总部端页面
│   │   │       ├── HQLogin.jsx
│   │   │       ├── MasterCatalog.jsx
│   │   │       ├── MerchantManagement.jsx
│   │   │       ├── CommissionRules.jsx
│   │   │       └── Finance.jsx
│   │   ├── components/
│   │   │   ├── shared/              # Navbar, Footer, LoadingSpinner, etc. / 通用组件
│   │   │   ├── customer/            # ShopCard, ServiceCard, BookingCard, etc. / 客户端组件
│   │   │   ├── merchant/            # OrderRow, PricingRow, etc. / 商户端组件
│   │   │   └── hq/                  # DataTable, RuleEditor, etc. / 总部端组件
│   │   └── styles/
│   │       └── brand-design.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Node.js backend / Node.js 后端
│   ├── src/
│   │   ├── index.js                 # Express app entry point / Express 入口
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection (Prisma) / 数据库连接
│   │   │   ├── stripe.js            # Stripe config / Stripe 配置
│   │   │   └── google-maps.js       # Maps API config / 地图 API 配置
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification / JWT 验证
│   │   │   ├── role.js              # Role-based access / 基于角色的访问控制
│   │   │   └── validate.js          # Request validation / 请求校验
│   │   ├── routes/
│   │   │   ├── client/              # /api/v1/client/* / 客户端接口
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── browse.routes.js
│   │   │   │   ├── shop.routes.js
│   │   │   │   ├── booking.routes.js
│   │   │   │   └── warranty.routes.js
│   │   │   ├── merchant/            # /api/v1/merchant/* / 商户端接口
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── dashboard.routes.js
│   │   │   │   ├── catalog.routes.js
│   │   │   │   ├── booking.routes.js
│   │   │   │   ├── warranty.routes.js
│   │   │   │   └── settings.routes.js
│   │   │   └── hq/                  # /api/v1/hq/* / 总部端接口
│   │   │       ├── auth.routes.js
│   │   │       ├── catalog.routes.js
│   │   │       ├── merchant.routes.js
│   │   │       ├── commission.routes.js
│   │   │       └── finance.routes.js
│   │   ├── services/                # Business logic / 业务逻辑层
│   │   │   ├── booking.service.js
│   │   │   ├── commission.service.js
│   │   │   ├── warranty.service.js
│   │   │   └── stripe.service.js
│   │   └── utils/
│   │       ├── qr.js               # QR code generation / 二维码生成
│   │       └── geo.js              # Distance calculation / 距离计算
│   ├── prisma/
│   │   └── schema.prisma            # Database schema / 数据库模型
│   └── package.json
│
├── PRD.md                           # This document / 本文档
└── README.md
```

---

## 11. Key Business Rules Summary / 核心业务规则汇总

| Rule / 规则 | Value / 值 |
|------|-------|
| Deposit percentage / 定金比例 | 20% of service price / 服务价格的 20% |
| Warranty duration / 保修时长 | 180 days from repair completion / 维修完成后 180 天 |
| No-show deposit / 爽约定金 | Non-refundable (forfeited) / 不退（没收） |
| Cancellation refund / 取消退款 | Full refund if cancelled > 24 hours before; no refund within 24 hours / 提前24小时以上全退；24小时内不退 |
| Merchant activation / 商户激活 | HQ manual only / 仅总部手动 |
| Commission range / 佣金范围 | 0% – 15% |
| Commission resolution / 佣金优先级 | Highest priority rule wins; merchant-specific > region > global / 最高优先级生效；单店 > 区域 > 全局 |
| Warranty labor subsidy / 保修劳务补贴 | €30 fixed per cross-shop warranty claim / 每笔跨店保修索赔固定 €30 |
| Booking advance limit / 可提前预约天数 | Set per merchant (default 14 days) / 各店自定（默认14天） |
| Slot duration / 时段时长 | Set per merchant (15/30/60 min, default 30) / 各店自定（15/30/60分钟，默认30） |
| Max concurrent bookings / 最大并发预约 | Set per merchant (default 3) / 各店自定（默认3） |

---

## 12. Stripe Integration Details / Stripe 集成详情

### Deposit Flow / 定金支付流程
1. Customer confirms booking → backend creates Stripe Checkout Session / 客户确认预约 → 后端创建 Stripe Checkout Session
2. `line_items`: one item = deposit amount (20% of service price) / 一个商品 = 定金金额
3. `success_url`: `/booking/{bookingId}?payment=success`
4. `cancel_url`: `/shop/{slug}/book/{productId}?payment=cancelled`
5. Webhook `checkout.session.completed` → backend marks deposit as 'paid', booking as 'confirmed' / Webhook 回调 → 标记定金已付、预约已确认

### Refund Flow / 退款流程
- Customer cancels > 24h before → backend calls `stripe.refunds.create()` → deposit status = 'refunded' / 提前24h+取消 → 调用退款API → 状态改为"已退款"
- Customer no-show → deposit status = 'forfeited' (no Stripe refund) / 客户爽约 → 状态改为"已没收"（不退款）

### Commission Collection (Phase 1: Simple) / 佣金收取（第一阶段：简化版）
- Commission is calculated and recorded in `commission_ledger` when booking completes / 预约完成时计算并记录佣金
- Actual collection is manual (invoice to merchant monthly) / 实际收取为手动（每月向商户开发票）
- Phase 2: Stripe Connect for automatic split payments / 第二阶段：Stripe Connect 自动分账

---

## 13. Google Maps Integration / Google 地图集成

### Customer-side / 客户端
- **Location permission:** Request on search page, fallback to IP-based geolocation / **定位权限：** 搜索页请求授权，降级为 IP 定位
- **Search results map:** Google Maps JavaScript API with custom markers for each shop / **搜索结果地图：** Google Maps JS API + 自定义店铺标记
- **Shop detail page:** Embedded map showing shop location with directions link / **店铺详情页：** 嵌入地图 + 导航链接
- **Distance calculation:** Server-side using Haversine formula on PostgreSQL (no API call needed for sorting) / **距离计算：** 服务端使用 PostgreSQL 的 Haversine 公式（排序无需调用 API）

### Merchant-side / 商户端
- **Address geocoding:** When merchant sets up shop address, use Geocoding API to get lat/lng / **地址地理编码：** 商户设置地址时，调用 Geocoding API 获取经纬度
- **Stored in database:** lat/lng stored on merchants table for distance queries / **存入数据库：** 经纬度存储在 merchants 表中用于距离查询

---

*Document Version: 1.1 (Bilingual / 双语版)*
*Last Updated / 最后更新: 2026-03-30*
