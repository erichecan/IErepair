"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface Session {
  merchantId: number;
  email: string;
}

export default function MerchantSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useLang("zh");
  const t = useMerchantT(lang);

  async function handleLogout() {
    await fetch("/api/merchant/auth/logout", { method: "POST" });
    router.push("/merchant/login");
  }

  const navItems = [
    { href: "/merchant/dashboard", label: t.navDashboard, icon: "📊" },
    { href: "/merchant/bookings", label: t.navBookings, icon: "📋" },
    { href: "/merchant/checkin", label: t.navCheckin, icon: "🔍" },
    { href: "/merchant/services", label: t.navServices, icon: "🔧" },
    { href: "/merchant/products", label: t.navProducts, icon: "📦" },
    { href: "/merchant/reviews", label: t.navReviews, icon: "⭐" },
    { href: "/merchant/settings", label: t.navSettings, icon: "⚙️" },
  ];

  return (
    <aside style={{ width: 220, background: "var(--color-header-bg, #1c3830)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>IERepair</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{t.sidebarTitle}</div>
      </div>

      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                textDecoration: "none",
                marginBottom: 4,
                transition: "background 0.15s",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.email}
        </div>
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          style={{ width: "100%", padding: "7px 12px", background: "#17db66", border: "none", borderRadius: 6, color: "#1c3830", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}
        >
          🌐 {t.langToggle}
        </button>
        <button
          onClick={handleLogout}
          style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}
        >
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
