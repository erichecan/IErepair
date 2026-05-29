# IERepair — Product Requirements Document
# IERepair 产品需求文档

> 版本：v2.0 | 最后更新：2026-04-02 | 语言：中英双语

---

## 1. 产品概述 / Product Overview

### 1.1 什么是 IERepair？/ What is IERepair?

**IERepair** 是面向爱尔兰全境手机维修与配件销售行业的 **B2B2C SaaS 平台**。

平台连接三类角色：
- **供应商（Supplier）**：提供手机配件 SKU 及库存
- **加盟门店（Merchant）**：从平台母库选品、自主定价、接受用户预约与订单
- **终端用户（Consumer）**：搜索附近门店、浏览商品、预约维修

**IERepair** is a **B2B2C SaaS platform** for Ireland's mobile repair and accessories market.

```
供应商 → 产品母库（平台管控） → 加盟门店 → 终端用户
Supplier → Product Library (HQ-managed) → Merchants → Consumers
```

### 1.2 核心价值主张 / Core Value Proposition

| 角色 | 价值 |
|------|------|
| **终端用户** | 透明定价、在线预约、Stripe 定金支付、维修会员保障 |
| **加盟门店** | 免费加入、聚合流量、供应链直通、数字化管理 |
| **供应商** | 接入全爱尔兰门店网络、统一订单管理 |
| **平台（HQ）** | 维修服务佣金、会员计划分润、供应链数据 |

### 1.3 商业模式 / Business Model

**B2B2C：平台方（HQ）→ 加盟门店（Merchant）→ 终端用户（Consumer）**

#### 收入来源

| 收入类型 | 规则 |
|----------|------|
| **维修服务佣金** | 用户在线预约维修，平台按服务价格抽成（建议 8%，可按门店/区域/时间差异化配置） |
| **配件销售** | **0% 平台佣金**。平台托管资金（Stripe），月底结算净额给门店（扣支付手续费）。配件引流是主要战略目的 |
| **维修会员计划** | 用户购买会员套餐，核销维修时门店获得维修成本补偿，平台保留剩余利润 |
| **未来可选** | 门店广告位排名、增值订阅（Phase 3+） |

#### 定金机制（维修预约专用）

- 用户预约维修时支付 **服务价格的 20%** 作为定金（Stripe Checkout）
- 余款 80% 到店支付
- **爽约政策**：未到店则定金不退，平台自动没收

#### 配件订单支付流

```
用户 Stripe 支付（如 €29.90）
  ↓
Stripe → 平台主账户（IERepair Ltd.）
  ↓
月底结算：门店应得 = 订单金额 - 支付手续费（~1.4% + €0.25）
  ↓
Stripe Connect 转账至门店 IBAN
```

### 1.4 品类管控白名单（严格执行）/ Category Whitelist

平台核心竞争力在于"品类纯洁性"。只聚焦手机相关品类。

**允许（白名单）：**
- 手机维修服务（换屏、换电池、主板维修等）
- 手机保护配件（手机壳、钢化膜等）
- 充电配件（充电器、数据线、充电宝等）
- 音频配件（耳机、蓝牙耳机等）
- 存储配件（内存卡等）
- 手机清洁工具

**禁止（黑名单）：**
- 无人机、电动滑板车、电动自行车
- 智能家居设备
- 与手机无关的电子产品、食品、服装

**执行机制：**
- 加盟商只能从平台审核过的产品母库中选品，无自行添加商品入口
- 平台管理员对供应商提交的新品进行品类审核，不合格直接拒绝

### 1.5 发展路径 / Roadmap

| 阶段 | 时间 | 目标 |
|------|------|------|
| **Phase 1 — MVP** | 0–3 个月 | 以客户自有 **3 家门店**为试点，打通核心流程（搜索→预约→核销） |
| **Phase 2 — 扩张** | 3–12 个月 | 向爱尔兰全境招募，上线支付结算、会员计划、SEO |
| **Phase 3 — 规模** | 1 年以上 | 覆盖 500–3000 家门店，供应商竞价，考虑英国市场 |

---

## 2. 技术栈 / Tech Stack

