# IERepair 平台 — MVP 开发范围

> 文档版本：v1.0  
> 最后更新：2026-04-01  
> MVP 目标：让客户自有 3 家门店完整跑通核心业务流程

---

## 一、MVP 核心目标

> **一句话定义**：3 家门店能入驻选品，用户能搜索浏览商品、能预约维修——主流程全部可用。

不追求完整，追求**主干通畅**。

---

## 二、MVP 功能范围

### ✅ MVP 包含（必须做）

#### 商家端（Merchant）
- [ ] 账号密码登录
- [ ] 门店基础信息配置（店名、地址、Eircode、营业时间）
- [ ] 浏览产品母库（按品类筛选、搜索）
- [ ] 从母库选品上架到本店
- [ ] 设置 / 修改本店售价
- [ ] 下架商品
- [ ] 查看到来的订单列表（只读，接单操作可暂缓）
- [ ] 查看维修预约列表（接受 / 完成核销）

#### 用户端（Consumer）
- [ ] 首页（搜索框 + 品类快捷入口）
- [ ] 输入 Eircode 搜索商品 → 展示附近门店 + 该商品价格
- [ ] 商品详情页（图片、描述、在哪些门店有售及价格）
- [ ] 门店详情页（基础信息、商品列表、维修服务列表）
- [ ] 维修预约流程（选机型 → 选故障 → 选门店时间段 → 提交）
- [ ] 手机号 OTP 登录 / 注册（Google OAuth 可 MVP 后加）
- [ ] 我的预约（查看状态）

#### 平台管理（Admin）- MVP 最精简版
- [ ] 手动创建 3 个商家账号（无需完整审核流程，直接后台创建）
- [ ] 产品母库：手动录入初始商品（或从 CSV 批量导入）
- [ ] 简单的商品审核（通过 / 拒绝）

#### 基础基础设施
- [ ] Eircode → 坐标解析（Google Geocoding + Redis 缓存）
- [ ] PostGIS 附近门店查询
- [ ] SMS 通知（预约确认发给用户 + 门店）
- [ ] 数据库核心表（见第三节）

---

### ❌ MVP 不包含（推迟到 Phase 2）

| 功能 | 推迟原因 |
|------|----------|
| Stripe 在线支付 | MVP 阶段用户可到店付款，支付流程复杂，优先验证业务 |
| 购物车 & 下单流程 | 同上，MVP 先验证"找到商品 → 去门店"的核心路径 |
| 维修会员套餐 | 需要支付，一并推迟 |
| 供应商后台 | MVP 由平台运营手动维护产品库 |
| 财务结算模块 | 无支付则无结算 |
| 完整门店审核流程 | 直接后台创建 3 个账号即可 |
| 用户评价系统 | |
| 采购建议 | |
| 数据大盘 | |
| Google / Apple OAuth | 手机号 OTP 足够 |

---

## 三、MVP 数据库（精简版）

MVP 只需建以下核心表，其余表 Phase 2 再加：

```
✅ users                  用户
✅ merchants              门店（含 location GEOGRAPHY）
✅ merchant_hours         营业时间
✅ product_categories     品类
✅ products               产品母库
✅ product_skus           SKU
✅ merchant_products      门店已选品 + 价格
✅ repair_services        维修服务库
✅ merchant_services      门店提供的维修服务 + 报价
✅ repair_bookings        维修预约
✅ sms_logs               短信记录
✅ admin_users            管理员

❌ orders / order_items   Phase 2（支付上线后）
❌ settlements            Phase 2
❌ user_memberships       Phase 2
❌ suppliers              Phase 2
```

---

## 四、MVP 页面清单（精简版）

### 用户端（Next.js，移动端优先）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/` | 首页（搜索框 + 品类入口）| P0 |
| `/search` | 搜索结果页（商品列表 + 门店价格）| P0 |
| `/products/[id]` | 商品详情页 | P0 |
| `/stores/[id]` | 门店详情页 | P0 |
| `/repair` | 维修预约入口 | P0 |
| `/repair/book` | 维修预约表单 | P0 |
| `/account` | 个人中心（查看预约）| P1 |
| `/auth/login` | 手机号 OTP 登录 | P0 |

