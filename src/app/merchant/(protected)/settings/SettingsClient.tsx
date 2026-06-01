"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

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
  initialImages: string[];
  stripeConfigured: boolean;
}

function buildDefaultHours(saved: HourRow[]): HourRow[] {
  const map = new Map(saved.map(h => [h.dayOfWeek, h]));
  return Array.from({ length: 7 }, (_, i) => map.get(i) ?? { dayOfWeek: i, openTime: "09:00", closeTime: "18:00", isClosed: i === 0 || i === 6 });
}

export default function MerchantSettingsClient({ merchant, hours, initialImages, stripeConfigured }: Props) {
  const [lang] = useLang("zh");
  const t = useMerchantT(lang);

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const [tab, setTab] = useState<"info" | "hours" | "images" | "stripe" | "security">(
    tabParam === "hours" ? "hours" : tabParam === "images" ? "images" : tabParam === "stripe" ? "stripe" : tabParam === "security" ? "security" : "info"
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
  const [infoSuccess, setInfoSuccess] = useState(false);

  const [hourRows, setHourRows] = useState<HourRow[]>(buildDefaultHours(hours));
  const [hoursSaving, setHoursSaving] = useState(false);
  const [hoursMsg, setHoursMsg] = useState("");
  const [hoursSuccess, setHoursSuccess] = useState(false);

  const [images, setImages] = useState<string[]>(initialImages);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgMsg, setImgMsg] = useState("");
  const [imgSuccess, setImgSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stripe, setStripe] = useState({ publishableKey: "", secretKey: "" });
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeMsg, setStripeMsg] = useState("");
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [stripeOk, setStripeOk] = useState(stripeConfigured);

  const [sec, setSec] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [secSaving, setSecSaving] = useState(false);
  const [secMsg, setSecMsg] = useState("");
  const [secSuccess, setSecSuccess] = useState(false);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg(""); setInfoSuccess(false);
    setInfoSaving(true);
    try {
      const res = await fetch("/api/merchant/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(info),
      });
      const data = await res.json();
      if (!res.ok) { setInfoMsg(data.error || t.settingsFailed); setInfoSuccess(false); return; }
      setInfoMsg(t.settingsSaved); setInfoSuccess(true);
    } catch { setInfoMsg(t.settingsNetworkError); setInfoSuccess(false); } finally { setInfoSaving(false); }
  }

  async function saveHours(e: React.FormEvent) {
    e.preventDefault();
    setHoursMsg(""); setHoursSuccess(false);
    setHoursSaving(true);
    try {
      const res = await fetch("/api/merchant/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: hourRows }),
      });
      const data = await res.json();
      if (!res.ok) { setHoursMsg(data.error || t.settingsFailed); setHoursSuccess(false); return; }
      setHoursMsg(t.settingsSaved); setHoursSuccess(true);
    } catch { setHoursMsg(t.settingsNetworkError); setHoursSuccess(false); } finally { setHoursSaving(false); }
  }

  async function uploadImage(file: File) {
    setImgMsg(""); setImgSuccess(false); setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/merchant/images", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setImgMsg(data.error || t.settingsFailed); setImgSuccess(false); return; }
      setImages(data.images);
      setImgMsg(t.settingsImgUploaded); setImgSuccess(true);
    } catch { setImgMsg(t.settingsNetworkError); setImgSuccess(false); } finally { setImgUploading(false); }
  }

  async function deleteImage(url: string) {
    if (!confirm(t.settingsImgDeleteConfirm)) return;
    setImgMsg(""); setImgSuccess(false);
    try {
      const res = await fetch("/api/merchant/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) { setImgMsg(data.error || t.settingsFailed); setImgSuccess(false); return; }
      setImages(data.images);
      setImgMsg(t.settingsImgDeleted); setImgSuccess(true);
    } catch { setImgMsg(t.settingsNetworkError); setImgSuccess(false); }
  }

  async function saveStripe(e: React.FormEvent) {
    e.preventDefault();
    setStripeMsg(""); setStripeSuccess(false);
    setStripeSaving(true);
    try {
      const body: Record<string, string> = {};
      if (stripe.publishableKey.trim()) body.stripePublishableKey = stripe.publishableKey.trim();
      if (stripe.secretKey.trim()) body.stripeSecretKey = stripe.secretKey.trim();
      const res = await fetch("/api/merchant/stripe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setStripeMsg(data.error || t.settingsFailed); setStripeSuccess(false); return; }
      setStripeMsg(t.settingsStripeSaved); setStripeSuccess(true);
      setStripe({ publishableKey: "", secretKey: "" });
      setStripeOk(true);
    } catch { setStripeMsg(t.settingsNetworkError); setStripeSuccess(false); } finally { setStripeSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSecMsg(""); setSecSuccess(false);
    if (sec.newPassword.length < 8) { setSecMsg(t.settingsPwdErrShort); return; }
    if (sec.newPassword !== sec.confirm) { setSecMsg(t.settingsPwdErrMismatch); return; }
    setSecSaving(true);
    try {
      const res = await fetch("/api/merchant/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: sec.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setSecMsg(data.error || t.settingsPwdErrFailed); setSecSuccess(false); return; }
      setSecMsg(t.settingsPwdChanged); setSecSuccess(true);
      setSec({ currentPassword: "", newPassword: "", confirm: "" });
    } catch { setSecMsg(t.settingsNetworkError); setSecSuccess(false); } finally { setSecSaving(false); }
  }

  function copyHoursFromDay(srcDay: number) {
    const src = hourRows.find(h => h.dayOfWeek === srcDay);
    if (!src) return;
    setHourRows(rows => rows.map(r => r.dayOfWeek === srcDay ? r : { ...r, openTime: src.openTime, closeTime: src.closeTime, isClosed: src.isClosed }));
  }

  const tabStyle = (t2: string) => ({
    padding: "8px 20px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    background: tab === t2 ? "#146345" : "transparent",
    color: tab === t2 ? "#fff" : "#6e6e73",
  });

  const tabLabels: Record<string, string> = {
    info: t.settingsTabInfo,
    hours: t.settingsTabHours,
    images: t.settingsTabImages,
    stripe: t.settingsTabStripe,
    security: t.settingsTabSecurity,
  };

  const infoFields = [
    { label: t.settingsStoreName, key: "name", required: true },
    { label: t.settingsPhone, key: "phone" },
    { label: t.settingsAddress, key: "address" },
    { label: t.settingsEircode, key: "eircode", placeholder: "D01 AB23" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>{t.navSettings}</h1>
      </div>

      <div style={{ display: "flex", gap: 4, background: "#f5f5f7", padding: 4, borderRadius: 24, width: "fit-content", marginBottom: 28, flexWrap: "wrap" }}>
        {(["info", "hours", "images", "stripe", "security"] as const).map(k => (
          <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>
            {tabLabels[k]}
            {k === "stripe" && (
              <span style={{ marginLeft: 5, fontSize: 10, verticalAlign: "middle" }}>
                {stripeOk ? "✅" : "⚠️"}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px" }}>
          <form onSubmit={saveInfo}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {infoFields.map(f => (
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
                {t.settingsDesc} <span style={{ fontWeight: 400, color: "#aeaeb2" }}>{t.settingsDescNote}</span>
              </label>
              <textarea
                value={info.description}
                onChange={e => setInfo(prev => ({ ...prev, description: e.target.value }))}
                maxLength={500}
                rows={4}
                placeholder={t.settingsDescPlaceholder}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              />
              <div style={{ textAlign: "right", fontSize: 12, color: "#aeaeb2", marginTop: 4 }}>
                {info.description.length} / 500
              </div>
            </div>

            {merchant.lat && (
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 16 }}>
                {t.settingsCoordParsed(merchant.lat.toFixed(5), (merchant.lng ?? 0).toFixed(5))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button type="submit" disabled={infoSaving} style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: infoSaving ? "not-allowed" : "pointer", opacity: infoSaving ? 0.7 : 1 }}>
                {infoSaving ? t.settingsSaving : t.settingsSave}
              </button>
              {infoMsg && <span style={{ fontSize: 13, color: infoSuccess ? "#146345" : "#c0392b" }}>{infoMsg}</span>}
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
                {t.settingsCopyHours}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {hourRows.map((row, idx) => (
                <div key={row.dayOfWeek} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 8 }}>
                  <div style={{ width: 40, fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{t.settingsDays[row.dayOfWeek]}</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#6e6e73", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={row.isClosed}
                      onChange={e => setHourRows(rows => rows.map((r, i) => i === idx ? { ...r, isClosed: e.target.checked } : r))}
                    />
                    {t.settingsClosed}
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
                {hoursSaving ? t.settingsSaving : t.settingsSaveHours}
              </button>
              {hoursMsg && <span style={{ fontSize: 13, color: hoursSuccess ? "#146345" : "#c0392b" }}>{hoursMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {tab === "images" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px" }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#6e6e73", margin: "0 0 20px" }}>{t.settingsImgDesc}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              {images.map((url) => (
                <div key={url} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "4/3", background: "#f5f5f7" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => deleteImage(url)}
                    style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <button
                  type="button"
                  disabled={imgUploading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ aspectRatio: "4/3", borderRadius: 10, border: "2px dashed #d1d1d6", background: "#fafafa", cursor: imgUploading ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#aeaeb2", fontSize: 13, opacity: imgUploading ? 0.6 : 1 }}
                >
                  <span style={{ fontSize: 28 }}>+</span>
                  <span>{imgUploading ? t.settingsImgUploading : t.settingsImgAddBtn}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
                e.target.value = "";
              }}
            />

            <p style={{ fontSize: 12, color: "#aeaeb2", margin: 0 }}>{t.settingsImgHint}</p>
            {imgMsg && <p style={{ fontSize: 13, color: imgSuccess ? "#146345" : "#c0392b", marginTop: 10 }}>{imgMsg}</p>}
          </div>
        </div>
      )}

      {tab === "stripe" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px", maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>💳</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>Stripe</div>
              <div style={{ fontSize: 13, color: stripeOk ? "#146345" : "#888", fontWeight: 600 }}>
                {stripeOk ? `✅ ${t.settingsStripeEnabled}` : `⚠️ ${t.settingsStripeNotEnabled}`}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#6e6e73", margin: "0 0 24px", lineHeight: 1.6 }}>{t.settingsStripeDesc}</p>
          <form onSubmit={saveStripe}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                {t.settingsStripePublishable}
              </label>
              <input
                value={stripe.publishableKey}
                onChange={e => setStripe(prev => ({ ...prev, publishableKey: e.target.value }))}
                placeholder="pk_live_... or pk_test_..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>
                {t.settingsStripeSecret}
                <span style={{ fontWeight: 400, color: "#aeaeb2", marginLeft: 6 }}>{t.settingsStripeSecretNote}</span>
              </label>
              <input
                type="password"
                value={stripe.secretKey}
                onChange={e => setStripe(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder="sk_live_... or sk_test_..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "monospace" }}
              />
            </div>
            <p style={{ fontSize: 12, color: "#aeaeb2", margin: "0 0 20px" }}>{t.settingsStripeHint}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button type="submit" disabled={stripeSaving} style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: stripeSaving ? "not-allowed" : "pointer", opacity: stripeSaving ? 0.7 : 1 }}>
                {stripeSaving ? t.settingsSaving : t.settingsSaveStripe}
              </button>
              {stripeMsg && <span style={{ fontSize: 13, color: stripeSuccess ? "#146345" : "#c0392b" }}>{stripeMsg}</span>}
            </div>
          </form>
        </div>
      )}

      {tab === "security" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "32px", maxWidth: 480 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px", color: "#1d1d1f" }}>{t.settingsChangePassword}</h3>
          <form onSubmit={savePassword}>
            {[
              { label: t.settingsNewPassword, key: "newPassword", min: 8 },
              { label: t.settingsConfirmPassword, key: "confirm" },
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
                {secSaving ? t.settingsSaving : t.settingsChangePasswordBtn}
              </button>
              {secMsg && <span style={{ fontSize: 13, color: secSuccess ? "#146345" : "#c0392b" }}>{secMsg}</span>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
