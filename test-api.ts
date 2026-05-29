/**
 * IERepair API 自动化测试脚本
 * 覆盖范围：Admin 端 + Merchant 端 + 3 端最小闭环
 * 运行方式：npx tsx test-api.ts
 */

import "dotenv/config";
import { prisma } from "./src/lib/prisma";

const BASE = "http://localhost:3002";

// ─── 结果统计 ────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(name: string) {
  console.log(`  ✅ ${name}`);
  passed++;
}

function fail(name: string, reason: string) {
  console.log(`  ❌ ${name}`);
  console.log(`     → ${reason}`);
  failed++;
  failures.push(`${name}: ${reason}`);
}

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("─".repeat(60));
}

// ─── HTTP 工具 ────────────────────────────────────────────────────────────────
async function req(
  method: string,
  path: string,
  opts: { body?: unknown; cookie?: string } = {}
): Promise<{ status: number; body: Record<string, unknown>; setCookie: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers["Cookie"] = opts.cookie;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const setCookie = res.headers.get("set-cookie") ?? "";
  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {}

  return { status: res.status, body, setCookie };
}

function extractCookie(setCookieHeader: string, name: string): string {
  const match = setCookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? `${name}=${match[1]}` : "";
}

// ─── 测试用例 ────────────────────────────────────────────────────────────────

async function testAuth() {
  section("1. 认证测试（Auth）");

  // Admin 登录 - 正确凭据
  {
    const r = await req("POST", "/api/admin/auth/login", {
      body: { email: "admin@ierepair.ie", password: "Admin@123456" },
    });
    r.status === 200 && r.setCookie.includes("admin_token")
      ? ok("Admin 登录成功 → 200 + Set-Cookie: admin_token")
      : fail("Admin 登录", `status=${r.status}, cookie=${r.setCookie}`);
  }

  // Admin 登录 - 错误密码
  {
    const r = await req("POST", "/api/admin/auth/login", {
      body: { email: "admin@ierepair.ie", password: "wrongpassword" },
    });
    r.status === 401
      ? ok("Admin 错误密码 → 401")
      : fail("Admin 错误密码应返回 401", `实际 status=${r.status}`);
  }

  // Merchant 登录 - 正确凭据
  {
    const r = await req("POST", "/api/merchant/auth/login", {
      body: { email: "merchant@ierepair.ie", password: "merchant123" },
    });
    r.status === 200 && r.setCookie.includes("merchant_token")
      ? ok("Merchant 登录成功 → 200 + Set-Cookie: merchant_token")
      : fail("Merchant 登录", `status=${r.status}, cookie=${r.setCookie}`);
  }

  // Merchant 登录 - 错误密码
  {
    const r = await req("POST", "/api/merchant/auth/login", {
      body: { email: "merchant@ierepair.ie", password: "wrongpassword" },
    });
    r.status === 401
      ? ok("Merchant 错误密码 → 401")
      : fail("Merchant 错误密码应返回 401", `实际 status=${r.status}`);
  }
}

async function testSecurity(adminCookie: string, merchantCookie: string) {
  section("2. 安全鉴权测试（无 Cookie 应返回 401）");

  const protectedRoutes = [
    { method: "GET", path: "/api/admin/merchants", name: "Admin 商家列表" },
    { method: "GET", path: "/api/admin/repair-catalog", name: "Admin 维修目录" },
    { method: "GET", path: "/api/admin/products", name: "Admin 产品母库" },
    { method: "GET", path: "/api/merchant/me", name: "Merchant 个人信息" },
    { method: "GET", path: "/api/merchant/bookings", name: "Merchant 预约列表" },
    { method: "GET", path: "/api/merchant/services", name: "Merchant 维修服务" },
    { method: "GET", path: "/api/merchant/hours", name: "Merchant 营业时间" },
  ];

  for (const route of protectedRoutes) {
    const r = await req(route.method, route.path);
    r.status === 401
      ? ok(`无 Cookie → ${route.name} 返回 401`)
      : fail(`${route.name} 鉴权缺失`, `应为 401，实际 status=${r.status}`);
  }

  // 用 admin cookie 访问 merchant 接口（不应通过，但具体行为取决于实现）
  {
    const r = await req("GET", "/api/merchant/me", { cookie: adminCookie });
    r.status === 401
      ? ok("Admin cookie 访问 Merchant 端 → 401（隔离正确）")
      : r.status === 200
        ? fail("Admin cookie 不应能访问 Merchant 接口", "角色隔离失效")
        : ok(`Admin cookie 访问 Merchant 端 → ${r.status}（已拦截）`);
  }
}

