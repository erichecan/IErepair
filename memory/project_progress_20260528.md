---
name: project-progress-20260528
description: 2026-05-28 工作进度记录，admin 后台全部完成，下一步是 merchant 端
metadata:
  type: project
---

## 2026-05-28 工作进度

**今日完成：Admin 后台全部 P0/P1 功能（commit a0fe369，已推送 main）**

### 完成内容

#### Prisma Schema 扩展
- 新增 `Merchant`、`ProductCategory`、`Product` 三个模型
- 迁移已在 Neon 执行：`20260528202817_add_merchant_products`

#### Admin 页面（`src/app/admin/`）
- `/admin/dashboard` — 数据概览（门店数、维修服务数、商品数、快速入口）
- `/admin/repair-catalog/[categoryId]` — 维修目录，3 级 Accordion（Brand→Model→Service），支持内联编辑
- `/admin/merchants` — 门店管理（创建账号、启用/停用、重置密码）
- `/admin/products` — 商品母库（添加/列表/上架/下架/删除，品类+状态筛选）
- `/admin/categories` — 品类管理（设备品类 + 商品品类双 Tab，可添加/删除）

#### Admin API 路由（14 个，全部 JWT 鉴权）
- `auth/login`、`auth/logout`
- `device-categories/`、`device-categories/[id]`、`device-categories/[id]/brands`
- `device-models/[id]`
- `merchants/`、`merchants/[id]`
- `product-categories/`、`product-categories/[id]`
- `products/`、`products/[id]`
- `repair-catalog/` 系列（4 个）
- `repair-services/[id]`

#### 共用组件
- `Modal.tsx`、`FormField.tsx`、`TextInput` — 通用弹窗和表单元素
- `AdminSidebar.tsx` — 已加入 5 个导航项，根路由重定向至 dashboard

---

### 当前 Admin 完成状态

| 功能 | 状态 |
|------|------|
| 手动创建商家账号 | ✅ |
| 产品母库录入/管理 | ✅ |
| 商品上架/下架/审核状态 | ✅（active/pending/rejected） |
| 维修目录管理（品类→品牌→型号→服务） | ✅ |
| 品类管理 | ✅ |
| 数据概览 Dashboard | ✅ |

---

### 下一步：Merchant 端（商家后台）

按 `docs/08-MVP开发范围.md` P0 排序：

1. **商家登录** (`/merchant/login`) — 用已有 Merchant.passwordHash，JWT 登录
2. **门店信息配置** — 编辑 name/address/eircode/营业时间 (merchant_hours 表待建)
3. **浏览产品母库 + 选品上架** — 关联 merchant_products 表（待建），设置本店售价
4. **商家端维修预约列表** — 接受/完成核销

然后是 **Consumer 端**（用户侧功能，需要 OTP 登录、Eircode 搜索、PostGIS）

**Why:** MVP 目标是 3 家门店能完整跑通：Admin 建好后，Merchant 端是下一个必须完成的环节，让门店能选品并配置信息。

**How to apply:** 下次开工直接从 `/merchant/login` 开始，复用 admin JWT 认证模式，merchant_products 表需要新 migration。
