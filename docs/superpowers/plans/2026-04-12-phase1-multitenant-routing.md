# Phase 1: Multi-Tenant Routing + Store Public Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让每个门店拥有独立子域名（`store1.ierepair.ie`）或自定义域名（`repairs.john.ie`），访问时自动展示该门店的品牌和产品，总部官网（`ierepair.ie`）展示全平台内容。

**Architecture:** Next.js middleware 读取 `host` header，提取子域名或匹配自定义域名，将 `x-tenant-slug` 注入请求头。Server Components 通过 `headers()` 读取租户标识，查询该门店数据并渲染门店特定页面。HQ 模式（无租户标识）展示全平台聚合视图。

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Neon PostgreSQL, Vitest（新增）

---

## 文件清单

| 操作 | 文件 | 职责 |
|------|------|------|
| 新增 | `ierepair/middleware.ts` | 解析 hostname → 注入 x-tenant-slug header |
| 修改 | `ierepair/lib/db/schema/merchants.ts` | 新增 customDomain 字段 |
| 新增 | `ierepair/drizzle/0001_add_custom_domain.sql` | 数据库迁移 |
| 新增 | `ierepair/lib/tenant.ts` | getTenant() — 从 headers 解析当前租户 |
| 修改 | `ierepair/lib/db/queries/merchants.ts` | 新增 getMerchantByCustomDomain() |
| 修改 | `ierepair/app/(consumer)/layout.tsx` | 租户感知导航栏（店名/Logo vs IERepair） |
| 修改 | `ierepair/app/(consumer)/page.tsx` | HQ 首页 vs 门店首页分支渲染 |
| 新增 | `ierepair/app/(consumer)/store/page.tsx` | 门店首页组件（品牌+产品+预约入口） |
| 修改 | `ierepair/lib/db/queries/repair.ts` | 所有查询加 merchantId 可选过滤参数 |
| 新增 | `ierepair/vitest.config.ts` | Vitest 配置 |
| 新增 | `ierepair/lib/__tests__/tenant.test.ts` | tenant 解析单元测试 |
| 新增 | `ierepair/middleware.test.ts` | middleware hostname 解析测试 |
| 修改 | `ierepair/next.config.ts` | 添加多域名 serverActions allowedOrigins |

---

## Task 1: 安装 Vitest 并配置

**Files:**
- Create: `ierepair/vitest.config.ts`

- [ ] **Step 1: 安装依赖**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 2: 创建 vitest.config.ts**

```typescript
// ierepair/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
});
```

- [ ] **Step 3: 在 package.json scripts 中加入测试命令**

在 `ierepair/package.json` 的 `"scripts"` 里加入：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 确认 Vitest 可以运行**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test
```

Expected: 无测试文件时显示 "No test files found"，无报错。

- [ ] **Step 5: Commit**

```bash
git add ierepair/vitest.config.ts ierepair/package.json
git commit -m "chore: add vitest test runner"
```

---

## Task 2: 数据库 schema 新增 customDomain 字段

**Files:**
- Modify: `ierepair/lib/db/schema/merchants.ts`
- Create: `ierepair/drizzle/0001_add_custom_domain.sql`

- [ ] **Step 1: 在 merchants schema 中加入 customDomain 字段**

在 `ierepair/lib/db/schema/merchants.ts` 的 `merchants` table 定义中，`stripeAccountId` 字段之后加入：

```typescript
customDomain: varchar("custom_domain", { length: 255 }).unique(),
```

完整字段位置（加在 stripeAccountId 那行之后）：
```typescript
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  customDomain:    varchar("custom_domain", { length: 255 }).unique(),
  businessHours: jsonb("business_hours").$type<BusinessHours>(),
```

- [ ] **Step 2: 创建 SQL 迁移文件**

```sql
-- ierepair/drizzle/0001_add_custom_domain.sql
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_merchants_custom_domain ON merchants(custom_domain);
```

- [ ] **Step 3: 执行迁移**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npx drizzle-kit push
```

Expected: 成功输出，无错误。

- [ ] **Step 4: Commit**

```bash
git add ierepair/lib/db/schema/merchants.ts ierepair/drizzle/0001_add_custom_domain.sql
git commit -m "feat: add customDomain field to merchants schema"
```

---

## Task 3: 新增 getMerchantByCustomDomain 查询