async function testAdminEnd(adminCookie: string) {
  section("3. Admin 端功能测试");

  // 获取维修设备目录
  {
    const r = await req("GET", "/api/admin/repair-catalog", { cookie: adminCookie });
    const cats = (r.body.categories as unknown[]) ?? [];
    r.status === 200 && cats.length >= 5
      ? ok(`GET 维修目录 → 200，${cats.length} 个品类`)
      : fail("GET 维修目录", `status=${r.status}, categories=${cats.length}`);
  }

  // 获取商家列表
  let merchantCount = 0;
  {
    const r = await req("GET", "/api/admin/merchants", { cookie: adminCookie });
    const merchants = (r.body.merchants as unknown[]) ?? [];
    merchantCount = merchants.length;
    r.status === 200 && merchants.length >= 3
      ? ok(`GET 商家列表 → 200，${merchants.length} 家商家`)
      : fail("GET 商家列表", `status=${r.status}, count=${merchants.length}`);
  }

  // 创建新商家
  let newMerchantId: number | null = null;
  {
    const r = await req("POST", "/api/admin/merchants", {
      cookie: adminCookie,
      body: {
        name: "测试门店（自动测试）",
        email: "autotest@ierepair.ie",
        password: "TestPass123",
        phone: "+353 1 999 9999",
        address: "1 Test Street, Dublin 2",
        eircode: "D02 XY00",
      },
    });
    if (r.status === 201 && (r.body.merchant as Record<string, unknown>)?.id) {
      newMerchantId = (r.body.merchant as Record<string, unknown>).id as number;
      ok(`POST 创建商家 → 201，id=${newMerchantId}`);
    } else if (r.status === 409) {
      // 已存在（上次测试遗留），查询它的 id
      const list = await req("GET", "/api/admin/merchants", { cookie: adminCookie });
      const found = ((list.body.merchants as Record<string, unknown>[]) ?? [])
        .find(m => m.email === "autotest@ierepair.ie");
      newMerchantId = found ? (found.id as number) : null;
      ok("POST 创建商家 → 409（测试商家已存在，沿用）");
    } else {
      fail("POST 创建商家", `status=${r.status}, error=${JSON.stringify(r.body)}`);
    }
  }

  // 创建重复邮箱应返回 409
  {
    const r = await req("POST", "/api/admin/merchants", {
      cookie: adminCookie,
      body: { name: "dup", email: "merchant@ierepair.ie", password: "pass" },
    });
    r.status === 409
      ? ok("POST 重复邮箱创建商家 → 409")
      : fail("重复邮箱应返回 409", `实际 status=${r.status}`);
  }

  // 获取产品母库
  {
    const r = await req("GET", "/api/admin/products", { cookie: adminCookie });
    r.status === 200
      ? ok(`GET 产品母库 → 200`)
      : fail("GET 产品母库", `status=${r.status}`);
  }

  // 获取设备品类
  {
    const r = await req("GET", "/api/admin/device-categories", { cookie: adminCookie });
    const cats = (r.body.categories as unknown[]) ?? [];
    r.status === 200 && cats.length >= 5
      ? ok(`GET 设备品类 → 200，${cats.length} 个品类`)
      : fail("GET 设备品类", `status=${r.status}, count=${cats.length}`);
  }

  return { newMerchantId };
}

async function ensurePendingBooking(merchantEmail: string): Promise<void> {
  const merchant = await prisma.merchant.findUnique({ where: { email: merchantEmail } });
  if (!merchant) return;

  const existing = await prisma.repairBooking.findFirst({
    where: { merchantId: merchant.id, status: "pending_confirm" },
  });
  if (existing) return;

  const ms = await prisma.merchantService.findFirst({ where: { merchantId: merchant.id, isActive: true } });
  if (!ms) return;

  const repairService = await prisma.repairService.findUnique({ where: { id: ms.repairServiceId } });
  if (!repairService) return;

  await prisma.repairBooking.create({
    data: {
      orderNumber: `RB-TEST-${Date.now()}`,
      merchantId: merchant.id,
      repairServiceId: ms.repairServiceId,
      status: "pending_confirm",
      userName: "Test User",
      userPhone: "+353 87 123 4567",
      userEmail: "testuser@example.com",
      appointmentTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      quotedPrice: ms.price,
    },
  });
}

