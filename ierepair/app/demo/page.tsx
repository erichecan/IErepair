import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demo Guide | IERepair",
  description: "IERepair platform experience guide — consumer, merchant, and admin flows",
};

const BASE = "https://ierepair-549968261036.europe-west1.run.app";

/* ── Types ─────────────────────────────────────────────── */
type Step = { label: string; url?: string; note?: string };
type Role = {
  id: string;
  title: string;
  subtitle: string;
  loginUrl: string;
  badge: string;
  badgeColor: string;
  accent: string;
  borderColor: string;
  credentials: { field: string; value: string }[];
  flows: { heading: string; steps: Step[] }[];
};

/* ── Data ──────────────────────────────────────────────── */
const ROLES: Role[] = [
  {
    id: "consumer",
    title: "用户端（Consumer）",
    subtitle: "模拟手机坏了的普通用户，从首页找到维修店并下单预约",
    loginUrl: `${BASE}/auth/login`,
    badge: "公开访问",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    accent: "#059669",
    borderColor: "border-emerald-500/20",
    credentials: [
      { field: "登录方式", value: "手机号 / 邮箱 OTP（无需注册）" },
      { field: "推荐测试邮箱", value: "任意真实邮箱均可收验证码" },
    ],
    flows: [
      {
        heading: "A · 首页浏览与搜索",
        steps: [
          { label: "打开首页", url: `${BASE}/` },
          { label: "在搜索框输入 "iPhone 15" 并回车，跳转设备维修页" },
          { label: "点击顶部分类卡片（Battery / Screen / Storage）浏览分类" },
          { label: "点击首页维修卡片中的任意型号进入设备详情页" },
        ],
      },
      {
        heading: "B · 浏览所有设备",
        steps: [
          { label: "点击首页底部 "Browse All Devices"", url: `${BASE}/repair/browse` },
          { label: "通过品牌 / 维修类型筛选", note: "filter chips 会动态更新结果" },
          { label: "点击某台设备进入 /repair/device/[slug]" },
        ],
      },
      {
        heading: "C · 预约维修（完整下单流程）",
        steps: [
          { label: "进入任意设备页，点击 "Book Repair"" },
          { label: "选择维修店（列表显示价格 + 距离）" },
          { label: "选择时间槽" },
          { label: "填写联系方式，点击发送 OTP 验证码" },
          { label: "输入收到的验证码，完成身份确认" },
          { label: "Stripe 支付 20% 定金（测试卡：4242 4242 4242 4242，任意有效期 / CVV）" },
          { label: "预约成功页 — 记下 Booking Ref（格式 IER-XXXXXX）" },
        ],
      },
      {
        heading: "D · 我的预约",
        steps: [
          { label: "登录后访问账户", url: `${BASE}/account` },
          { label: "点击某条预约查看详情（状态、时间、参考号）" },
          { label: "如需取消，点击 Cancel Booking（需在 24 小时前）" },
        ],
      },
    ],
  },
  {
    id: "merchant",
    title: "商家端（Merchant）",
    subtitle: "模拟手机维修店老板，管理预约、查看财务报表、设置店铺信息",
    loginUrl: `${BASE}/merchant/login`,
    badge: "需要账号登录",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    accent: "#2563eb",
    borderColor: "border-blue-500/20",
    credentials: [
      { field: "账号 1", value: "merchant1@ierepair.ie" },
      { field: "账号 2", value: "merchant2@ierepair.ie" },
      { field: "账号 3", value: "merchant3@ierepair.ie" },
      { field: "统一密码", value: "Merchant2024!" },
    ],
    flows: [
      {
        heading: "A · 登录与 Dashboard",
        steps: [
          { label: "打开商家登录页", url: `${BASE}/merchant/login` },
          { label: "用上方账号登录（merchant1 / Merchant2024!）" },
          { label: "Dashboard 显示今日预约、待审批数量、本月营收" },
        ],
      },
      {
        heading: "B · 管理预约",
        steps: [
          { label: "点击左侧 Bookings 进入预约列表", url: `${BASE}/merchant/bookings` },
          { label: "切换状态 Tab（Pending / Confirmed / Completed）" },
          { label: "点击某条 Pending 预约 → 点击 Accept（接受）" },
          { label: "顾客到店后点击 Check-In，完成后点击 Complete" },
          { label: "如顾客未到，点击 No-Show" },
        ],
      },
      {
        heading: "C · 财务报表（Phase 4 新功能）",
        steps: [
          { label: "点击左侧 Finance 进入财务页", url: `${BASE}/merchant/finance` },
          { label: "切换月份选择器查看不同月份数据" },
          { label: "顶部卡片显示：维修收入 / 平台佣金（8%）/ 净收入 / 完成单数" },
          { label: "下方明细表格显示每笔收入记录" },
        ],
      },
      {
        heading: "D · 店铺设置（Phase 4 新功能）",
        steps: [
          { label: "点击左侧 Settings 进入设置页", url: `${BASE}/merchant/settings` },
          { label: "上传 Logo（点击图标区域选择图片，JPEG/PNG/WEBP，≤5MB）" },
          { label: "上传封面图（同上，宽图比例）" },
          { label: "修改店名、电话、地址、Eircode" },
          { label: "调整营业时间（勾选 / 取消某天，修改开关时间）" },
          { label: "修改预约配置（单次时长、最多提前预约天数）" },
          { label: "点击 Save Settings，等待绿色成功提示" },
        ],
      },
      {
        heading: "E · 产品目录",
        steps: [
          { label: "点击左侧 Products 查看上架商品" },
          { label: "点击 Browse Catalog 从平台目录选品上架" },
          { label: "为每个商品设置自定义价格" },
        ],
      },
    ],
  },
  {
    id: "admin",
    title: "管理后台（Admin）",
    subtitle: "平台超级管理员，管理商家审核、产品分类、平台财务汇总",
    loginUrl: `${BASE}/admin/login`,
    badge: "超级管理员",
    badgeColor: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    accent: "#ea580c",
    borderColor: "border-orange-500/20",
    credentials: [
      { field: "账号", value: "admin@ierepair.ie" },
      { field: "密码", value: "IERepair2024!" },
    ],
    flows: [
      {
        heading: "A · 登录",
        steps: [
          { label: "打开管理后台登录页", url: `${BASE}/admin/login` },
          { label: "用 admin@ierepair.ie / IERepair2024! 登录" },
        ],
      },
      {
        heading: "B · 商家管理",
        steps: [
          { label: "点击 Merchants 查看所有商家列表", url: `${BASE}/admin/merchants` },
          { label: "点击某商家可激活 / 暂停账号" },
          { label: "新商家注册后默认 inactive，需在此处激活才能登录" },
        ],
      },
      {
        heading: "C · 平台财务汇总（Phase 4 新功能）",
        steps: [
          { label: "点击 Finance 进入平台财务总览", url: `${BASE}/admin/finance` },
          { label: "选择月份，查看全平台汇总：总收入 / 总佣金 / 商家净收款" },
          { label: "下方按商家分组，查看每家店的明细" },
        ],
      },
      {
        heading: "D · 产品与分类管理",
        steps: [
          { label: "点击 Products 管理平台商品库", url: `${BASE}/admin/products` },
          { label: "点击 Categories 管理维修分类", url: `${BASE}/admin/categories` },
          { label: "新增分类后商家可在目录中选品" },
        ],
      },
    ],
  },
];

