import { Page } from "@playwright/test";

/**
 * 登录商户账号。
 * 登录成功后页面应跳转到 /merchant/dashboard。
 */
export async function merchantLogin(
  page: Page,
  email = "info@oneills.ie",
  password = "merchant123",
) {
  await page.goto("/merchant/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/merchant\/dashboard/, { timeout: 20_000 });
}
