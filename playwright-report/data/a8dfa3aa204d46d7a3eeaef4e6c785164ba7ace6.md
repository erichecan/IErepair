# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-homepage.spec.ts >> 首页 >> 分类卡片可点击并跳转搜索页
- Location: ierepair/tests/smoke/01-homepage.spec.ts:22:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByText('Screen Repair')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - img [ref=e5]
        - generic [ref=e9]: 餐饮仓配
      - paragraph [ref=e11]: Demo Wholesale Tenant
      - navigation [ref=e13]:
        - generic [ref=e14]:
          - paragraph [ref=e15]: 概览
          - generic [ref=e16]:
            - link "仪表盘" [ref=e17] [cursor=pointer]:
              - /url: /dashboard
              - img [ref=e18]
              - text: 仪表盘
            - link "混合货治理说明" [ref=e23] [cursor=pointer]:
              - /url: /dashboard/mixed-goods-guide
              - img [ref=e24]
              - text: 混合货治理说明
        - generic [ref=e27]:
          - paragraph [ref=e28]: 基础设置
          - generic [ref=e29]:
            - link "客户" [ref=e30] [cursor=pointer]:
              - /url: /dashboard/customers
              - img [ref=e31]
              - text: 客户
            - link "供应商" [ref=e36] [cursor=pointer]:
              - /url: /dashboard/suppliers
              - img [ref=e37]
              - text: 供应商
            - link "仓库" [ref=e42] [cursor=pointer]:
              - /url: /dashboard/warehouses
              - img [ref=e43]
              - text: 仓库
            - link "分类" [ref=e46] [cursor=pointer]:
              - /url: /dashboard/categories
              - img [ref=e47]
              - text: 分类
            - link "产品" [ref=e52] [cursor=pointer]:
              - /url: /dashboard/products
              - img [ref=e53]
              - text: 产品
            - link "SKU" [ref=e57] [cursor=pointer]:
              - /url: /dashboard/skus
              - img [ref=e58]
              - text: SKU
            - link "条码打印" [ref=e59] [cursor=pointer]:
              - /url: /dashboard/barcode
              - img [ref=e60]
              - text: 条码打印
            - link "货主" [ref=e66] [cursor=pointer]:
              - /url: /dashboard/goods-owners
              - img [ref=e67]
              - text: 货主
            - link "打印方案" [ref=e71] [cursor=pointer]:
              - /url: /dashboard/print-solutions
              - img [ref=e72]
              - text: 打印方案
        - generic [ref=e76]:
          - paragraph [ref=e77]: 采购
          - generic [ref=e78]:
            - link "采购单" [ref=e79] [cursor=pointer]:
              - /url: /dashboard/purchasing
              - img [ref=e80]
              - text: 采购单
            - link "收货" [ref=e84] [cursor=pointer]:
              - /url: /dashboard/receiving
              - img [ref=e85]
              - text: 收货
        - generic [ref=e90]:
          - paragraph [ref=e91]: 销售
          - link "销售订单" [ref=e93] [cursor=pointer]:
            - /url: /dashboard/sales-orders
            - img [ref=e94]
            - text: 销售订单
        - generic [ref=e97]:
          - paragraph [ref=e98]: 库存
          - link "库存" [ref=e100] [cursor=pointer]:
            - /url: /dashboard/inventory
            - img [ref=e101]
            - text: 库存
        - generic [ref=e107]:
          - paragraph [ref=e108]: 仓内作业
          - generic [ref=e109]:
            - link "库存调整" [ref=e110] [cursor=pointer]:
              - /url: /dashboard/warehouse-operations/adjust
              - img [ref=e111]
              - text: 库存调整
            - link "库存移动" [ref=e115] [cursor=pointer]:
              - /url: /dashboard/warehouse-operations/transfer
              - img [ref=e116]
              - text: 库存移动
            - link "库存冻结" [ref=e119] [cursor=pointer]:
              - /url: /dashboard/warehouse-operations/freeze
              - img [ref=e120]
              - text: 库存冻结
            - link "库存加工" [ref=e123] [cursor=pointer]:
              - /url: /dashboard/warehouse-operations/process
              - img [ref=e124]
              - text: 库存加工
            - link "盘点" [ref=e135] [cursor=pointer]:
              - /url: /dashboard/warehouse-operations/stocktaking
              - img [ref=e136]
              - text: 盘点
    - generic [ref=e140]:
      - banner [ref=e141]:
        - button "U" [ref=e142]:
          - generic [ref=e144]: U
          - img
      - main [ref=e145]:
        - generic [ref=e146]:
          - generic [ref=e147]:
            - heading "欢迎回来，用户" [level=1] [ref=e148]
            - paragraph [ref=e149]: 餐饮仓配帮助您管理食材、包材等进销存，实时掌握库存与订单。
          - generic [ref=e150]:
            - generic [ref=e151]:
              - generic [ref=e152]: 仓储混合货治理说明（新）
              - generic [ref=e153]: 针对米面大件与蔬菜小件混合、规格混乱、条码不全场景，提供可执行分区与作业方案。
            - link "查看说明页" [ref=e155] [cursor=pointer]:
              - /url: /dashboard/mixed-goods-guide
              - button "查看说明页" [ref=e156]:
                - text: 查看说明页
                - img
          - generic [ref=e157]:
            - link "总产品数 520 已录入的产品总数" [ref=e158] [cursor=pointer]:
              - /url: /dashboard/products
              - generic [ref=e159]:
                - generic [ref=e160]:
                  - generic [ref=e161]: 总产品数
                  - img [ref=e162]
                - generic [ref=e166]:
                  - generic [ref=e167]: "520"
                  - generic [ref=e168]: 已录入的产品总数
            - link "总 SKU 数 520 所有产品的 SKU 总数" [ref=e169] [cursor=pointer]:
              - /url: /dashboard/skus
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - generic [ref=e172]: 总 SKU 数
                  - img [ref=e173]
                - generic [ref=e174]:
                  - generic [ref=e175]: "520"
                  - generic [ref=e176]: 所有产品的 SKU 总数
            - link "活跃分类 125 启用中的产品分类" [ref=e177] [cursor=pointer]:
              - /url: /dashboard/categories
              - generic [ref=e178]:
                - generic [ref=e179]:
                  - generic [ref=e180]: 活跃分类
                  - img [ref=e181]
                - generic [ref=e186]:
                  - generic [ref=e187]: "125"
                  - generic [ref=e188]: 启用中的产品分类
            - link "活跃品牌 1 启用中的产品品牌" [ref=e189] [cursor=pointer]:
              - /url: /dashboard/brands
              - generic [ref=e190]:
                - generic [ref=e191]:
                  - generic [ref=e192]: 活跃品牌
                  - img [ref=e193]
                - generic [ref=e196]:
                  - generic [ref=e197]: "1"
                  - generic [ref=e198]: 启用中的产品品牌
            - link "供应商 0 合作供应商数量" [ref=e199] [cursor=pointer]:
              - /url: /dashboard/suppliers
              - generic [ref=e200]:
                - generic [ref=e201]:
                  - generic [ref=e202]: 供应商
                  - img [ref=e203]
                - generic [ref=e208]:
                  - generic [ref=e209]: "0"
                  - generic [ref=e210]: 合作供应商数量
            - link "客户 33 门店/客户数量" [ref=e211] [cursor=pointer]:
              - /url: /dashboard/customers
              - generic [ref=e212]:
                - generic [ref=e213]:
                  - generic [ref=e214]: 客户
                  - img [ref=e215]
                - generic [ref=e220]:
                  - generic [ref=e221]: "33"
                  - generic [ref=e222]: 门店/客户数量
            - link "仓库 3 已配置的仓库数" [ref=e223] [cursor=pointer]:
              - /url: /dashboard/warehouses
              - generic [ref=e224]:
                - generic [ref=e225]:
                  - generic [ref=e226]: 仓库
                  - img [ref=e227]
                - generic [ref=e230]:
                  - generic [ref=e231]: "3"
                  - generic [ref=e232]: 已配置的仓库数
            - link "采购单 0 所有采购订单数" [ref=e233] [cursor=pointer]:
              - /url: /dashboard/purchasing
              - generic [ref=e234]:
                - generic [ref=e235]:
                  - generic [ref=e236]: 采购单
                  - img [ref=e237]
                - generic [ref=e241]:
                  - generic [ref=e242]: "0"
                  - generic [ref=e243]: 所有采购订单数
            - link "待处理订单 17 待确认销售订单" [ref=e244] [cursor=pointer]:
              - /url: /dashboard/sales-orders
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]: 待处理订单
                  - img [ref=e248]
                - generic [ref=e251]:
                  - generic [ref=e252]: "17"
                  - generic [ref=e253]: 待确认销售订单
            - link "库存项 520 SKU × 仓库 库存记录" [ref=e254] [cursor=pointer]:
              - /url: /dashboard/inventory
              - generic [ref=e255]:
                - generic [ref=e256]:
                  - generic [ref=e257]: 库存项
                  - img [ref=e258]
                - generic [ref=e264]:
                  - generic [ref=e265]: "520"
                  - generic [ref=e266]: SKU × 仓库 库存记录
          - generic [ref=e267]:
            - generic [ref=e268]:
              - generic [ref=e269]: 快速开始
              - generic [ref=e270]: 按以下步骤完成基础配置并开始作业
            - generic [ref=e272]:
              - link "1. 创建分类 设置分类体系，例如：生鲜 → 蔬菜 → 叶菜" [ref=e273] [cursor=pointer]:
                - /url: /dashboard/categories
                - generic [ref=e274]:
                  - generic [ref=e275]:
                    - heading "1. 创建分类" [level=3] [ref=e276]
                    - img [ref=e277]
                  - paragraph [ref=e279]: 设置分类体系，例如：生鲜 → 蔬菜 → 叶菜
              - link "2. 添加供应商 录入合作供应商信息，管理联系人和交期。" [ref=e280] [cursor=pointer]:
                - /url: /dashboard/suppliers
                - generic [ref=e281]:
                  - generic [ref=e282]:
                    - heading "2. 添加供应商" [level=3] [ref=e283]
                    - img [ref=e284]
                  - paragraph [ref=e286]: 录入合作供应商信息，管理联系人和交期。
              - link "3. 配置仓库 设置仓库和货位，为库存管理做好准备。" [ref=e287] [cursor=pointer]:
                - /url: /dashboard/warehouses
                - generic [ref=e288]:
                  - generic [ref=e289]:
                    - heading "3. 配置仓库" [level=3] [ref=e290]
                    - img [ref=e291]
                  - paragraph [ref=e293]: 设置仓库和货位，为库存管理做好准备。
              - link "4. 创建采购单 选择供应商和 SKU，创建采购订单并追踪物流。" [ref=e294] [cursor=pointer]:
                - /url: /dashboard/purchasing
                - generic [ref=e295]:
                  - generic [ref=e296]:
                    - heading "4. 创建采购单" [level=3] [ref=e297]
                    - img [ref=e298]
                  - paragraph [ref=e300]: 选择供应商和 SKU，创建采购订单并追踪物流。
              - link "5. 管理库存 入库、出库、调拨、盘点，实时掌控库存动态。" [ref=e301] [cursor=pointer]:
                - /url: /dashboard/inventory
                - generic [ref=e302]:
                  - generic [ref=e303]:
                    - heading "5. 管理库存" [level=3] [ref=e304]
                    - img [ref=e305]
                  - paragraph [ref=e307]: 入库、出库、调拨、盘点，实时掌控库存动态。
              - link "6. 添加客户 维护客户资料与信用，便于接单与对账。" [ref=e308] [cursor=pointer]:
                - /url: /dashboard/customers
                - generic [ref=e309]:
                  - generic [ref=e310]:
                    - heading "6. 添加客户" [level=3] [ref=e311]
                    - img [ref=e312]
                  - paragraph [ref=e314]: 维护客户资料与信用，便于接单与对账。
              - link "7. 条码打印 批量生成 SKU 条码和二维码标签，支持多种尺寸。" [ref=e315] [cursor=pointer]:
                - /url: /dashboard/barcode
                - generic [ref=e316]:
                  - generic [ref=e317]:
                    - heading "7. 条码打印" [level=3] [ref=e318]
                    - img [ref=e319]
                  - paragraph [ref=e321]: 批量生成 SKU 条码和二维码标签，支持多种尺寸。
          - generic [ref=e322]:
            - generic [ref=e324]: 租户信息
            - generic [ref=e326]:
              - generic [ref=e327]: 公司名称：Demo Wholesale Tenant
              - generic [ref=e328]: 公司标识：test-company
              - generic [ref=e329]: 套餐：FREE
              - generic [ref=e330]: 角色：ADMIN
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e336] [cursor=pointer]:
    - img [ref=e337]
  - alert [ref=e340]
