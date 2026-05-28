"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      router.push("/admin/repair-catalog");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "48px 40px", width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: "var(--color-accent, #146345)", borderRadius: 12, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>IERepair 管理后台</h1>
          <p style={{ fontSize: 14, color: "#6e6e73", marginTop: 4 }}>请使用管理员账号登录</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1d1d1f", marginBottom: 6 }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ierepair.ie"
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d2d7", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#1d1d1f", marginBottom: 6 }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d2d2d7", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ padding: "10px 12px", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, fontSize: 13, color: "#cc0000" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px", background: "var(--color-accent, #146345)", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 8 }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
