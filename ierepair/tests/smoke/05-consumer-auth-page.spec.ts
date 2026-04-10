/**
 * 冒烟测试 05 — 消费者登录页（OTP 流程 UI）
 * 注意：OTP 依赖 SMS/Twilio，无法端到端自动化。
 * 本测试仅验证 UI 渲染和 Step 切换逻辑。
 */
import { test, expect } from "@playwright/test";

test.describe("消费者 OTP 登录页 UI", () => {
  test("显示手机号输入步骤", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByLabel("Phone Number")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Code" })).toBeVisible();
    // 按钮初始应禁用（手机号为空）
    await expect(page.getByRole("button", { name: "Send Code" })).toBeDisabled();
  });

  test("填入手机号后 Send Code 按钮启用", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Phone Number").fill("+353871234567");
    await expect(page.getByRole("button", { name: "Send Code" })).toBeEnabled();
  });

  test.fail(
    "OTP 发送成功后切换到验证码输入步骤",
    async ({ page }) => {
      // 这个测试预期失败：SMS/OTP 在测试环境不可用
      await page.goto("/auth/login");
      await page.getByLabel("Phone Number").fill("+353871234567");
      await page.getByRole("button", { name: "Send Code" }).click();
      // 期望出现 OTP 输入框，但实际因 SMS 不可用会报错
      await expect(page.getByLabel("Verification Code")).toBeVisible({ timeout: 5_000 });
    },
  );
});
