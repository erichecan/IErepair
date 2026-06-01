# DEV-PLAN — C 端消费者功能开发

> 生成时间：2026-06-01  
> 参考文档：`docs/08-MVP开发范围.md`、`docs/03-各端页面功能结构.md`、`docs/07-技术决策与模型变更.md`、`docs/superpowers/specs/2026-04-18-fonfix-clone-design.md`

---

## 现状摘要

| 已完成 | 状态 |
|--------|------|
| Admin 后台（全部 API + 页面） | ✅ |
| Merchant 后台（全部 API + 页面） | ✅ |
| 消费者首页（`/`，外壳组件） | ✅ |
| E2E 测试（39 场景通过） | ✅ |

**C 端缺口**：搜索结果页、门店详情、预约流程全未开发；后端公开 API 全未建。

---

## 环境变量现状

```
DATABASE_URL   ✅ 已配置
JWT_SECRET     ✅ 已配置
GOOGLE_MAPS_API_KEY   ❌ 未配置
UPSTASH_REDIS_URL     ❌ 未配置
TWILIO_*              ❌ 未配置
```

**替代方案（无需新 API Key）：**
- Eircode 解析：用 **OpenStreetMap Nominatim**（免费，无 Key，1 req/s）
- 距离计算：用 **Haversine 公式** 直接算 lat/lng（schema 已有 lat/lng 字段，无需 PostGIS）
- 缓存：暂不用 Redis（demo 量级可接受）
- SMS/OTP：**跳过**，改为用户填姓名 + 手机 + 邮箱即可完成预约，无需手机号验证

若有 Google Maps API Key，告知后可随时替换 Nominatim。Twilio 一样。

---

## 开发模块（按优先级顺序）

### 模块 1：公开后端 API（`/api/public/`）
> 其他页面依赖此模块，先做

| API | 说明 |
|-----|------|
| `GET /api/public/search` | 接受 `q`（关键词）+ `eircode` 参数，返回附近门店及匹配的维修服务和价格 |
| `GET /api/public/merchants` | 所有激活门店列表（含距离，需 eircode） |
| `GET /api/public/merchants/[id]` | 单家门店详情 |
| `GET /api/public/merchants/[id]/services` | 门店开放的维修服务列表 + 价格 |
| `GET /api/public/device-categories` | 设备品类列表（给预约选机型用） |
| `GET /api/public/device-brands` | 按品类查品牌 |
| `GET /api/public/device-models` | 按品牌查型号 |
| `GET /api/public/repair-types` | 按设备品类查维修类型 |
| `POST /api/public/bookings` | 提交预约（无需登录，收集姓名/手机/邮箱） |
| `GET /api/public/bookings/[orderNumber]` | 按订单号查询预约状态 |

Eircode 解析工具放在 `src/lib/geo.ts`（Nominatim + Haversine）。

---

### 模块 2：搜索结果页 `/search`
> 用户旅程入口，P0

**功能：**
- URL 接受 `?q=screen+repair&eircode=D01+W2X2`
- 顶部可修改搜索条件（关键词 + Eircode）
- 结果列表：维修服务卡（服务名称 + 门店名 + 价格 + 距离 + "Book Now" 按钮）
- 按距离排序
- 无结果空态（提示无附近门店）
- 骨架屏 loading 状态

**设计风格**：沿用首页已有的 IERepair 风格（深绿 + 白色）

---

### 模块 3：门店详情页 `/stores/[id]`
> 搜索结果点击进入，P0

**功能：**
- 门店名称、地址、Eircode、电话
- 营业时间表（7 天）
- 维修服务列表 + 价格（可直接点击预约）
- "Book a Repair" 按钮跳转 `/repair/book?merchantId=xxx`

---

### 模块 4：维修预约流程 `/repair/book`
> 核心业务闭环，P0

**步骤（多步表单，单页面状态机）：**

```
Step 1: 选设备 — 品类 → 品牌 → 型号（三级级联选择）
Step 2: 选维修类型（根据设备过滤可用服务）
Step 3: 选门店（输入 Eircode 找附近门店，展示各家价格和距离）
Step 4: 选时间段（展示该门店的营业时间，用户选日期 + 时间段）
Step 5: 填联系方式（姓名 + 手机 + 邮箱[可选]）
Step 6: 确认页（汇总所有选择 + 报价）
Step 7: 提交成功页（显示订单号 + 预计时长 + 门店地址）
```

进度条显示当前步骤。可后退上一步。

---

### 模块 5：我的预约查询 `/account/bookings`
> P1，无需登录，凭手机号查询

**功能：**
- 输入手机号 → 查出该手机号下所有预约
- 展示预约状态（待确认 / 已确认 / 已完成 / 已取消）
- 订单详情（服务 + 门店 + 时间 + 报价）

---

## 文件结构（新增）

```
src/
├── app/
│   ├── api/public/
│   │   ├── search/route.ts
│   │   ├── merchants/route.ts
│   │   ├── merchants/[id]/route.ts
│   │   ├── merchants/[id]/services/route.ts
│   │   ├── device-categories/route.ts
│   │   ├── device-brands/route.ts
│   │   ├── device-models/route.ts
│   │   ├── repair-types/route.ts
│   │   ├── bookings/route.ts
│   │   └── bookings/[orderNumber]/route.ts
│   ├── search/page.tsx
│   ├── stores/[id]/page.tsx
│   ├── repair/
│   │   └── book/page.tsx
│   └── account/
│       └── bookings/page.tsx
├── components/consumer/
│   ├── SearchBar.tsx
│   ├── ServiceCard.tsx
│   ├── StoreCard.tsx
│   ├── BookingWizard.tsx
│   └── BookingLookup.tsx
└── lib/
    └── geo.ts          ← Nominatim + Haversine
```

---

## 架构决策

| 决策 | 选择 | 原因 |
|------|------|------|
| Eircode 解析 | Nominatim OSM | 无需 API Key，demo 量级足够 |
| 距离计算 | Haversine on lat/lng | schema 已有字段，无需 PostGIS |
| 预约鉴权 | 无（游客可预约） | MVP 最简路径，OTP 可后期叠加 |
| 时间段选择 | 基于 MerchantHours 的营业时间生成 30 分钟时间块 | 无单独时间段表，逻辑在前端生成 |
| 页面数据获取 | Client Component + fetch（搜索依赖用户输入） | 搜索页需要运行时参数，不适合 SSG |

---

## 风险点

| 风险 | 影响 | 缓解 |
|------|------|------|
| Nominatim 限速 1 req/s | 高并发时延迟 | Demo 阶段可接受；上线前换 Google Maps |
| 商家 lat/lng 仅有 3 条 seed 数据（都柏林） | 搜索演示受限 | 用都柏林 Eircode 测试 D01/D02/D06 均有结果 |
| 无 SMS 通知 | 体验不完整 | 成功页展示订单号，可手动告知 |
| `MerchantHours` 仅记录营业时间段，无具体可预约时间块 | 时间选择粒度粗 | 前端按营业时间生成每 30 分钟一个时间块 |
