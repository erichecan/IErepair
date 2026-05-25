# IERepair 平台 — API 设计规划

> 文档版本：v1.0  
> 协议：RESTful HTTP / JSON  
> 认证：JWT Bearer Token  
> 最后更新：2026-04-01

---

## 一、设计规范

### 1.1 基础约定

| 项目 | 规范 |
|------|------|
| 基础路径 | `/api/v1/` |
| 请求格式 | `Content-Type: application/json` |
| 认证方式 | `Authorization: Bearer <jwt_token>` |
| 时间格式 | ISO 8601（`2026-04-01T12:00:00Z`）|
| 金额格式 | 整数，单位为分（cent），如 `2990` = €29.90 |
| 分页参数 | `?page=1&per_page=20`，响应含 `meta.total` |
| 错误格式 | 统一结构（见下方）|

### 1.2 统一响应格式

**成功响应：**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "MERCHANT_NOT_FOUND",
    "message": "门店不存在或已停用",
    "details": {}
  }
}
```

### 1.3 认证说明

| API 分组 | 认证要求 |
|----------|----------|
| `/api/v1/public/` | 无需认证（公开搜索、商品浏览）|
| `/api/v1/user/` | 用户 JWT |
| `/api/v1/merchant/` | 商家 JWT |
| `/api/v1/supplier/` | 供应商 JWT |
| `/api/v1/admin/` | 管理员 JWT + 2FA |

---

## 二、API 模块清单

### 2.1 认证模块 `/api/v1/auth/`

#### 用户认证

| Method | Path | 描述 |
|--------|------|------|
| POST | `/auth/user/send-otp` | 发送手机号 OTP |
| POST | `/auth/user/verify-otp` | 验证 OTP，返回 JWT |
| POST | `/auth/user/google` | Google OAuth 登录 |
| POST | `/auth/user/apple` | Apple OAuth 登录 |
| POST | `/auth/user/refresh` | 刷新 JWT |
| POST | `/auth/user/logout` | 登出（服务端吊销 token）|

#### 商家认证

| Method | Path | 描述 |
|--------|------|------|
| POST | `/auth/merchant/login` | 账号密码登录 |
| POST | `/auth/merchant/refresh` | 刷新 JWT |
| POST | `/auth/merchant/logout` | 登出 |

#### 供应商 & 管理员（同上结构，路径替换 `merchant`→`supplier`/`admin`）

---

### 2.2 公开搜索模块 `/api/v1/public/`（无需登录）

#### 搜索商品

```
GET /public/search/products
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 否 | 关键词 |
| `eircode` | string | 是 | 用户位置 Eircode |
| `radius_km` | number | 否 | 搜索半径（默认 10km）|
| `category_id` | UUID | 否 | 品类筛选 |
| `sort` | string | 否 | `distance`/`price_asc`/`price_desc`/`rating` |
| `page` / `per_page` | int | 否 | 分页 |

**响应 `data`：**
```json
[
  {
    "product_id": "uuid",
    "name": "iPhone 14 Pro 换屏",
    "category": "维修服务",
    "images": ["https://..."],
    "min_price_cents": 8900,
    "max_price_cents": 12000,
    "merchant_count": 3,
    "merchants": [
      {
        "merchant_id": "uuid",
        "shop_name": "QuickFix Dublin",
        "distance_km": 1.2,
        "price_cents": 8900,
        "is_open": true
      }
    ]
  }
]
```

---

#### 搜索附近门店

```
GET /public/search/merchants
```

**请求参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `eircode` | string | 必填 |
| `radius_km` | number | 默认 10 |
| `service_type` | string | `products`/`repair`/`both` |

---

#### 获取商品详情

```
GET /public/products/:product_id
GET /public/products/:product_id/merchants?eircode=D01AB23
```

---

#### 获取门店详情

```
GET /public/merchants/:merchant_id
GET /public/merchants/:merchant_id/products
GET /public/merchants/:merchant_id/services
GET /public/merchants/:merchant_id/availability?date=2026-04-10
```

---

#### 获取品类树

```
GET /public/categories
```

---

#### 获取维修服务列表

```
GET /public/repair-services?brand=Apple
```

---

### 2.3 用户模块 `/api/v1/user/`

#### 个人信息

```
GET    /user/profile
PUT    /user/profile
GET    /user/addresses
POST   /user/addresses
PUT    /user/addresses/:id
DELETE /user/addresses/:id
```

---

#### 购物车

```
GET    /user/cart
POST   /user/cart/items              -- 加入购物车
PUT    /user/cart/items/:id          -- 修改数量
DELETE /user/cart/items/:id          -- 删除
DELETE /user/cart                    -- 清空
```

---

#### 订单

```
POST   /user/orders                  -- 创建订单
GET    /user/orders                  -- 订单列表
GET    /user/orders/:id              -- 订单详情
POST   /user/orders/:id/cancel       -- 取消订单
POST   /user/orders/:id/confirm-receipt  -- 确认收货
```

