"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface MerchantService {
  merchantServiceId: string; serviceName: string;
  deviceModel: string | null; deviceBrand: string | null;
  price: string; depositAmount: string; estimatedMin: number | null;
}

// Generate available time slots for the next 14 days
function generateSlots(slotDuration = 30) {
  const slots: { date: string; label: string; iso: string }[] = [];
  const now = new Date();
  for (let d = 1; d <= 14; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(9, 0, 0, 0);
    const dateLabel = day.toLocaleDateString("en-IE", { weekday: "short", month: "short", day: "numeric" });
    for (let h = 9; h < 18; h += slotDuration / 60) {
      const slot = new Date(day);
      slot.setHours(Math.floor(h), (h % 1) * 60);
      slots.push({
        date: dateLabel,
        label: slot.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }),
        iso: slot.toISOString(),
      });
    }
  }
  return slots;
}

export default function BookRepairPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const storeId      = searchParams.get("storeId") ?? "";
  const storeName    = searchParams.get("storeName") ?? "the shop";

  const [services, setServices]       = useState<MerchantService[]>([]);
  const [selectedService, setSelected] = useState<MerchantService | null>(null);
  const [selectedSlot, setSlot]       = useState<string>("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [step, setStep]               = useState<"service" | "slot" | "confirm">("service");

  const slots = generateSlots(30);
  const groupedSlots = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/v1/public/stores/${storeId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data.services ?? []); });
  }, [storeId]);

  async function handleBook() {
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/user/repair-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantServiceId: selectedService!.merchantServiceId,
          scheduledAt: selectedSlot,
          customerNotes: notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else if (res.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
      } else {
        alert(data.error ?? "Failed to create booking");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/repair" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-heading font-bold">Book Repair</h1>
          <p className="text-xs text-muted-foreground">{storeName}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {["service", "slot", "confirm"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${step === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={step === s ? "text-foreground font-medium" : "text-muted-foreground"}>
              {s === "service" ? "Service" : s === "slot" ? "Time" : "Confirm"}
            </span>
            {i < 2 && <div className="h-px w-4 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Pick service */}
      {step === "service" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Select a repair service</h2>
          {services.length === 0 && <p className="text-muted-foreground text-sm">No services available at this shop.</p>}
          {services.map((s) => (
            <button
              key={s.merchantServiceId}
              onClick={() => { setSelected(s); setStep("slot"); }}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
            >
              <div>
                <div className="font-medium text-sm">{s.serviceName}</div>
                {(s.deviceBrand || s.deviceModel) && (
                  <div className="text-xs text-muted-foreground">{[s.deviceBrand, s.deviceModel].filter(Boolean).join(" ")}</div>
                )}
                {s.estimatedMin && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock size={10} />~{s.estimatedMin} min
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">€{parseFloat(s.price).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">€{parseFloat(s.depositAmount).toFixed(2)} deposit</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 — Pick time slot */}
      {step === "slot" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("service")} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></button>
            <h2 className="text-sm font-semibold">Choose a time slot</h2>
          </div>
          {Object.entries(groupedSlots).map(([date, daySlots]) => (
            <div key={date}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Calendar size={12} />{date}
              </div>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <button
                    key={slot.iso}
                    onClick={() => { setSlot(slot.iso); setStep("confirm"); }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                      ${selectedSlot === slot.iso
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"}`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === "confirm" && selectedService && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("slot")} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /></button>
            <h2 className="text-sm font-semibold">Confirm booking</h2>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Shop</span><span className="font-medium">{storeName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService.serviceName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time</span>
              <span className="font-medium">{new Date(selectedSlot).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-muted-foreground">Total price</span>
              <span className="font-bold">€{parseFloat(selectedService.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span>Deposit now (20%)</span>
              <span className="font-bold">€{parseFloat(selectedService.depositAmount).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Remaining balance paid at the shop. Deposit non-refundable if cancelled within 24h.</p>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm mb-1 block">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any details about your device issue…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-secondary border-border resize-none"
              rows={3}
            />
          </div>

          <Button onClick={handleBook} disabled={loading} className="w-full bg-primary text-primary-foreground">
            {loading ? "Creating booking…" : `Pay €${parseFloat(selectedService.depositAmount).toFixed(2)} deposit`}
          </Button>
        </div>
      )}
    </div>
  );
}
