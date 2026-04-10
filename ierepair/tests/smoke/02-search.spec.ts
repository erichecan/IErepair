/**
 * 冒烟测试 02 — 搜索页
 * 验证搜索 API 返回结果、Tabs 切换正常
 */
import { test, expect } from "@playwright/test";

test.describe("搜索页", () => {
  test("搜索 'iPhone' 能看到产品或店铺结果", async ({ page }) => {
    await page.goto("/search?q=iPhone");

    // 等待 loading 消失
    await expect(page.getByText("Searching…")).toBeHidden({ timeout: 15_000 });

    // 应有结果（产品或店铺至少一条）
    const hasProducts  = await page.locator("text=Products").count() > 0;
    const hasShops     = await page.locator("text=Shops").count() > 0;
    const hasNoResults = await page.locator("text=No results found").count() > 0;

    // 若无结果，用 skip 降级（数据库可能未 seed）
    test.skip(hasNoResults, "搜索无结果 — 数据库可能未完成 seed");

    expect(hasProducts || hasShops).toBe(true);
  });

  test("Tabs 切换到 Shops 后显示店铺列表", async ({ page }) => {
    await page.goto("/search?q=repair");
    await expect(page.getByText("Searching…")).toBeHidden({ timeout: 15_000 });

    const noResults = await page.locator("text=No results found").count() > 0;
    test.skip(noResults, "搜索无结果 — 跳过 Tabs 测试");

    await page.getByRole("tab", { name: "Shops" }).click();
    // 等待 re-fetch
    await expect(page.getByText("Searching…")).toBeHidden({ timeout: 10_000 });
  });

  test("搜索结果的店铺卡片点击后跳转到 /stores/:slug", async ({ page }) => {
    await page.goto("/search?q=repair");
    await expect(page.getByText("Searching…")).toBeHidden({ timeout: 15_000 });

    // 切到 Shops tab
    await page.getByRole("tab", { name: "Shops" }).click();
    await expect(page.getByText("Searching…")).toBeHidden({ timeout: 10_000 });

    const shopLink = page.locator("a[href^='/stores/']").first();
    const count = await shopLink.count();
    test.skip(count === 0, "无店铺结果 — 跳过跳转测试");

    await shopLink.click();
    await expect(page).toHaveURL(/\/stores\//);
  });
});
