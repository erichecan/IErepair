import type { Metadata } from "next";
import { DemoLoginButton } from "./DemoLoginButton";

export const metadata: Metadata = {
  title: "体验指引 | IERepair",
  description: "IERepair 三端主流程体验测试指引",
};

const BASE = "https://ierepair-549968261036.europe-west1.run.app";

type FlowRow = {
  portal: string;
  portalColor: string;
  flow: string;
  steps: string[];
  results: string[];
  entryUrl?: string;
  loginEmail?: string;
};

const rows: FlowRow[] = [
  /* ── Consumer ── */
  {
    portal: "用户端",
    portalColor: "#059669",
    flow: "首页浏览 & 搜索设备",
    steps: [
      `打开用户首页 → ${BASE}/`,
      `在搜索框输入 "iPhone 15" 回车`,
      `点击顶部分类卡片，例如 Battery Repair`,
      `点击任意机型卡片，例如 iPhone 14`,
    ],
    results: [
      "展示 IERepair Banner、热门机型卡片（iPhone / Samsung）、维修分类入口",
      "跳转至 iPhone 15 设备详情页，列出换屏、换电池等可预约维修项目",
      "进入 /repair/list/battery-repair，列出所有支持电池更换的机型",
      "进入设备详情页，展示该设备所有可用维修服务及价格区间",
    ],
    entryUrl: `${BASE}/`,
  },
  {
    portal: "用户端",
    portalColor: "#059669",
    flow: "浏览全部设备 & 筛选",
    steps: [
      `点击首页底部 "Browse All Devices" → ${BASE}/repair/browse`,
      "点击品牌 filter chip，例如 Apple",
      "再点击服务类型 filter，例如 Screen Repair",
      "点击某台设备进入详情",
    ],
    results: [
      "分页展示全部设备，每页 24 个",
      "列表实时过滤，仅显示 Apple 设备",
      "进一步缩小至：Apple 设备 + 支持换屏的机型",
      "显示该设备所有可用维修服务卡片，含价格和预约按钮",
    ],
    entryUrl: `${BASE}/repair/browse`,
  },
  {
    portal: "用户端",
    portalColor: "#059669",
    flow: "完整预约下单流程",
    steps: [
      `在设备详情页点击某维修项目的 "Book Repair" 按钮`,
      "从列表选择一家维修店",
      "选择可用时间槽（绿色格子）",
      "填写姓名 / 邮箱 / 手机号，点击「发送验证码」",
      "在输入框填入收到的 6 位 OTP，点击确认",
      "填入测试卡 4242 4242 4242 4242（任意有效期 / CVC），点击支付",
      "查看邮箱",
    ],
    results: [
      "进入预约流程第一步：显示附近可预约门店列表，含价格和距离",
      "该门店高亮选中，下方显示价格和预计时长，进入时间选择步骤",
      "时间槽高亮，进入联系信息填写步骤",
      "按钮变为 loading，3–5 秒后邮箱收到 6 位验证码",
      "验证通过，进入支付步骤，显示定金金额（约维修价格的 20%）",
      "Stripe 扣款成功，跳转预约成功页，显示 Booking Ref（格式 IER-XXXXXX）",
      "收到预约确认邮件，包含 Booking Ref、门店信息、预约时间",
    ],
  },
  {
    portal: "用户端",
    portalColor: "#059669",
    flow: "查看 & 取消我的预约",
    steps: [
      `访问账户页面 → ${BASE}/account`,
      "点击某条预约查看详情",
      "点击「Cancel Booking」（需在预约 24 小时前）",
    ],
    results: [
      "显示我的预约列表，含刚刚创建的预约（状态：Pending Confirmation）",
      "显示：状态徽章、预约时间、门店名称、维修项目、参考号、定金状态",
      "弹出确认对话框；确认后状态变为 Cancelled，已付定金原路退回",
    ],
    entryUrl: `${BASE}/account`,
  },

  /* ── Merchant ── */
  {
    portal: "商家端",
    portalColor: "#2563eb",
    flow: "登录 & Dashboard 总览",
    steps: [
      "在本页点击任意商家账号「一键登录」按钮",
      "查看 Dashboard 数据卡片",
      "查看今日预约时间轴",
    ],
    results: [
      "2 秒内自动跳转至 /merchant/dashboard，顶部显示店名",
      "显示：今日预约数、待确认数量、本月完成单数、本月净收入（已扣佣金 8%）",
      "按时间顺序列出今日所有预约及当前状态",
    ],
    loginEmail: "merchant1@ierepair.ie",
  },
  {
    portal: "商家端",
    portalColor: "#2563eb",
    flow: "预约订单管理（接单→完成）",
    steps: [
      `点击左侧导航 Bookings → ${BASE}/merchant/bookings`,
      "切换状态 Tab：Pending / Confirmed / Completed",
      "找到一条 Pending 预约，点击「Accept」",
      "顾客到店后，点击「Check In」",
      "维修完毕，点击「Complete」",
      "若顾客未到，点击「No Show」",
    ],
    results: [
      "显示全部预约列表：顾客姓名、设备型号、预约时间、状态徽章",
      "列表实时过滤，只显示对应状态的预约",
      "状态徽章变为 Confirmed（蓝色）；系统向顾客发送确认通知邮件",
      "状态变为 In Progress（维修中）",
      "状态变为 Completed（绿色）；该笔收入自动计入财务模块",
      "状态标记为 No Show；定金不退还给顾客",
    ],
    entryUrl: `${BASE}/merchant/bookings`,
  },
  {
    portal: "商家端",
    portalColor: "#2563eb",
    flow: "财务报表",
    steps: [
      `点击左侧导航 Finance → ${BASE}/merchant/finance`,
      "点击月份选择器，切换到上个月",
      "查看下方明细表格",
    ],
    results: [
      "显示本月汇总：维修总收入、平台佣金（8%）、净收入、已完成单数",
      "四张汇总卡片数据更新为上月统计值",
      "每行显示：Booking Ref、顾客姓名、维修项目、总金额、佣金、净收入、完成日期",
    ],
    entryUrl: `${BASE}/merchant/finance`,
  },
  {
    portal: "商家端",
    portalColor: "#2563eb",
    flow: "店铺设置",
    steps: [
      `点击左侧导航 Settings → ${BASE}/merchant/settings`,
      "上传店铺 Logo（点击上传区选择图片）",
      "修改营业时间（如：Mon–Fri 09:00–18:00）",
      "修改最大每日预约接单量",
      "点击「Save Changes」",
    ],
    results: [
      "显示设置表单：Logo 上传区、店名、电话、地址、Eircode、营业时间、预约配置",
      "图片上传至 GCS，Logo 预览立即刷新",
      "时间选择器允许按星期设置不同时段",
      "数字输入框限制当日最大接单量",
      "弹出成功提示；刷新页面后新设置已保留",
    ],
    entryUrl: `${BASE}/merchant/settings`,
  },
  {
    portal: "商家端",
    portalColor: "#2563eb",
    flow: "维修项目目录管理",
    steps: [
      `点击左侧导航 Products → ${BASE}/merchant/products`,
      "点击「Browse Catalog」浏览平台维修目录",
      "找到一个项目，点击「Add to My Services」",
      "回到 Products 列表，点击某项目「Edit Price」",
      "修改报价后点击「Save」",
    ],
    results: [
      "显示该店已上架的维修服务列表，含名称、价格、状态",
      "弹出平台维修目录，按设备品类分组展示",
      "该项目加入到店铺服务列表，状态为 Active",
      "弹出价格编辑框",
      "列表价格立即更新；顾客端设备详情页同步显示新价格",
    ],
    entryUrl: `${BASE}/merchant/products`,
  },

  /* ── Admin ── */
  {
    portal: "管理端",
    portalColor: "#7c3aed",
    flow: "登录 & 商家管理",
    steps: [
      "在本页点击「Admin 一键登录」按钮",
      `进入商家管理列表 → ${BASE}/admin/merchants`,
      "点击某商家，查看详情",
      "点击「Activate」激活待审核商家",
      "点击「Suspend」暂停某商家",
    ],
    results: [
      "跳转至 /admin，显示管理后台首页",
      "列出全部商家：名称、状态徽章（Pending / Active / Suspended）、注册时间",
      "显示商家基本信息、店铺资料、历史订单数量",
      "状态变为 Active（绿色）；该商家可开始接受预约",
      "状态变为 Suspended（红色）；商家端无法登录，顾客端不展示该门店",
    ],
    loginEmail: "admin@ierepair.ie",
    entryUrl: `${BASE}/admin/merchants`,
  },
  {
    portal: "管理端",
    portalColor: "#7c3aed",
    flow: "维修项目审核",
    steps: [
      `进入维修项目管理 → ${BASE}/admin/products`,
      "切换 Tab 到 Pending Review",
      "点击某个项目，查看详情",
      "点击「Approve」通过审核",
    ],
    results: [
      "显示全平台所有维修项目，按状态分 Tab",
      "只显示待审核项目列表",
      "显示项目名称、设备适配型号、价格区间、提交商家",
      "状态变为 Active；该维修项目出现在顾客端可搜索列表中",
    ],
    entryUrl: `${BASE}/admin/products`,
  },
  {
    portal: "管理端",
    portalColor: "#7c3aed",
    flow: "平台财务监控",
    steps: [
      `进入财务管理 → ${BASE}/admin/finance`,
      "查看平台汇总卡片",
      "切换月份查看历史数据",
      "查看商家收入明细表格",
    ],
    results: [
      "显示平台本月总成交额、总佣金收入（8%）、活跃商家数、已完成预约总数",
      "四张汇总卡片：GMV、平台佣金、净结算给商家金额、完成单数",
      "数据切换到所选月份的统计",
      "每行显示：商家名称、成交额、佣金金额、净额、完成单数",
    ],
    entryUrl: `${BASE}/admin/finance`,
  },
];