**Files:**
- Modify: `ierepair/lib/db/queries/merchants.ts`
- Create: `ierepair/lib/__tests__/tenant.test.ts`（测试文件占位，Task 5 填充）

- [ ] **Step 1: 在 merchants.ts 末尾加入新查询函数**

```typescript
// 在 ierepair/lib/db/queries/merchants.ts 末尾追加：

export async function getMerchantByCustomDomain(domain: string) {
  return db.query.merchants.findFirst({
    where: eq(merchants.customDomain, domain),
  });
}

export async function getAllActiveMerchants() {
  return db.query.merchants.findMany({
    where: eq(merchants.status, "active"),
    columns: {
      id: true,
      slug: true,
      shopName: true,
      logoUrl: true,
      city: true,
      address: true,
      rating: true,
      reviewCount: true,
    },
  });
}
```

注意：需要在文件顶部的 import 中确认 `merchants` 表已被导入（已存在）。

- [ ] **Step 2: Commit**

```bash
git add ierepair/lib/db/queries/merchants.ts
git commit -m "feat: add getMerchantByCustomDomain and getAllActiveMerchants queries"
```

---

## Task 4: 创建 middleware.ts — hostname 解析

**Files:**
- Create: `ierepair/middleware.ts`
- Create: `ierepair/middleware.test.ts`

- [ ] **Step 1: 先写失败测试**

```typescript
// ierepair/middleware.test.ts
import { describe, it, expect } from "vitest";
import { parseTenantSlug } from "./middleware";

describe("parseTenantSlug", () => {
  const ROOT = "ierepair.ie";

  it("returns null for root domain", () => {
    expect(parseTenantSlug("ierepair.ie", ROOT)).toBeNull();
  });

  it("returns null for www subdomain", () => {
    expect(parseTenantSlug("www.ierepair.ie", ROOT)).toBeNull();
  });

  it("extracts subdomain slug", () => {
    expect(parseTenantSlug("fitzwilliam.ierepair.ie", ROOT)).toBe("fitzwilliam");
  });

  it("handles localhost in dev", () => {
    expect(parseTenantSlug("localhost", ROOT)).toBeNull();
  });

  it("handles localhost with port", () => {
    expect(parseTenantSlug("localhost:3000", ROOT)).toBeNull();
  });

  it("returns custom domain marker for unknown domains", () => {
    expect(parseTenantSlug("repairs.john.ie", ROOT)).toBe("__custom__repairs.john.ie");
  });

  it("strips port from hostname before parsing", () => {
    expect(parseTenantSlug("fitzwilliam.ierepair.ie:3000", ROOT)).toBe("fitzwilliam");
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test middleware.test.ts
```

Expected: FAIL — `parseTenantSlug` is not exported.

- [ ] **Step 3: 创建 middleware.ts**

```typescript
// ierepair/middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "ierepair.ie";

/**
 * Pure function — exported for testing.
 * Returns:
 *   null                     → HQ mode (no tenant)
 *   "slug"                   → store subdomain slug
 *   "__custom__domain.ie"    → custom domain (needs DB lookup)
 */
export function parseTenantSlug(host: string, rootDomain: string): string | null {
  // Strip port
  const hostname = host.replace(/:\d+$/, "");

  // localhost or IP → HQ mode in development
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  // Root domain or www
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return null;
  }

  // Subdomain of root domain
  if (hostname.endsWith(`.${rootDomain}`)) {
    const subdomain = hostname.slice(0, hostname.length - rootDomain.length - 1);
    // Skip admin and merchant portals
    if (subdomain === "admin" || subdomain === "merchant") return null;
    return subdomain;
  }

  // Custom domain
  return `__custom__${hostname}`;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const tenantSlug = parseTenantSlug(host, ROOT_DOMAIN);

  const requestHeaders = new Headers(req.headers);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
```

