# Fonfix.ie 全站复刻设计规格

**日期：** 2026-04-18  
**项目：** IErepair / Fonfix.ie 消费者端改版  
**状态：** 已审批

---

## 目标

将 IErepair 消费者端页面完整复刻为 Fonfix.ie 风格，覆盖全部 38+ 页面。核心约束：不影响多商家维修平台定位，现有预约/浏览功能路由保持不变。

---

## 1. 路由架构

### 新路由组：`app/(fonfix)/`

承载所有 Fonfix 营销页面，拥有独立 `layout.tsx`（含 AnnouncementBar + Fonfix Header + MegaMenu + Fonfix Footer + ChatWidget）。

| 路径 | 文件 | 说明 |
|------|------|------|
| `/` | `page.tsx` | 首页（完全替换为 Fonfix 风格） |
| `/pages/about` | `pages/about/page.tsx` | 关于我们 |
| `/pages/contact` | `pages/contact/page.tsx` | 联系我们（mock 表单） |
| `/pages/stores` | `pages/stores/page.tsx` | 门店列表 |
| `/pages/faq` | `pages/faq/page.tsx` | FAQ |
| `/pages/warranty` | `pages/warranty/page.tsx` | 保修政策 |
| `/pages/privacy-policy` | `pages/privacy-policy/page.tsx` | 隐私政策 |
| `/pages/terms-of-service` | `pages/terms-of-service/page.tsx` | 服务条款 |
| `/pages/cookie-policy` | `pages/cookie-policy/page.tsx` | Cookie 政策 |
| `/pages/sitemap` | `pages/sitemap/page.tsx` | 站点地图 |
| `/pages/careers` | `pages/careers/page.tsx` | 招聘 |
| `/pages/press` | `pages/press/page.tsx` | 媒体中心 |
| `/pages/partners` | `pages/partners/page.tsx` | 合作伙伴 |
| `/pages/affiliates` | `pages/affiliates/page.tsx` | 联盟计划 |
| `/pages/business` | `pages/business/page.tsx` | 企业服务 |
| `/pages/education` | `pages/education/page.tsx` | 教育机构服务 |
| `/pages/insurance` | `pages/insurance/page.tsx` | 保险理赔 |
| `/products/[slug]` | `products/[slug]/page.tsx` | 维修服务详情页 |
| `/collections/[slug]` | `collections/[slug]/page.tsx` | 设备品类集合页 |
| `/collections/iphone-repair` | （动态路由覆盖） | iPhone 维修集合 |
| `/collections/samsung-repair` | （动态路由覆盖） | Samsung 维修集合 |
| `/blogs` | `blogs/page.tsx` | 博客列表 |
| `/blogs/[slug]` | `blogs/[slug]/page.tsx` | 博客详情 |
| `/cart` | `cart/page.tsx` | 购物车（localStorage + Context） |
| `/checkout` | `checkout/page.tsx` | 结账（mock 表单 → 成功弹窗） |
| `/account/login` | `account/login/page.tsx` | Fonfix 风格登录（复用 /api/auth） |
| `/account/register` | `account/register/page.tsx` | 注册 |

### 保留路由组：`app/(consumer)/`

仅保留功能性页面（预约流程、商家搜索、账户管理），沿用现有 IERepair Header。

| 保留路径 | 说明 |
|----------|------|
| `/repair/book` | 预约维修 |
| `/repair/browse` | 浏览维修服务 |
| `/repair/device/[slug]` | 设备详情 |
| `/search` | 搜索商家 |
| `/account` | 账户中心 |

---

## 2. 组件架构

### Layout 组件（`components/fonfix/layout/`）

- **AnnouncementBar** — 顶部公告栏，可关闭，存 localStorage
- **Header** — Fonfix 品牌 Logo + MegaMenu 触发器 + 购物车图标 + CTA 按钮
- **MegaMenu** — 4 列桌面下拉菜单（设备品类 / 服务类型 / 门店 / 帮助中心）；移动端 Drawer
- **Footer** — 深色背景 `#1E2A38`，4 列链接 + 社交图标 + 支付图标
- **ChatWidget** — 右下角浮动按钮，点击 → mock 聊天弹窗

### UI 组件（`components/fonfix/ui/`）