**创建订单 Request Body：**
```json
{
  "merchant_id": "uuid",
  "items": [
    { "sku_id": "uuid", "quantity": 1 }
  ],
  "fulfillment_type": "pickup",
  "pickup_slot": "2026-04-10T14:00:00Z",
  "payment_method": "stripe",
  "notes": ""
}
```

---

#### Stripe 支付

```
POST /user/payments/create-intent    -- 创建 Stripe PaymentIntent
POST /user/payments/webhook          -- Stripe Webhook 回调（无需认证，验签）
```

**创建 PaymentIntent Request Body：**
```json
{
  "order_id": "uuid"
}
```

**Response：**
```json
{
  "client_secret": "pi_xxx_secret_xxx"
}
```

---

#### 维修预约

```
POST   /user/repair-bookings         -- 创建预约
GET    /user/repair-bookings         -- 预约列表
GET    /user/repair-bookings/:id     -- 预约详情
POST   /user/repair-bookings/:id/cancel  -- 取消预约
```

**创建预约 Request Body：**
```json
{
  "merchant_id": "uuid",
  "service_id": "uuid",
  "device_brand": "Apple",
  "device_model": "iPhone 14 Pro",
  "fault_description": "屏幕右上角有裂痕",
  "booking_time": "2026-04-10T10:00:00Z",
  "membership_id": "uuid",
  "notes": ""
}
```

---

#### 会员

```
GET    /user/memberships             -- 我的会员列表
GET    /user/memberships/active      -- 当前有效会员
GET    /user/memberships/:id         -- 会员详情
GET    /user/memberships/:id/usage   -- 使用记录
POST   /user/memberships/purchase    -- 购买会员套餐

GET    /public/membership-plans      -- 获取套餐列表（公开）
```

**购买会员 Request Body：**
```json
{
  "plan_id": "uuid",
  "payment_method": "stripe"
}
```

---

### 2.4 商家模块 `/api/v1/merchant/`

#### 门店信息

```
GET  /merchant/profile               -- 获取门店信息
PUT  /merchant/profile               -- 更新门店信息
PUT  /merchant/hours                 -- 更新营业时间
PUT  /merchant/availability-slots    -- 更新预约时间段配置
```

---

#### 商品管理

```
GET    /merchant/products            -- 已上架商品列表
POST   /merchant/products            -- 从母库选品上架
PUT    /merchant/products/:id        -- 修改售价 / 上下架
DELETE /merchant/products/:id        -- 下架移除
POST   /merchant/products/bulk       -- 批量选品上架

GET    /merchant/catalog             -- 浏览产品母库（分页、筛选）
```

---

#### 维修服务管理

```
GET    /merchant/services            -- 本店维修服务列表
POST   /merchant/services            -- 添加维修服务及报价
PUT    /merchant/services/:id        -- 修改报价 / 状态
DELETE /merchant/services/:id        -- 移除服务
```

---

#### 订单管理

```
GET  /merchant/orders                -- 订单列表（支持状态/日期筛选）
GET  /merchant/orders/:id            -- 订单详情
POST /merchant/orders/:id/confirm    -- 接单
POST /merchant/orders/:id/reject     -- 拒单（含原因）
POST /merchant/orders/:id/ship       -- 填写快递信息
POST /merchant/orders/:id/verify-pickup  -- 核销到店自取（传 order_no 或扫码）
```

---

#### 预约管理

```
GET  /merchant/repair-bookings           -- 预约列表（支持日期/状态筛选）
GET  /merchant/repair-bookings/:id       -- 预约详情
POST /merchant/repair-bookings/:id/confirm   -- 接受预约
POST /merchant/repair-bookings/:id/reject    -- 拒绝预约
POST /merchant/repair-bookings/:id/complete  -- 完成维修核销
```

**完成核销 Request Body：**
```json
{
  "actual_price_cents": 8900,
  "payment_method": "in_store_card",
  "notes": "更换原装屏幕，包含人工费"
}
```

---

#### 财务结算

```
GET /merchant/finance/summary        -- 收入概览
GET /merchant/finance/transactions   -- 流水明细
GET /merchant/finance/settlements    -- 结算周期列表
GET /merchant/finance/settlements/:id         -- 结算详情
GET /merchant/finance/settlements/:id/export  -- 导出对账单（PDF/CSV）
PUT /merchant/finance/bank-account   -- 更新 IBAN
```

---

#### 采购建议

```
GET /merchant/procurement-suggestions         -- 获取当前采购建议
GET /merchant/procurement-suggestions/history -- 历史建议
```

---

#### 数据统计

```
GET /merchant/stats/overview         -- 今日/本周/本月概览数据
GET /merchant/stats/top-products     -- 本店热销商品
```

---

### 2.5 供应商模块 `/api/v1/supplier/`

```
GET    /supplier/profile
PUT    /supplier/profile

-- 商品管理
GET    /supplier/products            -- 我的商品列表
POST   /supplier/products            -- 提交新品申请
PUT    /supplier/products/:id        -- 修改商品信息（触发重审）
GET    /supplier/products/:id/review-status  -- 查看审核状态

-- SKU 管理
GET    /supplier/products/:id/skus
POST   /supplier/products/:id/skus
PUT    /supplier/skus/:id
DELETE /supplier/skus/:id

-- 库存
PUT    /supplier/skus/:id/stock      -- 更新库存数量

-- 采购单
GET    /supplier/purchase-orders     -- 平台采购单列表
POST   /supplier/purchase-orders/:id/ship  -- 确认发货
```

