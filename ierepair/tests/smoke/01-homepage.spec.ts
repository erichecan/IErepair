/**
 * 冒烟测试 01 — 消费者首页
 * 验证首页可正常加载、搜索框可用、分类卡片可点击
 */
import { test, expect } from "@playwright/test";

test.describe("首页", () => {
  test("可以加载并显示搜索框", async ({ page }) => {
    await page.goto("/");
    // 品牌标题
    await expect(page.getByText("IERepair").first()).toBeVisible();
    // 搜索框存在
    await expect(
      page.getByPlaceholder("iPhone 15 screen repair…"),
    ).toBeVisible();
    // Eircode 输入框
    await expect(page.getByPlaceholder("Eircode (D01 A234)")).toBeVisible();
    // Search 按钮
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("分类卡片可点击并跳转搜索页", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Screen Repair").click();
    await expect(page).toHaveURL(/\/search/);
  });

  test("搜索框输入关键词后点击 Search 跳转搜索页", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("iPhone 15 screen repair…").fill("iPhone");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/search\?.*q=iPhone/);
  });

  test("How it works 四步说明可见", async ({ page }) => {
    await page.goto("/");
    for (const step of ["Search", "Compare", "Book", "Repair"]) {
      await expect(page.getByText(step).first()).toBeVisible();
    }
  });
});
