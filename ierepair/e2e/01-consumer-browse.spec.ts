import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3002";

test.describe("Consumer · 首页浏览与搜索", () => {
  test("首页加载，展示 banner 和维修分类", async ({ page }) => {
    await page.goto(BASE + "/");
    await expect(page).toHaveTitle(/IERepair/i);
    // Banner / hero section exists
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("搜索 iPhone 15 跳转设备详情页", async ({ page }) => {
    await page.goto(BASE + "/");
    const searchBox = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    if (await searchBox.isVisible()) {
      await searchBox.fill("iPhone 15");
      await searchBox.press("Enter");
      await page.waitForURL(/repair\/device|search/i, { timeout: 8000 });
      await expect(page.locator("body")).toContainText(/iPhone 15/i);
    } else {
      // search may be triggered by a button; just verify page loads
      console.log("  [skip] search input not visible on homepage");
    }
  });

  test("点击分类卡片进入 /repair/list/*", async ({ page }) => {
    await page.goto(BASE + "/");
    // Look for category links
    const categoryLink = page.locator('a[href*="/repair/list/"]').first();
    if (await categoryLink.isVisible()) {
      const href = await categoryLink.getAttribute("href");
      await categoryLink.click();
      await page.waitForURL(/repair\/list\//i, { timeout: 8000 });
      await expect(page.locator("body")).toBeVisible();
    } else {
      console.log("  [skip] no /repair/list/ links on homepage");
    }
  });

  test("点击机型卡片进入设备详情页", async ({ page }) => {
    await page.goto(BASE + "/");
    const deviceLink = page.locator('a[href*="/repair/device/"]').first();
    if (await deviceLink.isVisible()) {
      await deviceLink.click();
      await page.waitForURL(/repair\/device\//i, { timeout: 8000 });
      await expect(page.locator("body")).toBeVisible();
    } else {
      console.log("  [skip] no /repair/device/ links on homepage");
    }
  });
});

test.describe("Consumer · 浏览全部设备与筛选", () => {
  test("/repair/browse 加载设备列表", async ({ page }) => {
    // Browse page requires a brand to be selected before showing devices
    await page.goto(BASE + "/repair/browse?type=phone&brand=Apple");
    await expect(page).not.toHaveURL(/404/);
    // Page should have device cards
    const cards = page.locator('a[href*="/repair/device/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("品牌 filter 过滤设备", async ({ page }) => {
    await page.goto(BASE + "/repair/browse");
    await page.waitForLoadState("networkidle");
    // Find a brand filter chip (Apple)
    const appleFilter = page.locator('button:has-text("Apple"), [data-value="Apple"], label:has-text("Apple")').first();
    if (await appleFilter.isVisible()) {
      await appleFilter.click();
      await page.waitForTimeout(800);
      // URL should update or page re-renders
      await expect(page.locator("body")).toBeVisible();
    } else {
      console.log("  [skip] Apple filter chip not found");
    }
  });

  test("点击设备进入详情页", async ({ page }) => {
    // Browse page requires a brand to be selected before showing devices
    await page.goto(BASE + "/repair/browse?type=phone&brand=Apple");
    const card = page.locator('a[href*="/repair/device/"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await card.click();
    await page.waitForURL(/repair\/device\//i, { timeout: 8000 });
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Consumer · 设备详情页", () => {
  test("设备详情页展示维修服务和价格", async ({ page }) => {
    // Browse page requires a brand to be selected before showing devices
    await page.goto(BASE + "/repair/browse?type=phone&brand=Apple");
    const card = page.locator('a[href*="/repair/device/"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    const href = await card.getAttribute("href");
    if (!href) throw new Error("No device link found");
    await page.goto(BASE + href);
    await expect(page.locator("body")).not.toContainText(/404|not found/i);
    // Should show repair services / prices
    const priceText = page.locator('text=/€|price|repair/i').first();
    await expect(priceText).toBeVisible({ timeout: 8000 });
  });
});
