"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MerchantLoginPage() {
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
      const res = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "登录失败");
        return;
      }
      if (data.mustChangePassword) {
        router.push("/merchant/change-password");
      } else {
        router.push("/merchant/dashboard");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin() {
    setEmail("merchant@ierepair.ie");
    setPassword("merchant123");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "merchant@ierepair.ie", password: "merchant123" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "登录失败"); return; }
      if (data.mustChangePassword) {
        router.push("/merchant/change-password");
      } else {
        router.push("/merchant/dashboard");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1c3830" }}>IERepair</div>
          <div style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>商家管理中心</div>
        </div>

        <button
          onClick={quickLogin}
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: "#f0faf5", border: "1.5px dashed #146345", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#146345", cursor: loading ? "not-allowed" : "pointer", marginBottom: 20 }}
        >
          🚀 一键登录（测试用）
        </button>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
