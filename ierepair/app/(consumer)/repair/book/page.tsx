"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StoreService {
  merchantServiceId: string;
  serviceName: string;
  deviceModel: string | null;
  deviceBrand: string | null;
  price: string;
  depositAmount: string;
  estimatedMin: number | null;
  imageUrl: string | null;
}

type Step = "device" | "service" | "slot" | "confirm";

const STEPS: Step[] = ["device", "service", "slot", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  device: "Device",
  service: "Service",
  slot: "Time",
  confirm: "Confirm",
};

// "iPhone 15 Pro Max" → "iPhone 15", "Galaxy S24 Ultra" → "Galaxy S24"
function parseSeries(model: string): string {
  return model
    .replace(/\s+(Pro Max|Pro|Max|Ultra|Plus|Lite|FE|Mini)\s*$/i, "")
    .trim();
}

function generateSlots(slotDuration = 30) {
  const slots: { date: string; label: string; iso: string }[] = [];
  const now = new Date();
  for (let d = 1; d <= 14; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);
    day.setHours(9, 0, 0, 0);
    const dateLabel = day.toLocaleDateString("en-IE", {
      weekday: "short", month: "short", day: "numeric",
    });
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

function BookRepairPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const storeId      = searchParams.get("storeId") ?? "";
  const storeName    = searchParams.get("storeName") ?? "the shop";

  const [services, setServices]       = useState<StoreService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [step, setStep]               = useState<Step>("device");

  // Device selection state
  const [selectedBrand, setBrand]   = useState<string | null>(null);
  const [selectedSeries, setSeries] = useState<string | null>(null);
  const [selectedModel, setModel]   = useState<string | null>(null);

  // Booking state
  const [selectedService, setService] = useState<StoreService | null>(null);
  const [selectedSlot, setSlot]       = useState<string>("");
  const [notes, setNotes]             = useState("");
  const [loading, setLoading]         = useState(false);

  const slots = useMemo(() => generateSlots(30), []);
  const groupedSlots = useMemo(() =>
    slots.reduce<Record<string, typeof slots>>((acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    }, {}),
  [slots]);

  useEffect(() => {
    if (!storeId) return;
    fetch(`/api/v1/public/stores/${storeId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data.services ?? []); })
      .finally(() => setLoadingServices(false));
  }, [storeId]);

  // Derived lists from services
  const brands = useMemo(() => {
    const set = new Set(
      services.map((s) => s.deviceBrand).filter(Boolean) as string[]
    );
    return [...set].sort();
  }, [services]);

  const seriesList = useMemo(() => {
    if (!selectedBrand) return [];
    const set = new Set(
      services
        .filter((s) => s.deviceBrand === selectedBrand && s.deviceModel)
        .map((s) => parseSeries(s.deviceModel!))
    );
    return [...set].sort();
  }, [services, selectedBrand]);

  const modelList = useMemo(() => {
    if (!selectedBrand || !selectedSeries) return [];
    const seen = new Set<string>();
    return services
      .filter(
        (s) =>
          s.deviceBrand === selectedBrand &&
          s.deviceModel &&
          parseSeries(s.deviceModel) === selectedSeries,
      )
      .reduce<{ model: string; imageUrl: string | null }[]>((acc, s) => {
        if (!seen.has(s.deviceModel!)) {
          seen.add(s.deviceModel!);
          acc.push({ model: s.deviceModel!, imageUrl: s.imageUrl });
        }
        return acc;
      }, []);
  }, [services, selectedBrand, selectedSeries]);

  const filteredServices = useMemo(
    () => services.filter((s) => s.deviceModel === selectedModel),
    [services, selectedModel],
  );

  function handleSelectModel(model: string) {
    setModel(model);
    const modelServices = services.filter((s) => s.deviceModel === model);
    if (modelServices.length === 1) {
      setService(modelServices[0]);
      setStep("slot");
    } else {
      setStep("service");
    }
  }

  function backFromSlot() {
    setStep(filteredServices.length > 1 ? "service" : "device");
  }

  async function handleBook() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/user/repair-bookings", {
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

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header + step bar ── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/repair" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight">Book Repair</h1>
              <p className="text-xs text-muted-foreground">{storeName}</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200
                      ${i < stepIndex
                        ? "bg-primary/15 text-primary"
                        : i === stepIndex
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground"}`}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      i === stepIndex ? "text-foreground" : "text-muted-foreground/60"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 transition-colors duration-300 ${
                      i < stepIndex ? "bg-primary/30" : "bg-border/60"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-8 pb-16">

        {/* ══════════════════════════════════
            Step 1 — Device
        ══════════════════════════════════ */}
        {step === "device" && (
          <div className="space-y-10">

            {loadingServices && (
              <p className="text-center text-sm text-muted-foreground py-16">Loading…</p>
            )}

            {!loadingServices && brands.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-16">
                No repair services available at this shop yet.
              </p>
            )}

            {/* Brand */}
            {!loadingServices && brands.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Brand
                </p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => { setBrand(brand); setSeries(null); setModel(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${selectedBrand === brand
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {selectedBrand && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Series
                </p>
                <div className="flex flex-wrap gap-2">
                  {seriesList.map((series) => (
                    <button
                      key={series}
                      onClick={() => { setSeries(series); setModel(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${selectedSeries === series
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {series}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model image grid */}
            {selectedSeries && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Model
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {modelList.map(({ model, imageUrl }) => (
                    <button
                      key={model}
                      onClick={() => handleSelectModel(model)}
                      className={`relative aspect-[3/4] rounded-2xl border-2 overflow-hidden transition-all duration-200
                        ${selectedModel === model
                          ? "border-primary shadow-md scale-[0.98]"
                          : "border-border/50 hover:border-foreground/20 hover:shadow-sm active:scale-[0.97]"}`}
                    >
                      {/* Background */}
                      <div className="absolute inset-0 bg-secondary/30" />

                      {/* Device image */}
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={model}
                          className="absolute inset-0 w-full h-full object-contain p-6"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          📱
                        </div>
                      )}

                      {/* Model name chip */}
                      <div className="absolute bottom-3 left-2 right-2 z-10">
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl px-3 py-1.5">
                          <p className="text-[11px] font-medium text-center leading-snug">
                            {model}
                          </p>
                        </div>
                      </div>

                      {/* Selected ring overlay */}
                      {selectedModel === model && (
                        <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            Step 2 — Service
        ══════════════════════════════════ */}
        {step === "service" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("device")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-[15px] font-semibold">Select repair type</h2>
                <p className="text-xs text-muted-foreground">{selectedModel}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredServices.map((s) => (
                <button
                  key={s.merchantServiceId}
                  onClick={() => { setService(s); setStep("slot"); }}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 hover:border-foreground/20 hover:shadow-sm transition-all text-left group"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-[14px]">{s.serviceName}</div>
                    {s.estimatedMin && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />~{s.estimatedMin} min
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-[14px]">€{parseFloat(s.price).toFixed(2)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        €{parseFloat(s.depositAmount).toFixed(2)} deposit
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            Step 3 — Time Slot
        ══════════════════════════════════ */}
        {step === "slot" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={backFromSlot}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold">Choose a time</h2>
            </div>

            {Object.entries(groupedSlots).map(([date, daySlots]) => (
              <div key={date}>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Calendar size={11} />
                  {date}
                </div>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.iso}
                      onClick={() => { setSlot(slot.iso); setStep("confirm"); }}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                        ${selectedSlot === slot.iso
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════
            Step 4 — Confirm
        ══════════════════════════════════ */}
        {step === "confirm" && selectedService && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("slot")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-[15px] font-semibold">Confirm booking</h2>
            </div>

            {/* Summary card */}
            <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
              <div className="divide-y divide-border/60">
                {[
                  { label: "Shop",    value: storeName },
                  { label: "Device",  value: selectedModel },
                  { label: "Service", value: selectedService.serviceName },
                  {
                    label: "Time",
                    value: new Date(selectedSlot).toLocaleString("en-IE", {
                      dateStyle: "medium", timeStyle: "short",
                    }),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3.5 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border bg-secondary/30 divide-y divide-border/40">
                <div className="flex justify-between items-center px-4 py-3.5 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">€{parseFloat(selectedService.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3.5 text-sm text-primary">
                  <span>Deposit due now</span>
                  <span className="font-semibold">€{parseFloat(selectedService.depositAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground text-center leading-relaxed px-2">
              Remaining balance is paid at the shop.
              <br />Deposit is non-refundable if cancelled within 24 hours.
            </p>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-xs text-muted-foreground mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Describe the issue with your device…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-secondary/50 border-border/60 resize-none rounded-xl text-sm"
                rows={3}
              />
            </div>

            <Button
              onClick={handleBook}
              disabled={loading}
              className="w-full h-12 rounded-2xl text-[15px] font-semibold"
            >
              {loading
                ? "Creating booking…"
                : `Pay €${parseFloat(selectedService.depositAmount).toFixed(2)} deposit`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense>
      <BookRepairPageInner />
    </Suspense>
  );
}