| 层次 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Next.js 15 App Router | SSR/SSG + API Routes 一体，SEO 友好 |
| **UI 组件** | Tailwind CSS + shadcn/ui | 移动端优先，开发速度快 |
| **数据库** | PostgreSQL 16 + **PostGIS** | 地理位置查询（Eircode → 坐标 → 附近门店） |
| **ORM** | Drizzle ORM | 轻量、类型安全，与 Next.js 配合好 |
| **缓存** | Redis (Upstash) | Serverless 友好；Eircode 坐标缓存（TTL 30天）、Session |
| **认证** | NextAuth.js v5 | 自定义 Phone OTP（消费者）+ 账号密码（商户/供应商/管理员）|
| **支付** | Stripe + Stripe Connect | EUR 支付；定金托管；多方分账 |
| **短信** | Twilio | 爱尔兰覆盖好，预约确认 OTP |
| **地图** | Google Maps Geocoding API（后端）+ Google Maps Static API（前端展示）| Eircode 解析 |
| **文件存储** | Google Cloud Storage (GCS) | 店铺照片、产品图片 |
| **部署** | Google Cloud Platform — Cloud Run + Cloud SQL | 容器化部署 |

### Eircode 地理位置方案

```typescript
// 后端：Eircode → 坐标（缓存优先）
async function eircodeToCoords(eircode: string) {
  const key = `eircode:${eircode.replace(/\s/g,'').toUpperCase()}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(eircode + ', Ireland')}` +
    `&key=${GOOGLE_MAPS_API_KEY}`
  );
  const coords = (await res.json()).results[0].geometry.location;
  await redis.setex(key, 60 * 60 * 24 * 30, JSON.stringify(coords));
  return coords;
}
```

```sql
-- PostGIS 附近门店查询
SELECT id, shop_name, eircode,
  ST_Distance(location, ST_MakePoint($1, $2)::GEOGRAPHY) / 1000 AS distance_km
FROM merchants
WHERE status = 'active'
  AND ST_DWithin(location, ST_MakePoint($1, $2)::GEOGRAPHY, $3 * 1000)
ORDER BY distance_km ASC LIMIT 20;
-- $1=lng, $2=lat, $3=radius_km
```

---

## 3. 系统架构 / Architecture

### 3.1 多端入口（同一 Next.js 项目）

```
app/
├── (consumer)/          # 用户端（移动端优先，响应式）
│   ├── page.tsx         # 首页（搜索 + 品类入口）
│   ├── search/          # 搜索结果（商品列表 + 门店比价）
│   ├── products/[id]/   # 商品详情
│   ├── stores/[id]/     # 门店详情（含维修服务、营业时间）
│   ├── repair/          # 维修预约入口
│   ├── repair/book/     # 预约表单（选机型→选故障→选门店时间段）
│   ├── cart/            # 购物车（Phase 2）
│   ├── checkout/        # 结算（Phase 2）
│   └── account/         # 个人中心（我的预约、会员权益）
│
├── merchant/            # 商家后台（桌面侧边栏布局）
│   ├── login/
│   ├── dashboard/       # 工作台（今日预约、营收）
│   ├── products/        # 已选品列表 + 调价
│   ├── products/catalog/# 浏览母库选品
│   ├── bookings/        # 维修预约列表 + 接受/核销
│   ├── orders/          # 商品订单（Phase 2）
│   └── settings/        # 门店信息 + 营业时间 + 时段配置
│
├── supplier/            # 供应商后台（Phase 2，MVP 由 HQ 手动维护产品库）
│   ├── login/
│   ├── products/        # 提交/管理 SKU
│   ├── inventory/       # 库存管理
│   └── orders/          # 接收门店订单发货
│
├── admin/               # 平台管理后台
│   ├── login/
│   ├── merchants/       # 门店列表 + 创建/激活/停用
│   ├── products/        # 产品母库管理（增删改、CSV 导入）
│   ├── categories/      # 品类管理（白名单）
│   ├── commission/      # 佣金规则引擎
│   ├── membership/      # 会员计划配置（Phase 2）
│   └── finance/         # 财务报表、结算审批
│
└── api/                 # Next.js Route Handlers
    └── v1/
        ├── public/      # 无需认证
        ├── auth/        # OTP + 登录
        ├── user/        # 消费者接口
        ├── merchant/    # 商家接口
        ├── supplier/    # 供应商接口
        ├── admin/       # 管理员接口
        └── webhooks/    # Stripe webhook
```

### 3.2 多租户设计

