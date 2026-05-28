"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

interface Session {
  adminId: number;
  email: string;
  role: string;
}

export default function AdminSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const navItems = [
    { href: "/admin/dashboard", label: "数据概览", icon: "📊" },
    { href: "/admin/repair-catalog", label: "维修目录", icon: "🗂️" },
    { href: "/admin/merchants", label: "门店管理", icon: "🏪" },
    { href: "/admin/products", label: "商品母库", icon: "📦" },
    { href: "/admin/categories", label: "品类管理", icon: "🏷️" },
  ];

  return (
    <aside style={{ width: 220, background: "var(--color-header-bg, #1c3830)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>IERepair</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>管理后台</div>
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
          onClick={handleLogout}
          style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer" }}
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
