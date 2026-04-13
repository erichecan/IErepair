"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload } from "lucide-react";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const DAY_LABELS: Record<string, string> = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

interface Hours { [day: string]: { open: boolean; from: string; to: string } }

export default function MerchantSettingsPage() {
  const [loading, setSLoading] = useState(true);
  const [saving, setSaving]    = useState(false);
  const [saved, setSaved]      = useState(false);
  const [form, setForm] = useState({
    shopName: "", phone: "", description: "", address: "", city: "", eircode: "",
    slotDurationMin: 30, maxAdvanceDays: 14,
  });
  const [hours, setHours] = useState<Hours>(() =>
    Object.fromEntries(DAYS.map((d) => [d, { open: d !== "sun", from: "09:00", to: "18:00" }]))
  );
  const [logoUrl, setLogoUrl]   = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading]     = useState<"logo" | "cover" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef  = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/v1/merchant/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const m = d.data;
          setForm({ shopName: m.shopName ?? "", phone: m.phone ?? "", description: m.description ?? "",
            address: m.address ?? "", city: m.city ?? "", eircode: m.eircode ?? "",
            slotDurationMin: m.slotDurationMin ?? 30, maxAdvanceDays: m.maxAdvanceDays ?? 14 });
          if (m.businessHours) setHours(m.businessHours);
          setLogoUrl(m.logoUrl ?? null);
          setCoverUrl(m.coverUrl ?? null);
        }
        setSLoading(false);
      });
  }, []);

  async function handleImageUpload(kind: "logo" | "cover", file: File) {
    setUploading(kind);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    try {
      const r = await fetch("/api/v1/merchant/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (d.success) {
        if (kind === "logo") setLogoUrl(d.url);
        else setCoverUrl(d.url);
      } else {
        setUploadError(d.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Network error — please try again");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/v1/merchant/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, businessHours: hours }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold">Shop Settings</h1>

      {saved && (
        <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} />Settings saved successfully
        </div>
      )}

      {/* Images */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Shop Images</h2>
        {uploadError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {uploadError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div
              className={`relative w-24 h-24 rounded-xl border border-border bg-secondary overflow-hidden transition-opacity ${uploading === "logo" ? "opacity-50 pointer-events-none" : "cursor-pointer hover:opacity-80"}`}
              onClick={() => uploading !== "logo" && logoInputRef.current?.click()}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt="Logo" fill className="object-cover" sizes="96px" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Upload size={20} />
                </div>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload("logo", f);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              {uploading === "logo" ? "Uploading…" : "JPEG / PNG / WEBP, max 5 MB"}
            </p>
          </div>

          {/* Cover */}
          <div className="space-y-2">
            <Label>Cover Photo</Label>
            <div
              className={`relative w-full h-24 rounded-xl border border-border bg-secondary overflow-hidden transition-opacity ${uploading === "cover" ? "opacity-50 pointer-events-none" : "cursor-pointer hover:opacity-80"}`}
              onClick={() => uploading !== "cover" && coverInputRef.current?.click()}
            >
              {coverUrl ? (
                <Image src={coverUrl} alt="Cover" fill className="object-cover" sizes="100vw" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
                  <Upload size={20} /><span className="text-sm">Click to upload</span>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageUpload("cover", f);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              {uploading === "cover" ? "Uploading…" : "JPEG / PNG / WEBP, max 5 MB"}
            </p>
          </div>
        </div>
      </section>

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Shop Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Shop Name</Label>
            <Input value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Eircode</Label>
            <Input value={form.eircode} onChange={(e) => setForm((f) => ({ ...f, eircode: e.target.value.toUpperCase() }))}
              placeholder="D01 A234" className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div className="col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="mt-1 bg-secondary border-border resize-none" />
          </div>
        </div>
      </section>

      {/* Booking config */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Booking Config</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slot Duration (minutes)</Label>
            <Input type="number" value={form.slotDurationMin}
              onChange={(e) => setForm((f) => ({ ...f, slotDurationMin: parseInt(e.target.value) }))}
              className="mt-1 bg-secondary border-border" />
          </div>
          <div>
            <Label>Max Advance Days</Label>
            <Input type="number" value={form.maxAdvanceDays}
              onChange={(e) => setForm((f) => ({ ...f, maxAdvanceDays: parseInt(e.target.value) }))}
              className="mt-1 bg-secondary border-border" />
          </div>
        </div>
      </section>

      {/* Business hours */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Business Hours</h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-4 px-4 py-3">
              <label className="flex items-center gap-2 w-24 cursor-pointer">
                <input type="checkbox" checked={hours[day]?.open ?? false}
                  onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.checked } }))}
                  className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
              </label>
              {hours[day]?.open ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input type="time" value={hours[day].from}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], from: e.target.value } }))}
                    className="bg-secondary border-border h-8 text-sm w-28" />
                  <span className="text-muted-foreground text-sm">–</span>
                  <Input type="time" value={hours[day].to}
                    onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], to: e.target.value } }))}
                    className="bg-secondary border-border h-8 text-sm w-28" />
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">Closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-8">
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </div>
  );
}