单数据库多租户，通过 `merchant_id` 外键隔离。所有门店共享一个 PostgreSQL 实例（Cloud SQL）。

### 3.3 移动端优先规范

- CSS 默认手机尺寸（≤390px），用 `md:` / `lg:` 向上扩展
- 用户端所有按钮最小点击区域 44×44px
- 关键交互（搜索、预约）不超过 3 步
- 底部导航栏固定（用户端）

---

## 4. 数据库设计 / Database Schema

### 4.1 MVP 核心表

```sql
-- ============================================================
-- 用户 / USERS
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           VARCHAR(20) UNIQUE,
  email           VARCHAR(255) UNIQUE,
  name            VARCHAR(255) NOT NULL,
  avatar_url      VARCHAR(500),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50) DEFAULT 'admin',  -- 'super_admin' | 'admin' | 'finance' | 'support'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 供应商 / SUPPLIERS（Phase 2，MVP 由 admin 手动维护产品库）
-- ============================================================

CREATE TABLE suppliers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  contact_name    VARCHAR(255),
  phone           VARCHAR(20),
  status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'active' | 'suspended'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 加盟门店 / MERCHANTS
-- ============================================================

CREATE TABLE merchants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(100) UNIQUE NOT NULL,
  shop_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255) NOT NULL,
  address_line1   TEXT NOT NULL,
  city            VARCHAR(100) NOT NULL,
  county          VARCHAR(100) NOT NULL,
  eircode         VARCHAR(10),
  location        GEOGRAPHY(POINT, 4326),          -- PostGIS 地理坐标
  logo_url        VARCHAR(500),
  cover_photo_url VARCHAR(500),
  description     TEXT,
  rating_avg      NUMERIC(2,1) DEFAULT 0.0,
  rating_count    INTEGER DEFAULT 0,
  status          VARCHAR(20) DEFAULT 'pending',   -- 'pending' | 'active' | 'suspended'
  activated_at    TIMESTAMPTZ,
  activated_by    UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_location ON merchants USING GIST (location);
CREATE INDEX idx_merchants_status ON merchants(status);

CREATE TABLE merchant_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  url             VARCHAR(500) NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE merchant_hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL,  -- 0=周日, 1=周一, ..., 6=周六
  open_time       TIME NOT NULL,
  close_time      TIME NOT NULL,
  is_closed       BOOLEAN DEFAULT FALSE,
  UNIQUE(merchant_id, day_of_week)
);

CREATE TABLE merchant_booking_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID UNIQUE NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  slot_duration   INTEGER DEFAULT 30,   -- 分钟: 15/30/60
  max_concurrent  INTEGER DEFAULT 3,
  buffer_minutes  INTEGER DEFAULT 0,
  advance_days    INTEGER DEFAULT 14
);

-- ============================================================
-- 产品母库 / PRODUCT LIBRARY（HQ 管控，供应商提交审核）
-- ============================================================

CREATE TABLE product_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  name_en         VARCHAR(100),
  icon            VARCHAR(50),
  sort_order      INTEGER DEFAULT 0,
  is_whitelisted  BOOLEAN DEFAULT TRUE    -- 品类白名单标记
);

CREATE TABLE brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  logo_url        VARCHAR(500),
  sort_order      INTEGER DEFAULT 0
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID REFERENCES suppliers(id),  -- NULL = HQ 自建
  category_id     UUID NOT NULL REFERENCES product_categories(id),
  brand_id        UUID REFERENCES brands(id),
  sku             VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255),
  description     TEXT,
  image_url       VARCHAR(500),
  base_cost       NUMERIC(10,2) NOT NULL,          -- 平台批发/成本价
  suggested_price NUMERIC(10,2) NOT NULL,          -- 建议零售价
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 维修服务库 / REPAIR SERVICES（独立于配件产品）
-- ============================================================

CREATE TABLE repair_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES product_categories(id),
  brand_id        UUID REFERENCES brands(id),
  model_name      VARCHAR(255),                    -- 适用机型，如 "iPhone 15 Pro"
  service_name    VARCHAR(255) NOT NULL,           -- "换屏", "换电池"
  description     TEXT,
  estimated_mins  INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 门店选品与定价
CREATE TABLE merchant_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id),
  my_price        NUMERIC(10,2) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  in_stock        BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, product_id)
);

-- 门店维修服务与定价
CREATE TABLE merchant_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id     UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES repair_services(id),
  my_price        NUMERIC(10,2) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, service_id)
);

-- ============================================================
-- 维修预约 / REPAIR BOOKINGS
-- ============================================================

CREATE TABLE repair_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number  VARCHAR(20) UNIQUE NOT NULL,  -- 'IER-20260402-XXXX'
  user_id         UUID NOT NULL REFERENCES users(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  service_id      UUID NOT NULL REFERENCES repair_services(id),

  -- 预约时快照
  service_name    VARCHAR(255) NOT NULL,
  service_price   NUMERIC(10,2) NOT NULL,
  deposit_amount  NUMERIC(10,2) NOT NULL,       -- service_price × 20%
  remaining_amount NUMERIC(10,2) NOT NULL,      -- service_price × 80%

  -- 佣金（下单时锁定）
  commission_rate NUMERIC(5,2),                 -- 如 8.00
  commission_cents INTEGER,                     -- 佣金金额（分）

  -- 日程
  booking_date    DATE NOT NULL,
  booking_time    TIME NOT NULL,
  estimated_mins  INTEGER,

  -- 状态
  status          VARCHAR(20) DEFAULT 'confirmed',
  -- confirmed → checked_in → in_progress → completed
  -- confirmed → no_show | cancelled_by_user | cancelled_by_merchant

  qr_code         VARCHAR(255) NOT NULL,
  checked_in_at   TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  -- 用户信息快照
  user_name       VARCHAR(255) NOT NULL,
  user_phone      VARCHAR(20) NOT NULL,
  user_note       TEXT,

  -- Stripe
  stripe_payment_id    VARCHAR(255),
  stripe_checkout_id   VARCHAR(255),
  deposit_status       VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'paid' | 'refunded' | 'forfeited'

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_merchant_date ON repair_bookings(merchant_id, booking_date);
CREATE INDEX idx_bookings_user ON repair_bookings(user_id);
CREATE INDEX idx_bookings_status ON repair_bookings(status);

-- ============================================================
-- 佣金规则 / COMMISSION RULES（维修服务专用，配件 = 0%）
-- ============================================================

CREATE TABLE commission_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  rate            NUMERIC(4,2) NOT NULL,           -- 百分比，如 8.00
  scope_type      VARCHAR(20) NOT NULL,            -- 'global' | 'region' | 'merchant'
  scope_value     VARCHAR(255),                    -- NULL=全局 | county 名 | merchant_id
  start_date      DATE,
  end_date        DATE,
  priority        INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- 解析逻辑：找所有匹配的活跃规则，选优先级最高的。平级时：merchant > region > global

CREATE TABLE commission_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES repair_bookings(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  rule_id         UUID REFERENCES commission_rules(id),
  service_price   NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'collected' | 'waived'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 维修会员计划 / MEMBERSHIP PLANS（Phase 2）
-- ============================================================

CREATE TABLE membership_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,          -- '碎屏保基础版' | '碎屏保Plus' | '全保版'
  price_eur       NUMERIC(10,2) NOT NULL,         -- €29.9 | €49.9 | €99.9
  duration_months INTEGER NOT NULL DEFAULT 12,
  max_uses        INTEGER,                        -- NULL = 不限次数
  benefits        JSONB,                          -- 权益说明
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  plan_id         UUID NOT NULL REFERENCES membership_plans(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  uses_remaining  INTEGER,
  status          VARCHAR(20) DEFAULT 'active',  -- 'active' | 'expired' | 'cancelled'
  stripe_sub_id   VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE membership_usage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id   UUID NOT NULL REFERENCES user_memberships(id),
  booking_id      UUID REFERENCES repair_bookings(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  service_cost    NUMERIC(10,2) NOT NULL,        -- 实际维修成本（补偿给门店）
  used_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 评价 / REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES repair_bookings(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  merchant_id     UUID NOT NULL REFERENCES merchants(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 短信记录 / SMS LOGS
-- ============================================================

CREATE TABLE sms_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_phone        VARCHAR(20) NOT NULL,
  template_key    VARCHAR(50) NOT NULL,
  message         TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'sent',
  twilio_sid      VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 MVP 不包含的表（Phase 2+）

```
orders / order_items    — 配件在线购买（支付上线后）
settlements             — 财务结算
user_memberships        — 会员套餐（支付上线后）
suppliers               — 供应商后台（MVP 由 admin 手动维护）
```

---

## 5. API 设计 / API Design

所有 API 通过 Next.js Route Handlers 实现（`app/api/v1/`）。

### 5.1 公开接口 / Public API (`/api/v1/public/`)

```
GET  /search/products      ?q=&eircode=&radius=    — 商品搜索（返回附近门店+价格）
GET  /search/merchants     ?eircode=&radius=       — 门店搜索
GET  /products/[id]                                — 商品详情
GET  /stores/[id]                                  — 门店详情（商品+维修服务+营业时间）
GET  /stores/[id]/slots    ?date=                  — 可用预约时段
```

### 5.2 认证接口 / Auth API (`/api/v1/auth/`)

```
POST /send-otp    { phone }                        — 发送验证码（Twilio）
POST /verify-otp  { phone, code } → { token }     — 验证 OTP，返回 JWT
POST /merchant/login { email, password }           — 商家登录
POST /admin/login    { email, password }           — 管理员登录
POST /supplier/login { email, password }           — 供应商登录（Phase 2）
```

### 5.3 用户接口 / User API (`/api/v1/user/`)

```
GET  /me                                           — 当前用户信息
GET  /repair-bookings                              — 我的预约列表
POST /repair-bookings  { service_id, merchant_id, date, time, name, phone, note }
                                                   — 创建预约 → 返回 Stripe Checkout URL
