"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useLang("zh");
  const t = useMerchantT(lang);
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
        setError(data.error || t.loginError);
        return;
      }
      if (data.mustChangePassword) {
        router.push("/merchant/change-password");
      } else {
        router.push("/merchant/dashboard");
      }
    } catch {
      setError(t.loginError);
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
      if (!res.ok) { setError(data.error || t.loginError); return; }
      if (data.mustChangePassword) {
        router.push("/merchant/change-password");
      } else {
        router.push("/merchant/dashboard");
      }
    } catch {
      setError(t.loginError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1c3830" }}>IERepair</div>
          <div style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>{t.loginTitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            style={{ padding: "4px 12px", background: "transparent", border: "1px solid #d1d1d6", borderRadius: 20, fontSize: 12, color: "#6e6e73", cursor: "pointer" }}
          >
            {t.langToggle}
          </button>
        </div>

        <button
          onClick={quickLogin}
          disabled={loading}
          style={{ width: "100%", padding: "10px", background: "#f0faf5", border: "1.5px dashed #146345", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#146345", cursor: loading ? "not-allowed" : "pointer", marginBottom: 20 }}
        >
          🚀 {t.loginQuick}
        </button>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              {t.loginEmail}
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
              {t.loginPassword}
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
            {loading ? t.loginLoading : t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