---

### 2.6 平台管理模块 `/api/v1/admin/`

#### 门店管理

```
GET    /admin/merchants                          -- 门店列表
GET    /admin/merchants/:id                      -- 门店详情
POST   /admin/merchants/:id/approve              -- 审核通过
POST   /admin/merchants/:id/reject               -- 审核拒绝
POST   /admin/merchants/:id/suspend              -- 暂停门店
PUT    /admin/merchants/:id/commission-rate      -- 设置门店专属抽成率
```

#### 产品母库管理

```
GET    /admin/products                           -- 全部商品（含待审核）
GET    /admin/products/review-queue              -- 审核队列
POST   /admin/products/:id/approve               -- 审核通过，入母库
POST   /admin/products/:id/reject                -- 拒绝，退回原因
PUT    /admin/products/:id                       -- 平台直接编辑
DELETE /admin/products/:id                       -- 下架删除

GET    /admin/categories                         -- 品类管理
POST   /admin/categories
PUT    /admin/categories/:id
DELETE /admin/categories/:id
```

#### 供应商管理

```
GET    /admin/suppliers
GET    /admin/suppliers/:id
POST   /admin/suppliers/:id/suspend
PUT    /admin/suppliers/:id/status
```

#### 用户管理

```
GET    /admin/users
GET    /admin/users/:id
POST   /admin/users/:id/suspend
```

#### 全平台订单

```
GET    /admin/orders                 -- 全平台订单（含搜索/筛选）
GET    /admin/orders/:id
POST   /admin/orders/:id/intervene   -- 平台介入（处理纠纷）
```

#### 会员套餐

```
GET    /admin/membership-plans
POST   /admin/membership-plans
PUT    /admin/membership-plans/:id
POST   /admin/membership-plans/:id/toggle-active
GET    /admin/membership-plans/:id/stats
```

#### 财务管理

```
GET    /admin/finance/overview                   -- 平台收入总览
GET    /admin/finance/commission-rules           -- 抽成规则列表
POST   /admin/finance/commission-rules           -- 创建规则
PUT    /admin/finance/commission-rules/:id
POST   /admin/finance/settlements/generate       -- 触发月度结算
GET    /admin/finance/settlements                -- 结算列表
GET    /admin/finance/settlements/:id
POST   /admin/finance/settlements/:id/process    -- 执行结算（Stripe 打款）
```

#### 系统设置

```
GET    /admin/configs                -- 全局配置列表
PUT    /admin/configs/:key           -- 修改配置
GET    /admin/audit-logs             -- 审计日志（分页 + 筛选）
GET    /admin/stats/dashboard        -- 数据大盘
```

---

## 三、Webhook 端点

| Path | 来源 | 用途 |
|------|------|------|
| `POST /webhooks/stripe` | Stripe | 支付结果回调（`payment_intent.succeeded` / `payment_intent.payment_failed` 等）|
| `POST /webhooks/sms/:provider` | SMS 服务商 | 短信发送状态回调 |

> Webhook 端点不需要 JWT 认证，但必须验证请求签名。

---

## 四、错误码清单（部分）

| Code | HTTP 状态 | 说明 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 未登录或 token 失效 |
| `FORBIDDEN` | 403 | 无权限操作 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 422 | 请求参数校验失败 |
| `MERCHANT_INACTIVE` | 403 | 门店已停用 |
| `PRODUCT_NOT_IN_CATALOG` | 400 | 商品不在平台母库中 |
| `PRICE_BELOW_MIN` | 400 | 售价低于平台最低限价 |
| `MEMBERSHIP_EXHAUSTED` | 400 | 会员权益次数已用完 |
| `MEMBERSHIP_EXPIRED` | 400 | 会员已过期 |
| `STRIPE_PAYMENT_FAILED` | 402 | Stripe 支付失败 |
| `BOOKING_SLOT_UNAVAILABLE` | 409 | 预约时间段不可用 |
| `ORDER_ALREADY_CONFIRMED` | 409 | 订单已被处理，不可取消 |

---

## 五、技术栈建议

| 层次 | 推荐方案 |
|------|----------|
| 后端框架 | Node.js + Fastify 或 Python + FastAPI |
| 数据库 | PostgreSQL 16 + PostGIS |
| 缓存 | Redis（JWT 黑名单、搜索缓存、OTP）|
| 文件存储 | AWS S3 / Cloudflare R2（商品图片）|
| 短信服务 | Twilio（爱尔兰本地覆盖好）|
| 支付 | Stripe（支持 IE 地区，支持 EUR）|
| 地图 | Google Maps Geocoding API（Eircode → 坐标）|
| 邮件 | Resend 或 AWS SES |
| 部署 | Railway / Render / AWS（按规模选择）|

---

*上一步 → [04-数据库设计规划.md](./04-数据库设计规划.md)*  
*下一步 → [06-运营方案.md](./06-运营方案.md)*