```

# Test source

```ts
  1  | /**
  2  |  * 冒烟测试 01 — 消费者首页
  3  |  * 验证首页可正常加载、搜索框可用、分类卡片可点击
  4  |  */
  5  | import { test, expect } from "@playwright/test";
  6  | 
  7  | test.describe("首页", () => {
  8  |   test("可以加载并显示搜索框", async ({ page }) => {
  9  |     await page.goto("/");
  10 |     // 品牌标题
  11 |     await expect(page.getByText("IERepair").first()).toBeVisible();
  12 |     // 搜索框存在
  13 |     await expect(
  14 |       page.getByPlaceholder("iPhone 15 screen repair…"),
  15 |     ).toBeVisible();
  16 |     // Eircode 输入框
  17 |     await expect(page.getByPlaceholder("Eircode (D01 A234)")).toBeVisible();
  18 |     // Search 按钮
  19 |     await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  20 |   });
  21 | 
  22 |   test("分类卡片可点击并跳转搜索页", async ({ page }) => {
  23 |     await page.goto("/");
> 24 |     await page.getByText("Screen Repair").click();
     |                                           ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  25 |     await expect(page).toHaveURL(/\/search/);
  26 |   });
  27 | 
  28 |   test("搜索框输入关键词后点击 Search 跳转搜索页", async ({ page }) => {
  29 |     await page.goto("/");
  30 |     await page.getByPlaceholder("iPhone 15 screen repair…").fill("iPhone");
  31 |     await page.getByRole("button", { name: "Search" }).click();
  32 |     await expect(page).toHaveURL(/\/search\?.*q=iPhone/);
  33 |   });
  34 | 
  35 |   test("How it works 四步说明可见", async ({ page }) => {
  36 |     await page.goto("/");
  37 |     for (const step of ["Search", "Compare", "Book", "Repair"]) {
  38 |       await expect(page.getByText(step).first()).toBeVisible();
  39 |     }
  40 |   });
  41 | });
  42 | 
```