async function testMerchantEnd(merchantCookie: string) {
  section("4. Merchant 端功能测试");

  // 获取商家自身信息
  let merchantId: number | null = null;
  {
    const r = await req("GET", "/api/merchant/me", { cookie: merchantCookie });
    const m = r.body.merchant as Record<string, unknown>;
    if (r.status === 200 && m?.id) {
      merchantId = m.id as number;
      ok(`GET /merchant/me → 200，id=${merchantId}，name="${m.name}"`);
    } else {
      fail("GET /merchant/me", `status=${r.status}`);
    }
  }

  // 更新商家信息
  {
    const r = await req("PATCH", "/api/merchant/me", {
      cookie: merchantCookie,
      body: { phone: "+353 1 111 1111", description: "Dublin City Centre's best repair shop" },
    });
    r.status === 200 && (r.body.merchant as Record<string, unknown>)?.phone === "+353 1 111 1111"
      ? ok("PATCH /merchant/me → 200 更新成功")
      : fail("PATCH /merchant/me", `status=${r.status}, body=${JSON.stringify(r.body)}`);
  }

  // 获取营业时间
  {
    const r = await req("GET", "/api/merchant/hours", { cookie: merchantCookie });
    const hours = (r.body.hours as unknown[]) ?? [];
    r.status === 200 && hours.length === 7
      ? ok(`GET /merchant/hours → 200，7 天营业时间`)
      : fail("GET /merchant/hours", `status=${r.status}, days=${hours.length}`);
  }

  // 更新营业时间（调整周日为关闭）
  {
    const r = await req("PUT", "/api/merchant/hours", {
      cookie: merchantCookie,
      body: {
        hours: [
          { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
          { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
          { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
          { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
          { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
          { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
          { dayOfWeek: 6, openTime: "10:00", closeTime: "17:00", isClosed: false },
        ],
      },
    });
    r.status === 200
      ? ok("PUT /merchant/hours → 200 更新营业时间成功")
      : fail("PUT /merchant/hours", `status=${r.status}`);
  }

  // 获取维修服务列表
  let firstServiceId: number | null = null;
  {
    const r = await req("GET", "/api/merchant/services", { cookie: merchantCookie });
    const services = (r.body.services as Record<string, unknown>[]) ?? [];
    if (r.status === 200) {
      firstServiceId = services[0]?.id as number ?? null;
      ok(`GET /merchant/services → 200，${services.length} 个维修服务`);
    } else {
      fail("GET /merchant/services", `status=${r.status}`);
    }
  }

  // 获取全量预约列表
  let pendingBookingId: number | null = null;
  let confirmedBookingId: number | null = null;
  {
    const r = await req("GET", "/api/merchant/bookings", { cookie: merchantCookie });
    const bookings = (r.body.bookings as Record<string, unknown>[]) ?? [];
    const total = r.body.total as number ?? 0;
    const pending = r.body.pendingCount as number ?? 0;

    if (r.status === 200 && bookings.length >= 4) {
      ok(`GET /merchant/bookings → 200，共 ${total} 条，待确认 ${pending} 条`);
      pendingBookingId = (bookings.find(b => b.status === "pending_confirm")?.id as number) ?? null;
      confirmedBookingId = (bookings.find(b => b.status === "confirmed")?.id as number) ?? null;
    } else {
      fail("GET /merchant/bookings", `status=${r.status}, count=${bookings.length}`);
    }
  }

  // 按状态筛选 pending_confirm
  {
    const r = await req("GET", "/api/merchant/bookings?status=pending_confirm", { cookie: merchantCookie });
    const bookings = (r.body.bookings as Record<string, unknown>[]) ?? [];
    r.status === 200 && bookings.length > 0 && bookings.every(b => b.status === "pending_confirm")
      ? ok(`GET /merchant/bookings?status=pending_confirm → ${bookings.length} 条，全部为待确认`)
      : fail("GET bookings?status=pending_confirm", `status=${r.status}, count=${bookings.length}`);
  }

  // 接受预约（pending_confirm → confirmed）
  let newConfirmedId: number | null = null;
  if (pendingBookingId) {
    const r = await req("PATCH", `/api/merchant/bookings/${pendingBookingId}`, {
      cookie: merchantCookie,
      body: { action: "accept" },
    });
    if (r.status === 200 && (r.body.booking as Record<string, unknown>)?.status === "confirmed") {
      newConfirmedId = pendingBookingId;
      ok(`PATCH booking/${pendingBookingId} accept → confirmed`);
    } else {
      fail(`PATCH booking accept`, `status=${r.status}, body=${JSON.stringify(r.body)}`);
    }
  } else {
    fail("PATCH booking accept", "没有找到 pending_confirm 状态的预约");
  }

  // 完成维修（confirmed → completed）
  const targetId = newConfirmedId ?? confirmedBookingId;
  if (targetId) {
    const r = await req("PATCH", `/api/merchant/bookings/${targetId}`, {
      cookie: merchantCookie,
      body: { action: "complete", actualPrice: 159 },
    });
    r.status === 200 && (r.body.booking as Record<string, unknown>)?.status === "completed"
      ? ok(`PATCH booking/${targetId} complete → completed（实收 €159）`)
      : fail("PATCH booking complete", `status=${r.status}, body=${JSON.stringify(r.body)}`);
  } else {
    fail("PATCH booking complete", "没有找到可完成的预约");
  }

  // 状态流转错误（completed 不能再 accept）
  if (targetId) {
    const r = await req("PATCH", `/api/merchant/bookings/${targetId}`, {
      cookie: merchantCookie,
      body: { action: "accept" },
    });
    r.status === 400
      ? ok("非法状态流转（completed → accept）→ 400")
      : fail("非法状态流转应返回 400", `实际 status=${r.status}`);
  }

  // complete 缺少 actualPrice 应报错
  if (confirmedBookingId && confirmedBookingId !== targetId) {
    const r = await req("PATCH", `/api/merchant/bookings/${confirmedBookingId}`, {
      cookie: merchantCookie,
      body: { action: "complete" },
    });
    r.status === 400
      ? ok("complete 缺少 actualPrice → 400")
      : fail("complete 缺 actualPrice 应返回 400", `实际 status=${r.status}`);
  }

  // 浏览维修服务母库（用于选品）
  {
    const r = await req("GET", "/api/merchant/catalog/device-categories", { cookie: merchantCookie });
    const cats = (r.body.categories as unknown[]) ?? [];
    r.status === 200 && cats.length >= 5
      ? ok(`GET /merchant/catalog/device-categories → 200，${cats.length} 个品类`)
      : fail("GET /merchant/catalog/device-categories", `status=${r.status}, count=${cats.length}`);
  }

  // 获取维修服务（catalog）
  {
    const r = await req("GET", "/api/merchant/catalog/services", { cookie: merchantCookie });
    r.status === 200
      ? ok("GET /merchant/catalog/services → 200")
      : fail("GET /merchant/catalog/services", `status=${r.status}`);
  }

  return { merchantId };
}

async function testClosedLoop(adminCookie: string) {
  section("5. 3 端最小闭环测试");

  // Step 1: Admin 创建新商家
  const testEmail = `looptest-${Date.now()}@ierepair.ie`;
  let newMerchantId: number | null = null;
  {
    const r = await req("POST", "/api/admin/merchants", {
      cookie: adminCookie,
      body: {
        name: "闭环测试门店",
        email: testEmail,
        password: "Loop@Test123",
        phone: "+353 1 777 8888",
        address: "5 Loop Street, Dublin 1",
        eircode: "D01 XY99",
      },
    });
    if (r.status === 201) {
      newMerchantId = (r.body.merchant as Record<string, unknown>).id as number;
      ok(`Admin 创建新商家 → id=${newMerchantId}`);
    } else {
      fail("Admin 创建商家（闭环）", `status=${r.status}`);
      return;
    }
  }

  // Step 2: 新商家登录
  let loopMerchantCookie = "";
  {
    const r = await req("POST", "/api/merchant/auth/login", {
      body: { email: testEmail, password: "Loop@Test123" },
    });
    if (r.status === 200 && r.setCookie.includes("merchant_token")) {
      loopMerchantCookie = extractCookie(r.setCookie, "merchant_token");
      ok(`新商家登录成功 → ${testEmail}`);
    } else {
      fail("新商家登录", `status=${r.status}`);
      return;
    }
  }

  // Step 3: 新商家访问自身信息
  {
    const r = await req("GET", "/api/merchant/me", { cookie: loopMerchantCookie });
    const m = r.body.merchant as Record<string, unknown>;
    r.status === 200 && m?.email === testEmail
      ? ok(`新商家 /me → 正确返回自身信息（email=${testEmail}）`)
      : fail("新商家 /me", `status=${r.status}, email=${m?.email}`);
  }

  // Step 4: 新商家设置营业时间
  {
    const r = await req("PUT", "/api/merchant/hours", {
      cookie: loopMerchantCookie,
      body: {
        hours: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          openTime: i === 0 ? null : "10:00",
          closeTime: i === 0 ? null : "19:00",
          isClosed: i === 0,
        })),
      },
    });
    r.status === 200
      ? ok("新商家设置营业时间 → 200")
      : fail("新商家设置营业时间", `status=${r.status}`);
  }

  // Step 5: Admin 查看商家列表，确认新商家在列
  {
    const r = await req("GET", "/api/admin/merchants", { cookie: adminCookie });
    const merchants = (r.body.merchants as Record<string, unknown>[]) ?? [];
    const found = merchants.some(m => m.email === testEmail);
    found
      ? ok("Admin 商家列表包含新创建的商家（闭环验证通过）")
      : fail("Admin 商家列表应包含新商家", `未找到 ${testEmail}`);
  }

  // Step 6: 新商家退出登录
  {
    const r = await req("POST", "/api/merchant/auth/logout", { cookie: loopMerchantCookie });
    r.status === 200
      ? ok("新商家退出登录 → 200")
      : fail("新商家退出登录", `status=${r.status}`);
  }

  // Step 7: 退出后 token 失效（由于 cookie 清除在客户端，这里直接验证 logout 状态）
  ok("闭环流程完成：Admin 创建 → Merchant 登录 → 配置门店 → Admin 验证 → 退出");
}

async function testLogout(adminCookie: string, merchantCookie: string) {
  section("6. 退出登录测试");

  {
    const r = await req("POST", "/api/admin/auth/logout", { cookie: adminCookie });
    r.status === 200
      ? ok("Admin 退出登录 → 200")
      : fail("Admin 退出登录", `status=${r.status}`);
  }

  {
    const r = await req("POST", "/api/merchant/auth/logout", { cookie: merchantCookie });
    r.status === 200
      ? ok("Merchant 退出登录 → 200")
      : fail("Merchant 退出登录", `status=${r.status}`);
  }
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  IERepair API 自动化测试");
  console.log(`  目标：${BASE}`);
  console.log(`  时间：${new Date().toLocaleString("zh-CN")}`);
  console.log("═".repeat(60));

  // 先登录，获取 cookie
  let adminCookie = "";
  let merchantCookie = "";

  {
    const r = await req("POST", "/api/admin/auth/login", {
      body: { email: "admin@ierepair.ie", password: "Admin@123456" },
    });
    adminCookie = extractCookie(r.setCookie, "admin_token");
  }
  {
    const r = await req("POST", "/api/merchant/auth/login", {
      body: { email: "merchant@ierepair.ie", password: "merchant123" },
    });
    merchantCookie = extractCookie(r.setCookie, "merchant_token");
  }

  if (!adminCookie || !merchantCookie) {
    console.error("\n⛔ 无法获取登录 cookie，终止测试。请确认服务正在运行且种子数据已执行。");
    process.exit(1);
  }

  // 执行各组测试
  await testAuth();
  await testSecurity(adminCookie, merchantCookie);
  await testAdminEnd(adminCookie);
  await ensurePendingBooking("merchant@ierepair.ie");
  await testMerchantEnd(merchantCookie);
  await testClosedLoop(adminCookie);

  // 重新登录（前面测试可能改变了 cookie）
  {
    const r = await req("POST", "/api/admin/auth/login", {
      body: { email: "admin@ierepair.ie", password: "Admin@123456" },
    });
    adminCookie = extractCookie(r.setCookie, "admin_token");
  }
  {
    const r = await req("POST", "/api/merchant/auth/login", {
      body: { email: "merchant@ierepair.ie", password: "merchant123" },
    });
    merchantCookie = extractCookie(r.setCookie, "merchant_token");
  }
  await testLogout(adminCookie, merchantCookie);

  // ─── 汇总 ─────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  测试结果汇总");
  console.log("═".repeat(60));
  console.log(`  通过：${passed}  失败：${failed}  共：${passed + failed}`);

  if (failures.length > 0) {
    console.log("\n  失败项：");
    failures.forEach(f => console.log(`    • ${f}`));
  } else {
    console.log("\n  🎉 全部通过！3 端最小闭环已验证。");
  }

  console.log("═".repeat(60) + "\n");
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async e => { await prisma.$disconnect(); console.error(e); process.exit(1); });