- **ServiceCard** — 维修服务卡（图标 + 名称 + 价格 + CTA）
- **DeviceSelector** — 设备选择器（品牌 tabs + 型号 grid）
- **FAQItem** — 手风琴展开/收起
- **BlogCard** — 博客卡（封面图 + 标题 + 摘要 + 日期）
- **StoreCard** — 门店卡（地址 + 营业时间 + Google Maps 链接）
- **ReviewCard** — Google/Trustpilot 评价卡
- **BrandLogo** — 品牌 Logo 灰度展示
- **ProductCard** — 产品/服务卡（图片 + 名称 + 价格 + 加入购物车）

### Section 组件（`components/fonfix/sections/`）

- **HeroSection** — 全宽蓝色背景 Hero，标题 + 副标题 + 设备选择器 CTA
- **HowItWorks** — 3 步图文流程
- **WhyChooseUs** — 6 格优势卡（认证/价格/保修/速度/评分/门店）
- **BusinessCTA** — 企业客户召回横幅
- **ReviewsSection** — Trustpilot 评分 + 评价卡轮播
- **BlogPreview** — 最新 3 篇博客预览
- **NewsletterSection** — 邮件订阅（mock submit → toast 提示）

---

## 3. 数据层

所有数据为静态 TypeScript 文件，无数据库读取。

| 文件 | 内容 |
|------|------|
| `data/fonfix/stores.ts` | 门店列表（名称、地址、坐标、营业时间） |
| `data/fonfix/faq.ts` | FAQ 问答对 |
| `data/fonfix/blog-posts.ts` | 博客文章（含 MDX 内容或 HTML 字符串） |
| `data/fonfix/products.ts` | 维修服务与价格（slug → 详情） |
| `data/fonfix/brands.ts` | 支持品牌列表（名称 + Logo） |

---

## 4. 设计 Token

在 `ierepair/app/globals.css` 追加 Fonfix CSS 变量（不影响现有变量）：

```css
/* Fonfix Design Tokens */
:root {
  --fonfix-blue: #0066B3;
  --fonfix-blue-dark: #004F8C;
  --fonfix-blue-light: #E8F2FA;
  --fonfix-footer-bg: #1E2A38;
  --fonfix-text: #1A1A1A;
  --fonfix-text-muted: #6B7280;
  --fonfix-border: #E5E7EB;
  --fonfix-radius: 8px;
}
```

Typography:
- 标题：Inter 700/800（无 Cal Sans，Fonfix 用 Inter Bold）
- 正文：Inter 400/500

---

## 5. 交互约定

| 功能 | 实现方式 |
|------|----------|
| 所有表单 | 前端校验 → 提交 → 成功 Dialog（不发真实请求） |
| 购物车 | React Context + localStorage，Cart Icon 显示数量角标 |
| 结账 | 填写表单 → 点提交 → "订单已收到"弹窗 |
| 聊天 Widget | 点击 → 浮动弹窗（mock，不接 livechat） |
| 公告栏关闭 | localStorage 记录，刷新不重现 |
| 404 | `app/(fonfix)/not-found.tsx` 品牌化 404 页 |

---

## 6. 首页结构

替换现有 `(consumer)/page.tsx`，新首页 `(fonfix)/page.tsx` 包含以下 Section（从上至下）：

1. HeroSection（品牌蓝背景，设备快速选择）
2. BrandLogos（支持品牌横排）
3. HowItWorks（3 步流程）
4. ServiceCard 网格（热门维修服务）
5. WhyChooseUs（6 格优势）
6. ReviewsSection（Trustpilot 评价）
7. BusinessCTA（企业客户横幅）
8. BlogPreview（最新博客）
9. NewsletterSection（订阅）

---

## 7. 不在范围内

- 真实支付集成
- 实时库存/价格查询
- 后台 CMS 管理
- 国际化（i18n）
- 真实 LiveChat 接入

---

## 8. 风险与约束

| 风险 | 缓解措施 |
|------|----------|
| 路由冲突（`/` 同时在两个 route group） | Next.js App Router 按文件系统优先级，`(fonfix)/page.tsx` 独立存在不冲突 |
| 组件命名与现有 `components/ui/` 冲突 | 所有 Fonfix 组件放 `components/fonfix/` 子目录隔离 |
| CSS 变量覆盖现有样式 | Fonfix 变量全部加 `--fonfix-` 前缀，不与现有变量重名 |
| 38+ 页面工作量大 | 先实现 Layout + 首页 + 5 个核心页，其余页面复用 Section 组件快速拼装 |
