"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

interface Merchant {
  id: number; name: string; email: string; phone: string | null;
  address: string | null; eircode: string | null; description: string | null;
  lat: number | null; lng: number | null;
}

interface HourRow {
  dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean;
}

interface Props {
  merchant: Merchant;
  hours: HourRow[];
}

function buildDefaultHours(saved: HourRow[]): HourRow[] {
  const map = new Map(saved.map(h => [h.dayOfWeek, h]));
  return Array.from({ length: 7 }, (_, i) => map.get(i) ?? { dayOfWeek: i, openTime: "09:00", closeTime: "18:00", isClosed: i === 0 || i === 6 });
}

export default function MerchantSettingsClient({ merchant, hours }: Props) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const [tab, setTab] = useState<"info" | "hours" | "security">(
    tabParam === "hours" ? "hours" : tabParam === "security" ? "security" : "info"
  );

  const [info, setInfo] = useState({
    name: merchant.name,
    phone: merchant.phone ?? "",
    address: merchant.address ?? "",
    eircode: merchant.eircode ?? "",
    description: merchant.description ?? "",
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const [hourRows, setHourRows] = useState<HourRow[]>(buildDefaultHours(hours));
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursMsg, setHoursMsg] = useState("");

  const [sec, setSec] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [secSaving, setSecSaving] = useState(false);
  const [secMsg, setSecMsg] = useState("");

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg("");
    setInfoSaving(true);
    try {
      const res = await fetch("/api/merchant/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });
      const data = await res.json();
      if (!res.ok) { setInfoMsg(data.error || "保存失败"); return; }
      setInfoMsg("保存成功");
    } catch { setInfoMsg("网络错误"); } finally { setInfoSaving(false); }
  }

  async function saveHours(e: React.FormEvent) {
    e.preventDefault();
    setHoursMsg("");
    setHoursSaving(true);
    try {
      const res = await fetch("/api/merchant/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: hourRows }),
      });
      const data = await res.json();
      if (!res.ok) { setHoursMsg(data.error || "保存失败"); return; }
      setHoursMsg("保存成功");
    } catch { setHoursMsg("网络错误"); } finally { setHoursSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecMsg("");
    if (sec.newPassword.length < 8) { setSecMsg("新密码至少 8 位"); return; }
    if (sec.newPassword !== sec.confirm) { setSecMsg("两次密码不一致"); return; }
    setSecSaving(true);
    try {
      const res = await fetch("/api/merchant/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: sec.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setSecMsg(data.error || "修改失败"); return; }
      setSecMsg("密码已修改");
      setSec({ currentPassword: "", newPassword: "", confirm: "" });
    } catch { setSecMsg("网络错误"); } finally { setSecSaving(false); }
  }

  function copyHoursFromDay(srcDay: number) {
    const src = hourRows.find(h => h.dayOfWeek === srcDay);
    if (!src) return;
    setHourRows(rows => rows.map(r => r.dayOfWeek === srcDay ? r : { ...r, openTime: src.openTime, closeTime: src.closeTime, isClosed: src.isClosed }));
  }

  const tabStyle = (t: string) => ({
    padding: "8px 20px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    background: tab === t ? "#146345" : "transparent",
    color: tab === t ? "#fff" : "#6e6e73",
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>门店设置</h1>
      </div>

      <div style={{ display: "flex", gap: 4, background: "#f5f5f7", padding: 4, borderRadius: 24, width: "fit-content", marginBottom: 28 }}>
        {(["info", "hours", "security"] as const).map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t === "info" ? "门店信息" : t === "hours" ? "营业时间" : "账号安全"}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px" }}>
          <form onSubmit={saveInfo}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {[
                { label: "门店名称", key: "name", required: true },
                { label: "联系电话", key: "phone" },
                { label: "门店地址", key: "address" },
                { label: "Eircode", key: "eircode", placeholder: "D01 AB23" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                    {f.label}{f.required && <span style={{ color: "#c0392b" }}> *</span>}
                  </label>
                  <input
                    value={info[f.key as keyof typeof info]}
                    onChange={e => setInfo(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required={f.required}
                    placeholder={f.placeholder}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                门店简介 <span style={{ fontWeight: 400, color: "#aeaeb2" }}>（展示在消费者端，最多 500 字）</span>
              </label>
              <textarea
                value={info.description}
                onChange={e => setInfo(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={4}
                placeholder="介绍您的门店特色、技术优势、服务承诺等..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: "#aeaeb2", marginTop: 4 }}>
                {info.description.length} / 500
              </div>
            </div>

            {merchant.lat && (
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 16 }}>
                坐标：{merchant.lat?.toFixed(5)}, {merchant.lng?.toFixed(5)} — 已解析
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button type="submit" disabled={infoSaving} style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: infoSaving ? "not-allowed" : "pointer", opacity: infoSaving ? 0.7 : 1 }}>
                {infoSaving ? "保存中..." : "保存"}
              </button>
              {infoMsg && <span style={{ fontSize: 13, color: infoMsg === "保存成功" ? "#146345" : "#c0392b" }}>{infoMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {tab === "hours" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px" }}>
          <form onSubmit={saveHours}>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => copyHoursFromDay(1)}
                style={{ fontSize: 13, padding: "6px 14px", background: "#f5f5f7", border: "none", borderRadius: 6, cursor: "pointer", color: "#1d1d1f" }}
              >
                将周一时间复制到所有工作日
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {hourRows.map((row, idx) => (
                <div key={row.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 8 }}>
                  <div style={{ width: 40, fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{DAYS[row.dayOfWeek]}</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#6e6e73", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={e => setHourRows(rows => rows.map((r, i) => i === idx ? { ...r, isClosed: e.target.checked } : r))}
                    />
                    休息
                  </label>
                  {!row.isClosed && (
                    <>
                      <input
                        type="time"
                        value={row.openTime ?? "09:00"}
                        onChange={e => setHourRows(rows => rows.map((r, i) => i === idx ? { ...r, openTime: e.target.value } : r))}
                        style={{ padding: "6px 10px", border: "1px solid #d1d1d6", borderRadius: 6, fontSize: 14 }}
                      />
                      <span style={{ color: "#6e6e73" }}>—</span>
                      <input
                        type="time"
                        value={row.closeTime ?? "18:00"}
                        onChange={e => setHourRows(rows => rows.map((r, i) => i === idx ? { ...r, closeTime: e.target.value } : r))}
                        style={{ padding: "6px 10px", border: "1px solid #d1d1d6", borderRadius: 6, fontSize: 14 }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
              <button type="submit" disabled={hoursSaving} style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: hoursSaving ? "not-allowed" : "pointer", opacity: hoursSaving ? 0.7 : 1 }}>
                {hoursSaving ? "保存中..." : "保存营业时间"}
              </button>
              {hoursMsg && <span style={{ fontSize: 13, color: hoursMsg === "保存成功" ? "#146345" : "#c0392b" }}>{hoursMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {tab === "security" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px", maxWidth: 480 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px", color: "#1d1d1f" }}>修改密码</h3>
          <form onSubmit={savePassword}>
            {[
              { label: "新密码", key: "newPassword", min: 8 },
              { label: "确认新密码", key: "confirm" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>{f.label}</label>
                <input
                  type="password"
                  value={sec[f.key as keyof typeof sec]}
                  onChange={e => setSec(prev => ({ ...prev, [f.key]: e.target.value }))}
                  required
                  minLength={f.min}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button type="submit" disabled={secSaving} style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: secSaving ? "not-allowed" : "pointer", opacity: secSaving ? 0.7 : 1 }}>
                {secSaving ? "保存中..." : "修改密码"}
              </button>
              {secMsg && <span style={{ fontSize: 13, color: secMsg.includes("已修改") ? "#146345" : "#c0392b" }}>{secMsg}</span>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