### 商家后台

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/merchant/login` | 登录 | P0 |
| `/merchant/dashboard` | 工作台（今日预约数）| P1 |
| `/merchant/products` | 已选品列表 + 调价 | P0 |
| `/merchant/products/catalog` | 浏览母库选品 | P0 |
| `/merchant/bookings` | 维修预约列表 + 接受/完成 | P0 |
| `/merchant/settings` | 门店信息 + 营业时间 | P0 |

### 管理后台（极简，内部用）

| 路由 | 页面 | 优先级 |
|------|------|--------|
| `/admin/login` | 登录 | P0 |
| `/admin/merchants` | 门店列表 + 创建账号 | P0 |
| `/admin/products` | 产品母库管理（增删改、CSV 导入）| P0 |
| `/admin/categories` | 品类管理 | P1 |

---

## 五、MVP 用户旅程验证清单

以下场景必须在 MVP 上线前完整跑通：

### 场景 A：商家选品
```
1. 管理员在后台创建门店账号（店名 / 地址 / Eircode）
2. 管理员在产品母库录入 10 个测试商品（含 3 个维修服务）
3. 商家用账号密码登录商家后台
4. 商家浏览产品母库，选择 5 个商品上架
5. 商家为每个商品设置本店价格
6. 商家配置营业时间和可预约时间段
✅ 验证：前台可搜索到该门店的这 5 个商品
```

### 场景 B：用户搜索商品
```
1. 用户打开首页（手机浏览器）
2. 输入关键词"iPhone case" + Eircode "D01 AB23"
3. 系统返回 3 家门店均有在售，展示各自价格和距离
4. 点击门店，进入门店详情页
5. 能看到该门店的地址、营业时间、在售商品列表
✅ 验证：全程无需登录即可完成浏览
```

### 场景 C：用户预约维修
```
1. 用户在搜索结果 / 门店详情页点击"预约维修"
2. 选择：iPhone 14 Pro → 换屏
3. 系统展示附近 3 家门店，用户选择一家
4. 选择时间段（如明天下午 2:00）
5. 用手机号 OTP 登录（自动跳转后返回）
6. 提交预约
7. 用户收到 SMS 确认（包含门店地址和时间）
8. 门店后台显示新预约，店主接受预约
9. 用户预约状态更新为"已确认"
✅ 验证：整个闭环通畅，SMS 正确送达
```

---

## 六、MVP 开发优先级排序

**第一批（先做，是其他功能的基础）：**
1. 数据库建表（核心 12 张表）
2. 后端 API：产品母库 CRUD、商家选品
3. 后端 API：Eircode 解析 + PostGIS 搜索
4. 用户端：首页 + 搜索结果页 + 商品详情页

**第二批（第一批完成后）：**
5. 商家后台：登录 + 选品 + 调价
6. 用户端：门店详情页
7. 手机号 OTP 登录
8. 维修预约流程（用户端 + 商家端接单）

**第三批（收尾）：**
9. SMS 通知集成（Twilio）
10. 管理后台：创建门店账号 + 产品库管理
11. 商家后台：营业时间 + 预约时间段配置
12. 联调测试：跑通三个验证场景

---

## 七、项目目录结构

```
ierepair/
├── app/                          # Next.js App Router
│   ├── (consumer)/               # 用户端（无需登录可访问）
│   │   ├── page.tsx              # 首页
│   │   ├── search/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── stores/[id]/page.tsx
│   │   ├── repair/page.tsx
│   │   └── repair/book/page.tsx
│   ├── (auth)/                   # 登录页
│   │   └── auth/login/page.tsx
│   ├── account/                  # 需登录
│   │   └── page.tsx
│   ├── merchant/                 # 商家后台（独立 layout）
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/catalog/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/                    # 管理后台
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── merchants/page.tsx
│   │   └── products/page.tsx
│   └── api/                      # Route Handlers（后端 API）
│       └── v1/
│           ├── public/
│           │   ├── search/products/route.ts
│           │   ├── search/merchants/route.ts
│           │   ├── products/[id]/route.ts
│           │   └── stores/[id]/route.ts
│           ├── auth/
│           │   ├── send-otp/route.ts
│           │   └── verify-otp/route.ts
│           ├── user/
│           │   └── repair-bookings/route.ts
│           ├── merchant/
│           │   ├── products/route.ts
│           │   ├── catalog/route.ts
│           │   └── bookings/route.ts
│           └── admin/
│               ├── merchants/route.ts
│               └── products/route.ts
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle 连接
│   │   └── schema/               # 各表 schema 定义
│   │       ├── users.ts
│   │       ├── merchants.ts
│   │       ├── products.ts
│   │       ├── bookings.ts
│   │       └── ...
│   ├── geo.ts                    # Eircode → 坐标 + PostGIS 查询
│   ├── sms.ts                    # Twilio 短信封装
│   └── auth.ts                   # NextAuth 配置
├── components/
│   ├── consumer/                 # 用户端组件
│   ├── merchant/                 # 商家端组件
│   └── ui/                       # shadcn/ui 基础组件
├── .env.local                    # 环境变量（本地）
└── drizzle.config.ts
```

---

## 八、环境变量清单

```bash
# 数据库
DATABASE_URL=postgresql://...          # Neon PostgreSQL 连接串

# 缓存
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...

# 认证
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ierepair.ie

# Google（Eircode 解析）
GOOGLE_MAPS_API_KEY=...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+353...

# 管理员初始账号（仅开发用，上线后删除）
ADMIN_INIT_EMAIL=admin@ierepair.ie
ADMIN_INIT_PASSWORD=...
```

---

## 九、MVP 上线检查清单

- [ ] 3 家门店账号已创建，门店信息完整（含 Eircode 解析坐标正确）
- [ ] 产品母库至少 50 个 SKU（涵盖 iPhone 15、14、Samsung S24 主流配件）
- [ ] 每家门店至少选品 10 个，价格已设置
- [ ] 每家门店维修服务已配置（最少：换屏、换电池）
- [ ] 营业时间已配置
- [ ] 用户端搜索功能正常（输入 Eircode 返回正确门店和距离）
- [ ] 维修预约流程全程无报错
- [ ] SMS 在真实手机号上测试成功（用户 + 门店）
- [ ] 商家后台：接受预约功能正常，状态同步用户端
- [ ] 移动端（iPhone Safari、Android Chrome）UI 无明显布局问题
- [ ] 基本安全：API 路由鉴权正确，商家只能访问自己门店数据

---

*上一步 → [07-技术决策与模型变更.md](./07-技术决策与模型变更.md)*
