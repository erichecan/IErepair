/**
 * 冒烟测试 03 — 商户登录
 * 验证种子账号可正常登录，错误凭据显示报错
 */
import { test, expect } from "@playwright/test";
import { merchantLogin } from "./helpers/merchant-login";

test.describe("商户登录", () => {
  test("正确凭据登录后跳转到 /merchant/dashboard", async ({ page }) => {
    await merchantLogin(page);
    await expect(page).toHaveURL(/\/merchant\/dashboard/);
  });

  test("错误密码显示错误提示", async ({ page }) => {
    await page.goto("/merchant/login");
    await page.getByLabel("Email").fill("info@oneills.ie");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // 等待错误提示出现（不跳转）
    await expect(page.locator("text=/invalid|credentials|error|failed|wrong/i").first()).toBeVisible({
      timeout: 10_000,
    });
    // 仍停在登录页
    await expect(page).toHaveURL(/\/merchant\/login/);
  });

  test("空字段时 Sign In 按钮禁用", async ({ page }) => {
    await page.goto("/merchant/login");
    const btn = page.getByRole("button", { name: "Sign In" });
    await expect(btn).toBeDisabled();

    await page.getByLabel("Email").fill("info@oneills.ie");
    await expect(btn).toBeDisabled(); // 还没填密码

    await page.getByLabel("Password").fill("merchant123");
    await expect(btn).toBeEnabled();
  });
});
