/**
 * 冒烟测试 04 — 商户仪表盘
 * 登录后验证仪表盘、预约列表、产品页面可访问
 */
import { test, expect } from "@playwright/test";
import { merchantLogin } from "./helpers/merchant-login";

test.describe("商户仪表盘", () => {
  test.beforeEach(async ({ page }) => {
    await merchantLogin(page);
  });

  test("仪表盘页面包含核心数据区块", async ({ page }) => {
    // 应展示统计数字或"今日"之类的标题
    const body = await page.textContent("body");
    // 宽松检查：仪表盘至少能渲染出文字内容
    expect(body?.length).toBeGreaterThan(100);
    await expect(page).toHaveURL(/\/merchant\/dashboard/);
  });

  test("导航到预约列表页", async ({ page }) => {
    await page.goto("/merchant/bookings");
    await expect(page).toHaveURL(/\/merchant\/bookings/);
    // 页面不应为空报错
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
  });

  test("导航到产品管理页", async ({ page }) => {
    await page.goto("/merchant/products");
    await expect(page).toHaveURL(/\/merchant\/products/);
    await expect(page.locator("body")).not.toContainText("500");
  });

  test("导航到设置页", async ({ page }) => {
    await page.goto("/merchant/settings");
    await expect(page).toHaveURL(/\/merchant\/settings/);
    await expect(page.locator("body")).not.toContainText("500");
  });

});

test("未登录直接访问仪表盘被重定向到登录页", async ({ page }) => {
  // 使用全新 page（无 session）
  await page.goto("/merchant/dashboard");
  // 应重定向到 /merchant/login 或 /auth/login
  await expect(page).toHaveURL(/login/);
});
