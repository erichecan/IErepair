import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Public APIs · 无需登录", () => {
  test("GET /api/v1/public/search 返回维修服务", async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/v1/public/search?q=iPhone`);
    expect(res.status()).toBe(200);
  });

  test("GET /api/v1/merchant/products/catalog 返回平台目录", async ({ page }) => {
    // This should return 401 if not logged in — just verify it doesn't 500
    const res = await page.request.get(`${BASE}/api/v1/merchant/products/catalog`);
    expect([200, 401]).toContain(res.status());
  });

  test("Demo 页面正常加载", async ({ page }) => {
    await page.goto(BASE + "/demo");
    await expect(page).toHaveTitle(/体验|Demo|IERepair/i);
    await expect(page.locator("table")).toBeVisible({ timeout: 8000 });
    // Should have 3 columns
    const headers = page.locator("thead th");
    await expect(headers).toHaveCount(3);
  });

  test("Demo 页面三列标题正确", async ({ page }) => {
    await page.goto(BASE + "/demo");
    const headers = page.locator("thead th");
    const texts = await headers.allTextContents();
    expect(texts[0]).toMatch(/端|流程/);
    expect(texts[1]).toMatch(/操作/);
    expect(texts[2]).toMatch(/预期|结果/);
  });

  test("Demo 页面包含全部三个端标签", async ({ page }) => {
    await page.goto(BASE + "/demo");
    await expect(page.locator("body")).toContainText("用户端");
    await expect(page.locator("body")).toContainText("商家端");
    await expect(page.locator("body")).toContainText("管理端");
  });

  test("Demo 页面一键登录按钮存在", async ({ page }) => {
    await page.goto(BASE + "/demo");
    const loginBtns = page.locator('button:has-text("一键登录")');
    const count = await loginBtns.count();
    expect(count).toBeGreaterThanOrEqual(4); // merchant1/2/3 + admin
  });

  test("/repair/browse 页面不报 500", async ({ page }) => {
    const res = await page.request.get(`${BASE}/repair/browse`);
    expect(res.status()).toBe(200);
  });

  test("/auth/login 页面加载", async ({ page }) => {
    const res = await page.request.get(`${BASE}/auth/login`);
    expect([200, 307, 302]).toContain(res.status());
  });
});

test.describe("Security · 未授权访问受保护路由", () => {
  test("未登录 GET /api/v1/merchant/bookings 返回 401", async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.request.get(`${BASE}/api/v1/merchant/bookings`);
    expect(res.status()).toBe(401);
  });

  test("未登录 GET /api/v1/merchant/finance 返回 401", async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.request.get(`${BASE}/api/v1/merchant/finance`);
    expect(res.status()).toBe(401);
  });

  test("未登录 GET /api/v1/admin/finance 返回 401", async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.request.get(`${BASE}/api/v1/admin/finance`);
    expect(res.status()).toBe(401);
  });

  test("未登录 GET /api/v1/admin/merchants 返回 401", async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.request.get(`${BASE}/api/v1/admin/merchants`);
    expect(res.status()).toBe(401);
  });

  test("Merchant token 不可访问 admin 路由", async ({ page }) => {
    // Login as merchant
    const loginRes = await page.request.post(`${BASE}/api/v1/auth/merchant/login`, {
      data: { email: "merchant1@ierepair.ie", password: "Merchant2024!" },
    });
    expect(loginRes.status()).toBe(200);
    // Now try admin endpoint with merchant cookie
    const res = await page.request.get(`${BASE}/api/v1/admin/finance`);
    expect(res.status()).toBe(403);
  });
});
