import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

async function adminLogin(page: import("@playwright/test").Page) {
  const res = await page.request.post(`${BASE}/api/v1/auth/admin/login`, {
    data: { email: "admin@ierepair.ie", password: "IERepair2024!" },
  });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.success).toBe(true);
}

test.describe("Admin · 登录", () => {
  test("admin 登录成功，cookie 已设置", async ({ page }) => {
    await adminLogin(page);
    await page.goto(BASE + "/admin/merchants");
    await expect(page).not.toHaveURL(/admin\/login/i, { timeout: 6000 });
  });

  test("错误密码返回 401", async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/v1/auth/admin/login`, {
      data: { email: "admin@ierepair.ie", password: "wrongpassword" },
    });
    expect(res.status()).toBe(401);
  });

  test("未登录访问 /admin 被重定向", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(BASE + "/admin/merchants");
    await expect(page).toHaveURL(/admin\/login|\/login/i, { timeout: 6000 });
  });
});

test.describe("Admin · 商家管理", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("/admin/merchants 加载商家列表", async ({ page }) => {
    await page.goto(BASE + "/admin/merchants");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("商家管理 API 返回商家列表", async ({ page }) => {
    await adminLogin(page);
    const res = await page.request.get(`${BASE}/api/v1/admin/merchants`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    // API returns { success: true, data: [...] }
    const list = json.data ?? json;
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });
});

test.describe("Admin · 产品审核", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("/admin/products 加载产品列表", async ({ page }) => {
    await page.goto(BASE + "/admin/products");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("产品 API 返回数据", async ({ page }) => {
    await adminLogin(page);
    const res = await page.request.get(`${BASE}/api/v1/admin/products`);
    expect(res.status()).toBe(200);
  });
});

test.describe("Admin · 财务监控", () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
  });

  test("/admin/finance 加载平台财务页", async ({ page }) => {
    await page.goto(BASE + "/admin/finance");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("平台财务 API 返回汇总数据", async ({ page }) => {
    await adminLogin(page);
    const res = await page.request.get(`${BASE}/api/v1/admin/finance`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveProperty("totalRepairRevenue");
    expect(json.data).toHaveProperty("totalCommission");
  });
});
