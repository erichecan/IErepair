"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    if (newPassword !== confirm) {
      setError("两次密码不一致");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/merchant/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "修改失败");
        return;
      }
      router.push("/merchant/dashboard");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "40px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", margin: "0 0 8px" }}>设置新密码</h1>
        <p style={{ fontSize: 14, color: "#6e6e73", margin: "0 0 28px" }}>
          首次登录需要修改初始密码。请设置一个至少 8 位的安全密码。
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              新密码
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="至少 8 位"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
              确认新密码
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="再次输入新密码"
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
            {loading ? "保存中..." : "保存并进入工作台"}
          </button>
        </form>
      </div>
    </div>
  );
}