- [ ] **Step 4: 运行测试，确认全部通过**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test middleware.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add ierepair/middleware.ts ierepair/middleware.test.ts
git commit -m "feat: add multi-tenant hostname middleware with parseTenantSlug"
```

---

## Task 5: 创建 lib/tenant.ts — 租户上下文

**Files:**
- Create: `ierepair/lib/tenant.ts`
- Create: `ierepair/lib/__tests__/tenant.test.ts`

- [ ] **Step 1: 先写测试（mock DB 层）**

```typescript
// ierepair/lib/__tests__/tenant.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB queries
vi.mock("@/lib/db/queries/merchants", () => ({
  getMerchantBySlug: vi.fn(),
  getMerchantByCustomDomain: vi.fn(),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { getTenant, isHQMode } from "@/lib/tenant";
import { getMerchantBySlug, getMerchantByCustomDomain } from "@/lib/db/queries/merchants";
import { headers } from "next/headers";

const mockMerchant = {
  id: "merchant-1",
  slug: "fitzwilliam",
  shopName: "Fitzwilliam Repairs",
  status: "active" as const,
  logoUrl: null,
  customDomain: null,
};

describe("getTenant", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no x-tenant-slug header (HQ mode)", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => null } as any);
    const result = await getTenant();
    expect(result).toBeNull();
  });

  it("resolves merchant by slug", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => "fitzwilliam" } as any);
    vi.mocked(getMerchantBySlug).mockResolvedValue(mockMerchant as any);
    const result = await getTenant();
    expect(getMerchantBySlug).toHaveBeenCalledWith("fitzwilliam");
    expect(result).toEqual(mockMerchant);
  });

  it("resolves merchant by custom domain", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => "__custom__repairs.john.ie" } as any);
    vi.mocked(getMerchantByCustomDomain).mockResolvedValue(mockMerchant as any);
    const result = await getTenant();
    expect(getMerchantByCustomDomain).toHaveBeenCalledWith("repairs.john.ie");
    expect(result).toEqual(mockMerchant);
  });

  it("returns null if slug resolves to no merchant", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => "nonexistent" } as any);
    vi.mocked(getMerchantBySlug).mockResolvedValue(undefined as any);
    const result = await getTenant();
    expect(result).toBeNull();
  });
});

describe("isHQMode", () => {
  it("returns true when no x-tenant-slug", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => null } as any);
    expect(await isHQMode()).toBe(true);
  });

  it("returns false when x-tenant-slug is present", async () => {
    vi.mocked(headers).mockReturnValue({ get: () => "fitzwilliam" } as any);
    vi.mocked(getMerchantBySlug).mockResolvedValue(mockMerchant as any);
    expect(await isHQMode()).toBe(false);
  });
});
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test lib/__tests__/tenant.test.ts
```

Expected: FAIL — `@/lib/tenant` not found.

- [ ] **Step 3: 创建 lib/tenant.ts**

```typescript
// ierepair/lib/tenant.ts
import { headers } from "next/headers";
import { getMerchantBySlug, getMerchantByCustomDomain } from "@/lib/db/queries/merchants";
import type { Merchant } from "@/lib/db/schema/merchants";

/**
 * Reads x-tenant-slug from request headers (set by middleware).
 * Returns the matching Merchant or null (HQ mode).
 * Call this in Server Components only.
 */
export async function getTenant(): Promise<Merchant | null> {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) return null;

  if (tenantSlug.startsWith("__custom__")) {
    const domain = tenantSlug.slice(10);
    return (await getMerchantByCustomDomain(domain)) ?? null;
  }

  return (await getMerchantBySlug(tenantSlug)) ?? null;
}

/**
 * Returns true when the request is for the HQ root domain.
 */