GET  /repair-bookings/[id]                         — 预约详情（含 QR）
POST /repair-bookings/[id]/cancel                  — 取消预约

GET  /memberships                                  — 我的会员权益（Phase 2）
```

### 5.4 商家接口 / Merchant API (`/api/v1/merchant/`)

```
GET  /me                                           — 当前商家信息
GET  /dashboard                                    — 今日预约数、营收摘要

GET  /products                                     — 已选品列表
GET  /products/catalog                             — 产品母库（含我的价格）
POST /products          { product_id, my_price }  — 选品上架
PATCH /products/[id]    { my_price?, is_active?, in_stock? }
DELETE /products/[id]                              — 下架

GET  /bookings          ?status=&date=             — 预约列表
GET  /bookings/[id]
POST /bookings/[id]/accept                         — 接受预约
POST /bookings/[id]/check-in { qr_code }           — 扫码核销
POST /bookings/[id]/complete                       — 完成维修
POST /bookings/[id]/no-show                        — 标记爽约

GET  /settings                                     — 门店信息
PATCH /settings                                    — 更新门店信息
PUT   /settings/hours   [{ day_of_week, open_time, close_time, is_closed }]
PATCH /settings/slots   { slot_duration, max_concurrent, buffer_minutes, advance_days }
POST  /settings/photos                             — 上传照片（multipart）
DELETE /settings/photos/[id]
```

### 5.5 管理接口 / Admin API (`/api/v1/admin/`)

```
GET  /merchants                  ?status=          — 门店列表
POST /merchants                                    — 创建门店账号
GET  /merchants/[id]
POST /merchants/[id]/activate
POST /merchants/[id]/suspend

