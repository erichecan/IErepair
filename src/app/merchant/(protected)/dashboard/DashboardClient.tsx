"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface RecentBooking {
  id: number;
  orderNumber: string;
  status: string;
  userName: string;
  repairService: {
    deviceModel: { name: string; brand: { name: string } };
    repairType: { name: string };
  };
}

interface DashboardClientProps {
  merchantName: string;
  eircode: string | null;
  hoursCount: number;
  productCount: number;
  serviceCount: number;
  todayBookings: number;
  pendingBookings: number;
  recentBookings: RecentBooking[];
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending_confirm: { color: "#b45309", bg: "#fef3c7" },
  confirmed: { color: "#146345", bg: "#e8f7f0" },
  completed: { color: "#6e6e73", bg: "#f5f5f7" },
  cancelled: { color: "#c0392b", bg: "#fff1f0" },
};

export default function DashboardClient({
  merchantName,
  eircode,
  hoursCount,
  productCount,
  serviceCount,
  todayBookings,
  pendingBookings,
  recentBookings,
}: DashboardClientProps) {
  const [lang] = useLang("zh");
  const t = useMerchantT(lang);

  const statusLabels: Record<string, string> = {
    pending_confirm: t.statusPending,
    confirmed: t.statusConfirmed,
    completed: t.statusCompleted,
    cancelled: t.statusCancelled,
  };

  const onboardingSteps = [
    { label: t.onboardingStep1, done: !!eircode, href: "/merchant/settings" },
    { label: t.onboardingStep2, done: hoursCount > 0, href: "/merchant/settings?tab=hours" },
    { label: t.onboardingStep3, done: serviceCount > 0, href: "/merchant/services" },
    { label: t.onboardingStep4, done: productCount > 0, href: "/merchant/products" },
  ];
  const doneCount = onboardingSteps.filter(s => s.done).length;
  const allDone = doneCount === onboardingSteps.length;

  const stats = [
    { label: t.statToday, value: todayBookings, href: "/merchant/bookings", unit: t.statUnitBooking, highlight: true },
    { label: t.statPending, value: pendingBookings, href: "/merchant/bookings", unit: t.statUnitBooking, warn: pendingBookings > 0 },
    { label: t.statProducts, value: productCount, href: "/merchant/products", unit: t.statUnitProduct },
    { label: t.statServices, value: serviceCount, href: "/merchant/services", unit: t.statUnitService },
  ];

  const quickLinks = [
    { label: t.navBookings, href: "/merchant/bookings" },
    { label: t.quickLinkManageServices, href: "/merchant/services" },
    { label: t.quickLinkProductCatalog, href: "/merchant/products/catalog" },
    { label: t.navProducts, href: "/merchant/products" },
    { label: t.navSettings, href: "/merchant/settings" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>
          {t.welcomeBack(merchantName)}
        </h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>{t.dashboardTitle}</p>
      </div>

      {!allDone && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>{t.onboardingTitle}</div>
            <div style={{ fontSize: 13, color: "#6e6e73" }}>{t.onboardingProgress(doneCount, onboardingSteps.length)}</div>
          </div>
          <div style={{ height: 6, background: "#f0f0f5", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ height: "100%", width: `${(doneCount / onboardingSteps.length) * 100}%`, background: "#146345", borderRadius: 3 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {onboardingSteps.map((step) => (
              <Link key={step.href} href={step.href} style={{ textDecoration: "none" }}>
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
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${stat.warn ? "#fde68a" : "#e5e5ea"}`, padding: "20px 24px", cursor: "pointer" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: stat.warn ? "#b45309" : "#1d1d1f" }}>{stat.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginTop: 4 }}>{stat.label}</div>
              {stat.unit && <div style={{ fontSize: 12, color: "#aeaeb2", marginTop: 2 }}>{stat.unit}</div>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: 0 }}>{t.recentBookings}</h2>
          <Link href="/merchant/bookings" style={{ fontSize: 13, color: "#146345", textDecoration: "none" }}>{t.viewAll}</Link>
        </div>
        {recentBookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#aeaeb2", fontSize: 14 }}>{t.noBookings}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentBookings.map(b => {
              const s = STATUS_COLORS[b.status] ?? STATUS_COLORS.cancelled;
              const statusText = statusLabels[b.status] ?? b.status;
              return (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{b.orderNumber}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>
                      {b.repairService.deviceModel.brand.name} {b.repairService.deviceModel.name} · {b.repairService.repairType.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#6e6e73", whiteSpace: "nowrap" }}>{b.userName}</div>
                  <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>{statusText}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "24px 28px" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", margin: "0 0 16px" }}>{t.quickLinks}</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {quickLinks.map(item => (
            <Link key={item.href} href={item.href} style={{ padding: "10px 20px", background: "#f5f5f7", borderRadius: 8, fontSize: 14, color: "#1d1d1f", textDecoration: "none", fontWeight: 500 }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
