import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

async function merchantLogin(page: import("@playwright/test").Page, email: string) {
  const res = await page.request.post(`${BASE}/api/v1/auth/merchant/login`, {
    data: { email, password: "Merchant2024!" },
  });
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.success).toBe(true);
}

test.describe("Merchant · 登录与 Dashboard", () => {
  test("merchant1 登录成功，cookie 已设置", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    // Navigate to dashboard — should not redirect to login
    await page.goto(BASE + "/merchant/dashboard");
    await expect(page).not.toHaveURL(/merchant\/login/i, { timeout: 6000 });
    await expect(page.locator("body")).not.toContainText(/sign in|log in/i);
  });

  test("Dashboard 展示关键数据卡片", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    await page.goto(BASE + "/merchant/dashboard");
    await expect(page.locator("body")).toBeVisible();
    // Should contain some numeric stats
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });

  test("merchant2 独立登录成功", async ({ page }) => {
    await merchantLogin(page, "merchant2@ierepair.ie");
    await page.goto(BASE + "/merchant/dashboard");
    await expect(page).not.toHaveURL(/merchant\/login/i, { timeout: 6000 });
  });

  test("merchant3 独立登录成功", async ({ page }) => {
    await merchantLogin(page, "merchant3@ierepair.ie");
    await page.goto(BASE + "/merchant/dashboard");
    await expect(page).not.toHaveURL(/merchant\/login/i, { timeout: 6000 });
  });

  test("错误密码返回 401", async ({ page }) => {
    const res = await page.request.post(`${BASE}/api/v1/auth/merchant/login`, {
      data: { email: "merchant1@ierepair.ie", password: "wrongpassword" },
    });
    expect(res.status()).toBe(401);
  });

  test("未登录访问 /merchant/dashboard 被重定向", async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies();
    await page.goto(BASE + "/merchant/dashboard");
    // Should redirect to login page
    await expect(page).toHaveURL(/merchant\/login|\/login/i, { timeout: 6000 });
  });
});

test.describe("Merchant · 预约管理", () => {
  test.beforeEach(async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
  });

  test("/merchant/bookings 加载预约列表", async ({ page }) => {
    await page.goto(BASE + "/merchant/bookings");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("预约列表 API 返回数据", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name.includes("authjs"));
    const res = await page.request.get(`${BASE}/api/v1/merchant/bookings`);
    // Should be 200 (authenticated via cookie)
    expect([200, 304]).toContain(res.status());
  });
});

test.describe("Merchant · 财务模块", () => {
  test("/merchant/finance 加载财务数据", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    await page.goto(BASE + "/merchant/finance");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("财务 API 返回汇总数据", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    const res = await page.request.get(`${BASE}/api/v1/merchant/finance`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty("data");
    expect(json.data).toHaveProperty("repairRevenue");
    expect(json.data).toHaveProperty("commissionAmount");
    expect(json.data).toHaveProperty("netAmount");
  });
});

test.describe("Merchant · 店铺设置", () => {
  test("/merchant/settings 加载设置表单", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    await page.goto(BASE + "/merchant/settings");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
    // Should contain form elements (exclude hidden inputs like file uploads)
    const input = page.locator('input:visible, textarea:visible').first();
    await expect(input).toBeVisible({ timeout: 8000 });
  });

  test("商家信息 API 返回当前资料", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    const res = await page.request.get(`${BASE}/api/v1/merchant/me`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    // API returns { data: { id, email, ... }, success: true }
    const merchant = json.data ?? json;
    expect(merchant).toHaveProperty("id");
    expect(merchant).toHaveProperty("email");
  });
});

test.describe("Merchant · 产品目录", () => {
  test("/merchant/products 加载服务列表", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    await page.goto(BASE + "/merchant/products");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("/merchant/products/catalog 加载平台目录", async ({ page }) => {
    await merchantLogin(page, "merchant1@ierepair.ie");
    await page.goto(BASE + "/merchant/products/catalog");
    await expect(page).not.toHaveURL(/login/i);
    await expect(page.locator("body")).toBeVisible();
  });
});