GET  /products                                     — 产品母库
POST /products
PATCH /products/[id]
DELETE /products/[id]
POST /products/import-csv                          — CSV 批量导入

GET  /categories                                   — 品类管理（白名单）
POST /categories
PATCH /categories/[id]

GET  /commission/rules
POST /commission/rules
PATCH /commission/rules/[id]
DELETE /commission/rules/[id]

GET  /finance/deposits            ?from=&to=
GET  /finance/commissions         ?from=&to=
GET  /finance/settlements
POST /finance/settlements/[id]/approve
POST /finance/settlements/[id]/settle
```

### 5.6 Webhook

```
POST /api/webhooks/stripe          — Stripe 支付确认回调
```

---

## 6. 维修会员计划 / Membership Plans

| 计划 | 价格 | 权益 |
|------|------|------|
| 碎屏保 基础版 | €29.9/年 | 1 次免费换屏（指定机型范围内） |
| 碎屏保 Plus | €49.9/年 | 2 次免费换屏 + 1 次免费换电池 |
| 全保版 | €99.9/年 | 不限次数维修折扣 + 优先预约通道 |

- 用户在任意加盟门店均可使用会员权益
- 核销时平台按预设比例补偿门店维修成本
- **MVP 阶段不上线（Phase 2）**，需支付模块先行

---

## 7. 核心业务规则 / Business Rules

| 规则 | 值 |
|------|-----|
| **维修定金** | 服务价格的 20%（Stripe Checkout） |
| **爽约政策** | 定金不退 |
| **取消 > 24h** | 全额退款 |
| **取消 < 24h** | 不退款 |
| **配件佣金** | **0%**（平台托管，月底结算净额给门店） |
| **维修服务佣金** | 8%（默认全局，可按门店/区域/时间差异化） |
| **佣金优先级** | merchant > region > global（同级选 priority 最高） |
| **门店激活** | HQ 手动操作 |
| **品类限制** | 白名单制，门店不可添加母库以外的商品 |
| **预约提前天数** | 按门店配置，默认 14 天 |
| **时段时长** | 按门店配置，15/30/60 分钟，默认 30 分钟 |
| **MVP 规模** | 3 家自有门店试点 |

---

## 8. MVP 页面清单 / MVP Page List

### 用户端（移动端优先）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/` | 首页（搜索框 + 品类快捷入口） | P0 |
| `/search` | 搜索结果（商品列表 + 门店比价） | P0 |
| `/products/[id]` | 商品详情 | P0 |
| `/stores/[id]` | 门店详情（商品、维修服务、营业时间） | P0 |
| `/repair` | 维修预约入口 | P0 |
| `/repair/book` | 预约表单 | P0 |
| `/auth/login` | 手机号 OTP 登录 | P0 |
| `/account` | 个人中心（我的预约） | P1 |

