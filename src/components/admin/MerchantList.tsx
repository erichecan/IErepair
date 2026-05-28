"use client";

import { useState } from "react";
import Modal from "./Modal";
import FormField, { TextInput } from "./FormField";

type Merchant = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  eircode: string | null;
  isActive: boolean;
  createdAt: string;
};

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", address: "", eircode: "" };

export default function MerchantList({ initialMerchants }: { initialMerchants: Merchant[] }) {
  const [merchants, setMerchants] = useState<Merchant[]>(initialMerchants);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resetId, setResetId] = useState<number | null>(null);
  const [newPwd, setNewPwd] = useState("");

  function field(k: keyof typeof EMPTY_FORM) {
    return { value: form[k], onChange: (v: string) => setForm(prev => ({ ...prev, [k]: v })) };
  }

  async function createMerchant() {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("姓名、邮箱和密码为必填项");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setMerchants(prev => [data.merchant, ...prev]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(merchant: Merchant) {
    const updated = { ...merchant, isActive: !merchant.isActive };
    setMerchants(prev => prev.map(m => m.id === merchant.id ? updated : m));
    await fetch(`/api/admin/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !merchant.isActive }),
    });
  }

  async function resetPassword() {
    if (!newPwd.trim() || !resetId) return;
    await fetch(`/api/admin/merchants/${resetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPwd }),
    });
    setResetId(null);
    setNewPwd("");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => { setShowCreate(true); setError(""); }}
          style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          + 创建门店账号
        </button>
      </div>

      {merchants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73", fontSize: 14 }}>
          暂无门店账号，点击右上角创建第一个
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f7" }}>
                {["门店名称", "邮箱", "电话", "Eircode", "状态", "创建时间", "操作"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => (
                <tr key={m.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{m.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#3c3c43" }}>{m.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{m.phone || "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73", fontFamily: "monospace" }}>{m.eircode || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => toggleActive(m)}
                      style={{
                        padding: "3px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                        border: "none", cursor: "pointer",
                        background: m.isActive ? "#e6f7ee" : "#f5f5f7",
                        color: m.isActive ? "#146345" : "#6e6e73",
                      }}
                    >
                      {m.isActive ? "已启用" : "已停用"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#aeaeb2", whiteSpace: "nowrap" }}>
                    {new Date(m.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => { setResetId(m.id); setNewPwd(""); }}
                      style={{ fontSize: 12, color: "#146345", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      重置密码
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="创建门店账号" onClose={() => setShowCreate(false)}>
          <FormField label="门店名称" required>
            <TextInput {...field("name")} placeholder="例：Dublin City Repair" required />
          </FormField>
          <FormField label="登录邮箱" required>
            <TextInput {...field("email")} type="email" placeholder="merchant@example.com" required />
          </FormField>
          <FormField label="初始密码" required>
            <TextInput {...field("password")} type="password" placeholder="至少 8 位" required />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="联系电话">
              <TextInput {...field("phone")} placeholder="+353 87 000 0000" />
            </FormField>
            <FormField label="Eircode">
              <TextInput {...field("eircode")} placeholder="D01 AB23" />
            </FormField>
          </div>
          <FormField label="门店地址">
            <TextInput {...field("address")} placeholder="123 O'Connell St, Dublin 1" />
          </FormField>

          {error && <p style={{ color: "#ff3b30", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button
              onClick={() => setShowCreate(false)}
              style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}
            >
              取消
            </button>
            <button
              onClick={createMerchant}
              disabled={saving}
              style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "创建中…" : "创建账号"}
            </button>
          </div>
        </Modal>
      )}

      {resetId !== null && (
        <Modal title="重置密码" onClose={() => setResetId(null)} width={400}>
          <FormField label="新密码" required>
            <TextInput value={newPwd} onChange={setNewPwd} type="password" placeholder="输入新密码" />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setResetId(null)} style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}>取消</button>
            <button onClick={resetPassword} style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>确认重置</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