/* ── Step Component ─────────────────────────────────────── */
function FlowStep({
  index,
  step,
  accent,
}: {
  index: number;
  step: Step;
  accent: string;
}) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
        style={{ backgroundColor: accent }}
      >
        {index + 1}
      </span>
      <span className="text-sm text-[#333] leading-relaxed flex-1">
        {step.label}
        {step.url && (
          <a
            href={step.url}
            target="_blank"
            rel="noreferrer"
            className="ml-2 text-[11px] font-mono text-[#898989] underline underline-offset-2 hover:text-[#242424] transition-colors break-all"
          >
            {step.url.replace("https://ierepair-549968261036.europe-west1.run.app", "→")}
          </a>
        )}
        {step.note && (
          <span className="ml-2 text-[11px] text-[#898989] italic">{step.note}</span>
        )}
      </span>
    </li>
  );
}

/* ── Role Card ──────────────────────────────────────────── */
function RoleCard({ role }: { role: Role }) {
  return (
    <section
      className={`bg-white rounded-2xl border ${role.borderColor} overflow-hidden`}
      style={{ boxShadow: "rgba(34,42,53,0.06) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 8px 24px" }}
    >
      {/* Card header */}
      <div className="px-6 pt-6 pb-5 border-b border-[rgba(34,42,53,0.07)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-lg font-semibold text-[#242424]"
              style={{ fontFamily: "'Cal Sans', Outfit, Inter, sans-serif" }}
            >
              {role.title}
            </h2>
            <p className="text-sm text-[#898989] mt-1 leading-relaxed">{role.subtitle}</p>
          </div>
          <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${role.badgeColor}`}>
            {role.badge}
          </span>
        </div>

        {/* Login button */}
        <a
          href={role.loginUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: role.accent }}
        >
          开始体验
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>

        {/* Credentials */}
        <div className="mt-4 grid grid-cols-1 gap-1">
          {role.credentials.map((c) => (
            <div key={c.field} className="flex items-baseline gap-2 text-sm">
              <span className="text-[#898989] shrink-0 w-28">{c.field}</span>
              <code className="font-mono text-[#242424] text-xs bg-[#f5f5f5] px-2 py-0.5 rounded">{c.value}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Flows */}
      <div className="px-6 py-5 space-y-6">
        {role.flows.map((flow) => (
          <div key={flow.heading}>
            <h3
              className="text-xs font-semibold uppercase tracking-wider text-[#898989] mb-3"
            >
              {flow.heading}
            </h3>
            <ol className="space-y-2">
              {flow.steps.map((step, i) => (
                <FlowStep key={i} index={i} step={step} accent={role.accent} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(34,42,53,0.08)] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-lg font-bold text-[#242424]"
              style={{ fontFamily: "'Cal Sans', Outfit, Inter, sans-serif" }}
            >
              IERepair
            </span>
            <span className="text-[#e0e0e0] select-none">/</span>
            <span className="text-sm text-[#898989]">体验指南</span>
          </div>
          <a
            href={BASE}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#898989] hover:text-[#242424] transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            线上运行中
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">

        {/* Hero */}
        <div className="mb-10">
          <h1
            className="text-3xl md:text-4xl font-semibold text-[#242424] leading-tight mb-3"
            style={{ fontFamily: "'Cal Sans', Outfit, Inter, sans-serif" }}
          >
            三端体验流程
          </h1>
          <p className="text-[#898989] text-base leading-relaxed max-w-xl">
            IERepair 包含三个独立入口：消费者端（公开访问）、商家管理后台、平台管理后台。
            按照下方步骤逐一体验，覆盖完整的预约—维修—结算闭环。
          </p>

          {/* Quick links */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { label: "用户首页", href: `${BASE}/`, color: "#059669" },
              { label: "商家后台", href: `${BASE}/merchant/login`, color: "#2563eb" },
              { label: "管理后台", href: `${BASE}/admin/login`, color: "#ea580c" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-85 transition-opacity"
                style={{ backgroundColor: link.color }}
              >
                {link.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Stripe test card callout */}
        <div className="mb-8 flex gap-3 p-4 bg-amber-50 border border-amber-200/80 rounded-xl">
          <span className="text-amber-500 text-lg leading-none mt-0.5">💳</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Stripe 测试支付</p>
            <p className="text-sm text-amber-700 mt-0.5">
              测试卡号：<code className="font-mono bg-amber-100 px-1 rounded">4242 4242 4242 4242</code>
              &nbsp;/ 任意未来有效期 / 任意 CVC / 任意邮编。无真实扣款。
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-6">
          {ROLES.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>

        {/* Recommended flow */}
        <div
          className="mt-8 p-5 rounded-2xl border border-[rgba(34,42,53,0.08)] bg-white"
          style={{ boxShadow: "rgba(34,42,53,0.05) 0px 0px 0px 1px" }}
        >
          <h2
            className="text-sm font-semibold text-[#242424] mb-3"
            style={{ fontFamily: "'Cal Sans', Outfit, Inter, sans-serif" }}
          >
            推荐体验顺序（完整闭环）
          </h2>
          <ol className="space-y-2">
            {[
              { n: 1, text: "用 Admin 登录 → Merchants 页面 → 确认 3 家商家均为 active 状态" },
              { n: 2, text: "打开用户首页 → 搜索 iPhone 15 → 进入设备页 → 完成预约下单（20% 定金）" },
              { n: 3, text: "用 merchant1 登录 → Bookings → 找到刚刚的 Pending 预约 → 点击 Accept" },
              { n: 4, text: "返回用户端 → 我的预约 → 确认状态变为 Confirmed" },
              { n: 5, text: "用 merchant1 → Bookings → Check-In → Complete（模拟维修完成）" },
              { n: 6, text: "merchant1 → Finance → 查看本月新增收入记录" },
              { n: 7, text: "Admin → Finance → 查看平台汇总，确认佣金（8%）已计算" },
              { n: 8, text: "merchant1 → Settings → 上传 Logo + 封面图，修改营业时间，Save" },
            ].map((item) => (
              <li key={item.n} className="flex gap-3 items-start text-sm text-[#333]">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#242424] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {item.n}
                </span>
                <span className="leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-[#c0c0c0]">
          IERepair · Europe (Frankfurt) ·{" "}
          <a href={BASE} target="_blank" rel="noreferrer" className="underline hover:text-[#898989]">
            {BASE.replace("https://", "")}
          </a>
        </footer>
      </main>
    </div>
  );
}