### 商家后台

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/merchant/login` | 登录 | P0 |
| `/merchant/dashboard` | 工作台 | P1 |
| `/merchant/products` | 已选品 + 调价 | P0 |
| `/merchant/products/catalog` | 浏览母库选品 | P0 |
| `/merchant/bookings` | 预约列表 + 接受/核销 | P0 |
| `/merchant/settings` | 门店信息 + 营业时间 | P0 |

### 管理后台（极简内部用）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/admin/login` | 登录 | P0 |
| `/admin/merchants` | 门店列表 + 创建账号 | P0 |
| `/admin/products` | 产品母库管理 | P0 |
| `/admin/categories` | 品类管理 | P1 |

---

## 9. MVP 验证场景 / MVP Validation Scenarios

### 场景 A：商家选品
```
1. Admin 创建 3 个门店账号（店名/地址/Eircode）
2. Admin 在产品母库录入测试商品（含维修服务）
3. 商家登录后台，浏览母库，选品上架
4. 商家设置本店价格，配置营业时间和预约时段
✅ 验证：用户端可搜索到该门店的商品
```

### 场景 B：用户搜索
```
1. 用户打开首页（手机浏览器）
2. 输入关键词 + Eircode "D01 AB23"
3. 返回附近 3 家门店及各自价格和距离
4. 点击门店详情，查看地址、营业时间、商品列表
✅ 验证：全程无需登录即可完成浏览
```

### 场景 C：维修预约
```
1. 用户在门店详情页点击"预约维修"
2. 选择：iPhone 14 Pro → 换屏 → 选门店 → 选时间段
3. OTP 登录 → 提交预约
4. 用户收到 SMS 确认（含门店地址和时间）
5. 商家后台显示新预约，店主接受
6. 用户预约状态更新为"已确认"
✅ 验证：整个闭环通畅，SMS 正确送达
```

---

## 10. 环境变量 / Environment Variables

```bash
# 数据库
DATABASE_URL=postgresql://...          # GCP Cloud SQL

# 缓存
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...

# 认证
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ierepair.ie

# Google（Eircode 解析 + 地图）
GOOGLE_MAPS_API_KEY=...

# 文件存储（GCS）
GCS_BUCKET_NAME=ierepair-uploads
GOOGLE_APPLICATION_CREDENTIALS=...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+353...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 管理员初始账号（仅开发用，上线后删除）
ADMIN_INIT_EMAIL=admin@ierepair.ie
ADMIN_INIT_PASSWORD=...
```

---

*文档版本：v2.0 | 更新于 2026-04-02*
*对应远程文档：docs/01~08（已合并）*