export async function isHQMode(): Promise<boolean> {
  const tenant = await getTenant();
  return tenant === null;
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test lib/__tests__/tenant.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add ierepair/lib/tenant.ts ierepair/lib/__tests__/tenant.test.ts
git commit -m "feat: add getTenant() and isHQMode() tenant context utilities"
```

---

## Task 6: 租户感知 Consumer Layout

**Files:**
- Modify: `ierepair/app/(consumer)/layout.tsx`

目标：当访问门店子域名时，导航栏显示门店名称和 Logo；访问总部时显示 IERepair。

- [ ] **Step 1: 修改 layout.tsx**

将 `ierepair/app/(consumer)/layout.tsx` 完整替换为：

```typescript
import Link from "next/link";
import Image from "next/image";
import { Search, Store, Wrench, User } from "lucide-react";
import { getTenant } from "@/lib/tenant";

export default async function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();

  const brandName = tenant?.shopName ?? "IERepair";
  const logoUrl   = tenant?.logoUrl ?? null;
  const brandHref = "/";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 h-14 flex items-center justify-between">
          <Link href={brandHref} className="flex items-center gap-2">
            {logoUrl ? (
              <Image src={logoUrl} alt={brandName} width={32} height={32} className="rounded" />
            ) : null}
            <span
              className="font-bold text-[#242424] text-lg tracking-tight"
              style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
            >
              {brandName}
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavItem href="/repair"  label="Repair"  />
            {!tenant && <NavItem href="/search?type=merchant" label="Stores" />}
            {!tenant && <NavItem href="/search" label="Search" />}
            <NavItem href="/account" label="Account" />
          </nav>

          <Link
            href="/repair/browse"
            className="px-4 py-2 bg-[#242424] text-white text-sm font-semibold rounded-lg hover:opacity-80 transition-opacity"
          >
            Book Repair
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0 w-full">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[rgba(34,42,53,0.08)] z-50">
        <div className="flex items-center justify-around py-2">
          <MobileNavItem href="/repair"   icon={<Wrench size={22} />} label="Repair"  />
          {!tenant && <MobileNavItem href="/search?type=merchant" icon={<Store size={22} />} label="Stores" />}
          {!tenant && <MobileNavItem href="/search" icon={<Search size={22} />} label="Search" />}
          <MobileNavItem href="/account" icon={<User size={22} />}   label="Account" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#f5f5f5] transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-[#898989] hover:text-[#242424] transition-colors min-w-[44px] min-h-[44px] justify-center"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
```

- [ ] **Step 2: 本地验证**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm run dev
```

访问 `http://localhost:3000` — 应显示 "IERepair" 品牌（HQ 模式）。

- [ ] **Step 3: Commit**

```bash
git add "ierepair/app/(consumer)/layout.tsx"
git commit -m "feat: make consumer layout tenant-aware (store branding vs HQ)"
```

---

## Task 7: 门店首页组件

**Files:**
- Create: `ierepair/app/(consumer)/store/page.tsx`
- Modify: `ierepair/app/(consumer)/page.tsx`

门店首页展示：门店介绍 + 上架的维修服务 + 上架的配件 + 预约按钮。

- [ ] **Step 1: 创建门店首页查询**

在 `ierepair/lib/db/queries/merchants.ts` 末尾追加：

```typescript
export async function getMerchantStorefront(merchantId: string) {
  const [services, products] = await Promise.all([
    db.query.merchantServices.findMany({
      where: and(
        eq(merchantServices.merchantId, merchantId),
        eq(merchantServices.isAvailable, true),
      ),
      with: {
        repairService: {
          columns: {
            name: true,
            slug: true,
            deviceBrand: true,
            deviceModel: true,
            imageUrl: true,
            estimatedMin: true,
          },
        },
      },
      limit: 12,
    }),
    db.query.merchantProducts.findMany({
      where: and(
        eq(merchantProducts.merchantId, merchantId),
        eq(merchantProducts.isAvailable, true),
      ),
      with: {
        product: {
          columns: {
            name: true,
            slug: true,
            imageUrls: true,
            type: true,
          },
        },
      },
      limit: 12,
    }),
  ]);
  return { services, products };
}
```

需要在文件顶部 import 中加入：
```typescript
import { and, eq } from "drizzle-orm";
import { merchantServices } from "../schema/repair-services";
import { merchantProducts } from "../schema/products";
```

- [ ] **Step 2: 创建门店首页**

```typescript
// ierepair/app/(consumer)/store/page.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";
import { getTenant } from "@/lib/tenant";
import { getMerchantStorefront } from "@/lib/db/queries/merchants";
import { notFound } from "next/navigation";

export default async function StorePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { services, products } = await getMerchantStorefront(tenant.id);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Hero */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-[#242424]" style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>
          {tenant.shopName}
        </h1>
        <div className="flex flex-wrap gap-4 text-[#898989] text-sm">
          {tenant.address && (
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {tenant.address}
            </span>
          )}
          {tenant.phone && (
            <span className="flex items-center gap-1">
              <Phone size={14} /> {tenant.phone}
            </span>
          )}
        </div>
        {tenant.description && (
          <p className="text-[#898989] max-w-2xl">{tenant.description}</p>
        )}
        <Link
          href="/repair/browse"
          className="inline-block px-6 py-3 bg-[#242424] text-white font-semibold rounded-lg hover:opacity-80 transition-opacity"
        >
          Book a Repair
        </Link>
      </section>

      {/* Repair Services */}
      {services.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#242424]" style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>
            Repair Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="rounded-xl p-4 space-y-2"
                style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 4px 12px" }}
              >
                <div className="text-sm font-medium text-[#242424]">{s.repairService.name}</div>
                <div className="text-xs text-[#898989]">
                  {s.repairService.deviceBrand} {s.repairService.deviceModel}
                </div>
                <div className="text-sm font-bold text-[#e05c2a]">€{Number(s.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accessories */}
      {products.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#242424]" style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>
            Accessories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-4 space-y-2"
                style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 4px 12px" }}
              >
                {p.product.imageUrls?.[0] && (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-[#f8f8f8]">
                    <Image src={p.product.imageUrls[0]} alt={p.product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="text-sm font-medium text-[#242424]">{p.product.name}</div>
                <div className="text-sm font-bold text-[#e05c2a]">€{Number(p.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 修改 app/(consumer)/page.tsx — 根据租户分支渲染**

在 `ierepair/app/(consumer)/page.tsx` 顶部，加入租户检测并重定向门店访客到门店首页：

```typescript
// 在现有 page.tsx 顶部 import 后加入：
import { getTenant } from "@/lib/tenant";
import { redirect } from "next/navigation";

// 在 export default async function Page() 函数体最开始加入：
const tenant = await getTenant();
if (tenant) {
  redirect("/store");
}
```

- [ ] **Step 4: 运行 build 确认无错误**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm run build
```

Expected: 成功完成，无 TypeScript 错误。

- [ ] **Step 5: Commit**

```bash
git add "ierepair/app/(consumer)/store/page.tsx" "ierepair/app/(consumer)/page.tsx" ierepair/lib/db/queries/merchants.ts
git commit -m "feat: add store homepage with services/accessories, HQ page redirects tenant to /store"
```

---

## Task 8: 更新 next.config.ts 支持多域名

**Files:**
- Modify: `ierepair/next.config.ts`

- [ ] **Step 1: 更新 allowedOrigins 并加入 hostname remapping**

将 `ierepair/next.config.ts` 替换为：

```typescript
import type { NextConfig } from "next";
import path from "path";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "ierepair.ie";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.ierepair.ie" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        ROOT_DOMAIN,
        `*.${ROOT_DOMAIN}`,
        "ierepair-549968261036.asia-east1.run.app",
        "ierepair-549968261036.europe-west1.run.app",
        "ierepair-549968261036.us-central1.run.app",
      ],
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add ierepair/next.config.ts
git commit -m "feat: update next.config to support multi-domain Server Actions"
```

---

## Task 9: 本地端对端验证

- [ ] **Step 1: 运行全量测试**

```bash
cd /Volumes/datacenter/ericworkspace/IErepair/ierepair
npm test
```

Expected: 所有测试通过（middleware + tenant 共 12 个测试）。

- [ ] **Step 2: 启动开发服务**

```bash
npm run dev
```

- [ ] **Step 3: 验证 HQ 模式**

访问 `http://localhost:3000` — 应显示：
- 导航栏品牌名 "IERepair"
- 正常 HQ 首页内容（不重定向到 /store）

- [ ] **Step 4: 模拟门店访问（修改 hosts 文件测试）**

在 `/etc/hosts` 临时添加：
```
127.0.0.1 fitzwilliam.localhost
```

访问 `http://fitzwilliam.localhost:3000` — 应显示：
- 导航栏品牌名显示该门店名称（如数据库中有数据）
- 自动跳转到 /store 显示门店首页

- [ ] **Step 5: 运行 build 最终确认**

```bash
npm run build
```

Expected: Build 成功，无错误。

- [ ] **Step 6: 最终 commit**

```bash
git add -A
git commit -m "feat(phase-1): complete multi-tenant routing — subdomains + custom domains"
```

---

## 验收标准

- [ ] `npm test` 全部通过（middleware 7个 + tenant 5个）
- [ ] `http://localhost:3000` 展示 IERepair HQ 页面，无 /store 重定向
- [ ] 门店子域名访问自动跳转 /store，显示门店品牌
- [ ] `npm run build` 无错误
- [ ] `customDomain` 字段已在数据库中存在（`\d merchants` 可见）