/* ── Portal badge ── */
function PortalBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}

/* ── Steps list ── */
function StepsList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#242424]">
          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[10px] font-bold text-[#555] mt-0.5">
            {i + 1}
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Results list ── */
function ResultsList({ results, color }: { results: string[]; color: string }) {
  return (
    <ol className="space-y-1.5">
      {results.map((r, i) => (
        <li key={i} className="flex gap-2 items-start text-[13px] leading-relaxed text-[#555]">
          <span
            className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[6px]"
            style={{ backgroundColor: color }}
          />
          <span>{r}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Main Page ── */
export default function DemoPage() {
  const accounts = [
    { label: "Merchant 1 一键登录", email: "merchant1@ierepair.ie" },
    { label: "Merchant 2 一键登录", email: "merchant2@ierepair.ie" },
    { label: "Merchant 3 一键登录", email: "merchant3@ierepair.ie" },
    { label: "Admin 一键登录", email: "admin@ierepair.ie" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[rgba(34,42,53,0.08)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1
            className="text-2xl font-semibold text-[#242424]"
            style={{ fontFamily: "'Cal Sans', Outfit, Inter, sans-serif" }}
          >
            IERepair 三端体验测试指引
          </h1>
          <p className="text-sm text-[#898989] mt-1">
            按下方流程逐步操作，即可完整体验消费者、商家、管理员三个视角的核心功能
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Login */}
        <section
          className="bg-white rounded-2xl px-6 py-5"
          style={{ boxShadow: "rgba(34,42,53,0.06) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 4px 16px" }}
        >
          <h2 className="text-sm font-semibold text-[#242424] mb-1">快速登录（商家 & 管理员）</h2>
          <p className="text-xs text-[#898989] mb-4">密码均为 <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-[#242424]">Merchant2024!</code>（Admin：<code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-[#242424]">IERepair2024!</code>）</p>
          <div className="flex flex-wrap gap-3">
            {accounts.map((a) => (
              <DemoLoginButton
                key={a.email}
                label={a.label}
                email={a.email}
                password={a.email.startsWith("admin") ? "IERepair2024!" : "Merchant2024!"}
                loginUrl={
                  a.email.startsWith("admin")
                    ? "/api/v1/auth/admin/login"
                    : "/api/v1/auth/merchant/login"
                }
                redirectUrl={
                  a.email.startsWith("admin") ? "/admin" : "/merchant/dashboard"
                }
              />
            ))}
          </div>
        </section>

        {/* Main Table */}
        <section
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "rgba(34,42,53,0.06) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 4px 16px" }}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f7f7f7] border-b border-[rgba(34,42,53,0.08)]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#898989] w-[22%]">
                  端 · 主流程
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#898989] w-[39%] border-l border-[rgba(34,42,53,0.06)]">
                  操作步骤（点击路径）
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#898989] border-l border-[rgba(34,42,53,0.06)]">
                  预期出现的结果
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`align-top border-b border-[rgba(34,42,53,0.05)] ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}
                >
                  {/* Col 1: Portal + Flow */}
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <PortalBadge label={row.portal} color={row.portalColor} />
                      <p className="text-[13px] font-semibold text-[#242424] leading-snug">{row.flow}</p>
                      {row.entryUrl && (
                        <a
                          href={row.entryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#898989] hover:text-[#242424] underline underline-offset-2 transition-colors"
                        >
                          直接打开
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                      {row.loginEmail && (
                        <p className="text-[11px] text-[#898989]">
                          需先登录：<span className="font-mono">{row.loginEmail}</span>
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Col 2: Steps */}
                  <td className="px-5 py-4 border-l border-[rgba(34,42,53,0.05)]">
                    <StepsList steps={row.steps} />
                  </td>

                  {/* Col 3: Results */}
                  <td className="px-5 py-4 border-l border-[rgba(34,42,53,0.05)]">
                    <ResultsList results={row.results} color={row.portalColor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer note */}
        <p className="text-center text-xs text-[#898989] pb-4">
          用户端预约流程使用 Stripe 测试环境，卡号 <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded">4242 4242 4242 4242</code>，任意有效期和 CVC 均可通过。
        </p>
      </main>
    </div>
  );
}
