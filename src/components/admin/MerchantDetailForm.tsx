"use client";

import { useState } from "react";
import FormField, { TextInput } from "./FormField";

type Merchant = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  eircode: string | null;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const inputStyle = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d1d6",
  fontSize: 14, width: "100%", boxSizing: "border-box" as const,
};

export default function MerchantDetailForm({ merchant: initial }: { merchant: Merchant }) {
  const [merchant, setMerchant] = useState(initial);
  const [form, setForm] = useState({
    name: initial.name,
    phone: initial.phone ?? "",
    address: initial.address ?? "",
    eircode: initial.eircode ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  function field(k: keyof typeof form) {
    return { value: form[k], onChange: (v: string) => setForm(prev => ({ ...prev, [k]: v })) };
  }

  async function saveInfo() {
    setSaving(true); setSaveMsg("");
    const res = await fetch(`/api/admin/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address, eircode: form.eircode }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMerchant(prev => ({ ...prev, ...data.merchant, updatedAt: new Date().toISOString() }));
      setSaveMsg("已保存");
      setTimeout(() => setSaveMsg(""), 2500);
    } else {
      setSaveMsg(data.error || "保存失败");
    }
  }

  async function toggleActive() {
    const next = !merchant.isActive;
    setMerchant(prev => ({ ...prev, isActive: next }));
    await fetch(`/api/admin/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
  }

  async function resetPassword() {
    if (!newPwd.trim()) return;
    setPwdSaving(true); setPwdMsg("");
    const res = await fetch(`/api/admin/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPwd }),
    });
    setPwdSaving(false);
    if (res.ok) {
      setNewPwd(""); setPwdMsg("密码已重置");
      setTimeout(() => setPwdMsg(""), 2500);
    } else {
      const data = await res.json();
      setPwdMsg(data.error || "重置失败");
    }
  }

  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea",
    padding: 24, marginBottom: 20,
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", margin: "0 0 18px" }}>基本信息</h2>
        <FormField label="门店名称" required>
          <TextInput {...field("name")} placeholder="门店名称" required />
        </FormField>
        <FormField label="登录邮箱">
          <input value={merchant.email} disabled style={{ ...inputStyle, background: "#f5f5f7", color: "#aeaeb2" }} />
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

        {merchant.lat && merchant.lng ? (
          <p style={{ fontSize: 12, color: "#34c759", margin: "4px 0 12px" }}>
            ✓ 坐标已解析：{merchant.lat.toFixed(5)}, {merchant.lng.toFixed(5)}
          </p>
        ) : (
          <p style={{ fontSize: 12, color: "#aeaeb2", margin: "4px 0 12px" }}>
            坐标未解析（保存 Eircode 后自动解析，需配置 GOOGLE_MAPS_API_KEY）
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <button
            onClick={saveInfo}
            disabled={saving}
            style={{
              padding: "9px 22px", background: "#146345", color: "#fff", border: "none",
              borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "保存中…" : "保存信息"}
          </button>
          {saveMsg && <span style={{ fontSize: 13, color: saveMsg === "已保存" ? "#34c759" : "#ff3b30" }}>{saveMsg}</span>}
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", margin: "0 0 18px" }}>账号状态</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "#3c3c43" }}>当前状态：</span>
          <button
            onClick={toggleActive}
            style={{
              padding: "6px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer",
              background: merchant.isActive ? "#e6f7ee" : "#f5f5f7",
              color: merchant.isActive ? "#146345" : "#6e6e73",
            }}
          >
            {merchant.isActive ? "已启用 — 点击停用" : "已停用 — 点击启用"}
          </button>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", margin: "0 0 18px" }}>重置密码</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <FormField label="新密码">
              <TextInput value={newPwd} onChange={setNewPwd} type="password" placeholder="输入新密码" />
            </FormField>
          </div>
          <button
            onClick={resetPassword}
            disabled={pwdSaving || !newPwd.trim()}
            style={{
              padding: "9px 20px", background: "#146345", color: "#fff", border: "none",
              borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: (pwdSaving || !newPwd.trim()) ? "default" : "pointer",
              opacity: (pwdSaving || !newPwd.trim()) ? 0.5 : 1, flexShrink: 0,
            }}
          >
            {pwdSaving ? "重置中…" : "确认重置"}
          </button>
        </div>
        {pwdMsg && (
          <p style={{ fontSize: 13, color: pwdMsg === "密码已重置" ? "#34c759" : "#ff3b30", marginTop: 8 }}>
            {pwdMsg}
          </p>
        )}
      </div>

      <div style={{ fontSize: 12, color: "#aeaeb2" }}>
        创建时间：{new Date(merchant.createdAt).toLocaleString("zh-CN")} ·
        最后更新：{new Date(merchant.updatedAt).toLocaleString("zh-CN")}
      </div>
    </div>
  );
}
