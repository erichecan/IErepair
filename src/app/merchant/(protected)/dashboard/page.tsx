import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/merchant-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MerchantDashboard() {
  const session = await getMerchantSession();
  if (!session) redirect("/merchant/login");

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: { name: true, mustChangePassword: true, eircode: true, lat: true, lng: true, description: true },
  });

  if (merchant?.mustChangePassword) redirect("/merchant/change-password");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [productCount, serviceCount, hoursCount, todayBookings, pendingBookings, recentBookings] = await Promise.all([
    prisma.merchantProduct.count({ where: { merchantId: session.merchantId, isActive: true } }),
    prisma.merchantService.count({ where: { merchantId: session.merchantId, isActive: true } }),
    prisma.merchantHours.count({ where: { merchantId: session.merchantId, isClosed: false } }),
    prisma.repairBooking.count({
      where: { merchantId: session.merchantId, appointmentTime: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.repairBooking.count({
      where: { merchantId: session.merchantId, status: "pending_confirm" },
    }),
    prisma.repairBooking.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { repairService: { include: { deviceModel: { include: { brand: true } }, repairType: true } } },
    }),
  ]);

  const onboardingSteps = [
    { label: "配置门店信息", done: !!merchant?.eircode, href: "/merchant/settings" },
    { label: "设置营业时间", done: hoursCount > 0, href: "/merchant/settings?tab=hours" },
    { label: "添加维修服务", done: serviceCount > 0, href: "/merchant/services" },
    { label: "选择销售商品", done: productCount > 0, href: "/merchant/products" },
  ];
  const doneCount = onboardingSteps.filter(s => s.done).length;
  const allDone = doneCount === onboardingSteps.length;

  const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
    pending_confirm: { text: "待确认", color: "#b45309", bg: "#fef3c7" },
    confirmed: { text: "已确认", color: "#146345", bg: "#e8f7f0" },
    completed: { text: "已完成", color: "#6e6e73", bg: "#f5f5f7" },
    cancelled: { text: "已取消", color: "#c0392b", bg: "#fff1f0" },
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>
          欢迎回来，{merchant?.name ?? "商家"}
        </h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>工作台总览</p>
      </div>

      {!allDone && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>入驻引导</div>
            <div style={{ fontSize: 13, color: "#6e6e73" }}>{doneCount} / {onboardingSteps.length} 已完成</div>
          </div>
          <div style={{ height: 6, background: "#f0f0f5", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${(doneCount / onboardingSteps.length) * 100}%`, background: "#146345", borderRadius: 3 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {onboardingSteps.map((step) => (
              <Link key={step.label} href={step.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: step.done ? "#f0faf5" : "#f9f9f9", borderRadius: 8, border: `1px solid ${step.done ? "#a8e6cb" : "#e5e5ea"}` }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "#146345" : "#d1d1d6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 13 }}>{step.done ? "✓" : "·"}</span>
                  </div>
                  <span style={{ fontSize: 14, color: step.done ? "#146345" : "#1d1d1f", fontWeight: step.done ? 500 : 400 }}>{step.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "今日预约", value: todayBookings, href: "/merchant/bookings", unit: "单", highlight: true },
          { label: "待确认", value: pendingBookings, href: "/merchant/bookings", unit: "单", warn: pendingBookings > 0 },
          { label: "上架商品", value: productCount, href: "/merchant/products", unit: "件" },
          { label: "开放服务", value: serviceCount, href: "/merchant/services", unit: "项" },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${(stat as { warn?: boolean }).warn ? "#fde68a" : "#e5e5ea"}`, padding: "20px 24px", cursor: "pointer" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: (stat as { warn?: boolean }).warn ? "#b45309" : "#1d1d1f" }}>{stat.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginTop: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 2 }}>{stat.unit}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: 0 }}>最近预约</h2>
          <Link href="/merchant/bookings" style={{ fontSize: 13, color: "#146345", textDecoration: "none" }}>查看全部</Link>
        </div>
        {recentBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#aeaeb2", fontSize: 14 }}>暂无预约记录</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentBookings.map(b => {
              const s = statusLabel[b.status] ?? { text: b.status, color: "#6e6e73", bg: "#f5f5f7" };
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{b.orderNumber}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                      {b.repairService.deviceModel.brand.name} {b.repairService.deviceModel.name} · {b.repairService.repairType.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#6e6e73", whiteSpace: "nowrap" }}>{b.userName}</div>
                  <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{s.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: "0 0 16px" }}>快速入口</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "预约管理", href: "/merchant/bookings" },
            { label: "管理维修服务", href: "/merchant/services" },
            { label: "选择销售商品", href: "/merchant/products/catalog" },
            { label: "我的商品", href: "/merchant/products" },
            { label: "门店设置", href: "/merchant/settings" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ padding: "10px 20px", background: "#f5f5f7", borderRadius: 8, fontSize: 14, color: "#1d1d1f", textDecoration: "none", fontWeight: 500 }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
