# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-consumer-auth-page.spec.ts >> 消费者 OTP 登录页 UI >> OTP 发送成功后切换到验证码输入步骤
- Location: ierepair/tests/smoke/05-consumer-auth-page.spec.ts:23:8

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Verification Code')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel('Verification Code')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: IERepair
      - generic [ref=e6]: Sign In
      - generic [ref=e7]: Enter your Irish mobile number to get a verification code
    - generic [ref=e8]:
      - generic [ref=e9]: Please wait 60 seconds before requesting a new code
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Phone Number
          - textbox "Phone Number" [ref=e13]:
            - /placeholder: +353 87 123 4567
            - text: "+353871234567"
        - button "Send Code" [ref=e14]
  - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
    - img [ref=e21]
  - alert [ref=e24]
```

# Test source

```ts
  1  | /**
  2  |  * 冒烟测试 05 — 消费者登录页（OTP 流程 UI）
  3  |  * 注意：OTP 依赖 SMS/Twilio，无法端到端自动化。
  4  |  * 本测试仅验证 UI 渲染和 Step 切换逻辑。
  5  |  */
  6  | import { test, expect } from "@playwright/test";
  7  | 
  8  | test.describe("消费者 OTP 登录页 UI", () => {
  9  |   test("显示手机号输入步骤", async ({ page }) => {
  10 |     await page.goto("/auth/login");
  11 |     await expect(page.getByLabel("Phone Number")).toBeVisible();
  12 |     await expect(page.getByRole("button", { name: "Send Code" })).toBeVisible();
  13 |     // 按钮初始应禁用（手机号为空）
  14 |     await expect(page.getByRole("button", { name: "Send Code" })).toBeDisabled();
  15 |   });
  16 | 
  17 |   test("填入手机号后 Send Code 按钮启用", async ({ page }) => {
  18 |     await page.goto("/auth/login");
  19 |     await page.getByLabel("Phone Number").fill("+353871234567");
  20 |     await expect(page.getByRole("button", { name: "Send Code" })).toBeEnabled();
  21 |   });
  22 | 
  23 |   test.fail(
  24 |     "OTP 发送成功后切换到验证码输入步骤",
  25 |     async ({ page }) => {
  26 |       // 这个测试预期失败：SMS/OTP 在测试环境不可用
  27 |       await page.goto("/auth/login");
  28 |       await page.getByLabel("Phone Number").fill("+353871234567");
  29 |       await page.getByRole("button", { name: "Send Code" }).click();
  30 |       // 期望出现 OTP 输入框，但实际因 SMS 不可用会报错
> 31 |       await expect(page.getByLabel("Verification Code")).toBeVisible({ timeout: 5_000 });
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  32 |     },
  33 |   );
  34 | });
  35 | 
```