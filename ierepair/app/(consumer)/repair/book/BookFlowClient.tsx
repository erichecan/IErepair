"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type StoreService = {
  merchantServiceId: string;
  serviceName: string;
  deviceModel: string | null;
  deviceBrand: string | null;
  deviceSlug: string | null;
  price: string;
  depositAmount: string;
  estimatedMin: number | null;
  imageUrl: string | null;
};

type Step = "device" | "service" | "slot" | "confirm";
const STEPS: Step[] = ["device", "service", "slot", "confirm"];
const STEP_LABELS: Record<Step, string> = {
  device: "Device",
  service: "Service",
  slot: "Time",
  confirm: "Confirm",
};

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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    for (let h = 9; h < 18; h += slotDuration / 60) {
      const slot = new Date(day);
      slot.setHours(Math.floor(h), (h % 1) * 60);
      slots.push({
        date: dateLabel,
        label: slot.toLocaleTimeString("en-IE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        iso: slot.toISOString(),
      });
    }
  }
  return slots;
}

export default function BookFlowClient({
  storeId,
  storeName,
  deviceSlug,
  services,
  cancelled,
}: {
  storeId: string;
  storeName: string;
  deviceSlug: string | null;
  services: StoreService[];
  cancelled: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("device");

  const [selectedBrand, setBrand] = useState<string | null>(null);
  const [selectedSeries, setSeries] = useState<string | null>(null);
  const [selectedModel, setModel] = useState<string | null>(null);
  const [selectedService, setService] = useState<StoreService | null>(null);
  const [selectedSlot, setSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the user arrived with a device pre-selected, jump past the device step.
  useEffect(() => {
    if (!deviceSlug) return;
    const match = services.find((s) => s.deviceSlug === deviceSlug);
    if (!match) return;
    if (match.deviceBrand) setBrand(match.deviceBrand);
    if (match.deviceModel) {
      if (!selectedSeries) setSeries(parseSeries(match.deviceModel));
      setModel(match.deviceModel);
    }
    const modelServices = services.filter(
      (s) => s.deviceModel === match.deviceModel,
    );
    if (modelServices.length === 1) {
      setService(modelServices[0]);
      setStep("slot");
    } else {
      setStep("service");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceSlug, services]);

  const slots = useMemo(() => generateSlots(30), []);
  const groupedSlots = useMemo(
    () =>
      slots.reduce<Record<string, typeof slots>>((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
      }, {}),
    [slots],
  );

  const brands = useMemo(() => {
    const set = new Set(
      services.map((s) => s.deviceBrand).filter(Boolean) as string[],
    );
    return [...set].sort();
  }, [services]);

  const seriesList = useMemo(() => {
    if (!selectedBrand) return [];
    const set = new Set(
      services
        .filter((s) => s.deviceBrand === selectedBrand && s.deviceModel)
        .map((s) => parseSeries(s.deviceModel!)),
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
    if (!selectedService || !selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/user/repair-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantServiceId: selectedService.merchantServiceId,
          scheduledAt: selectedSlot,
          customerNotes: notes,
        }),
      });

      if (res.status === 401) {
        router.push(
          `/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`,
        );
        return;
      }

      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
        return;
      }
      setError(data.error ?? "We couldn't create your booking. Please try again.");
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);

  const hasServices = services.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header + step bar ── */}
      <div className="sticky top-[48px] z-20 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="px-5 pt-5 pb-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <Link
              href="/repair/browse"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-[17px] font-semibold tracking-tight">
                Book Repair
              </h1>
              <p className="text-xs text-muted-foreground">{storeName}</p>
            </div>
          </div>

          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200
                      ${
                        i < stepIndex
                          ? "bg-primary/15 text-primary"
                          : i === stepIndex
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-muted-foreground"
                      }`}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      i === stepIndex
                        ? "text-foreground"
                        : "text-muted-foreground/60"
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

      <div className="px-5 pt-8 pb-16 max-w-2xl mx-auto">
        {cancelled && (
          <div className="mb-6 rounded-2xl border border-[#f59e0b]/40 bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]">
            Your previous checkout was cancelled. You can finish booking below —
            no charge has been made.
          </div>
        )}

        {!hasServices && (
          <div className="text-center py-16">
            <p className="text-sm text-[#898989] mb-4">
              This shop hasn&apos;t listed any repair services yet.
            </p>
            <Link
              href="/repair/browse"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#242424] text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Browse other shops
            </Link>
          </div>
        )}

        {/* Step 1 — Device */}
        {hasServices && step === "device" && (
          <div className="space-y-10">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                Brand
              </p>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setBrand(brand);
                      setSeries(null);
                      setModel(null);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                      ${
                        selectedBrand === brand
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {selectedBrand && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">
                  Series
                </p>
                <div className="flex flex-wrap gap-2">
                  {seriesList.map((series) => (
                    <button
                      key={series}
                      onClick={() => {
                        setSeries(series);
                        setModel(null);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${
                          selectedSeries === series
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-secondary/50 text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"
                        }`}
                    >
                      {series}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                        ${
                          selectedModel === model
                            ? "border-primary shadow-md scale-[0.98]"
                            : "border-border/50 hover:border-foreground/20 hover:shadow-sm active:scale-[0.97]"
                        }`}
                    >
                      <div className="absolute inset-0 bg-secondary/30" />
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={model}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-contain p-6"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                          📱
                        </div>
                      )}
                      <div className="absolute bottom-3 left-2 right-2 z-10">
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl px-3 py-1.5">
                          <p className="text-[11px] font-medium text-center leading-snug">
                            {model}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Service */}
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
                  onClick={() => {
                    setService(s);
                    setStep("slot");
                  }}
                  className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 hover:border-foreground/20 hover:shadow-sm transition-all text-left group"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-[14px]">
                      {s.serviceName}
                    </div>
                    {s.estimatedMin && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={10} />~{s.estimatedMin} min
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-[14px]">
                        €{parseFloat(s.price).toFixed(2)}
                      </div>
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

        {/* Step 3 — Slot */}
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
                      onClick={() => {
                        setSlot(slot.iso);
                        setStep("confirm");
                      }}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all
                        ${
                          selectedSlot === slot.iso
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-secondary/50 border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 — Confirm */}
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

            <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
              <div className="divide-y divide-border/60">
                {[
                  { label: "Shop", value: storeName },
                  { label: "Device", value: selectedModel },
                  { label: "Service", value: selectedService.serviceName },
                  {
                    label: "Time",
                    value: new Date(selectedSlot).toLocaleString("en-IE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center px-4 py-3.5 text-sm"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border bg-secondary/30 divide-y divide-border/40">
                <div className="flex justify-between items-center px-4 py-3.5 text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">
                    €{parseFloat(selectedService.price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3.5 text-sm text-primary">
                  <span>Deposit due now</span>
                  <span className="font-semibold">
                    €{parseFloat(selectedService.depositAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[12px] text-muted-foreground text-center leading-relaxed px-2">
              Remaining balance is paid at the shop.
              <br />
              Deposit is non-refundable if cancelled within 24 hours.
            </p>

            <div>
              <Label
                htmlFor="notes"
                className="text-xs text-muted-foreground mb-2 block"
              >
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

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

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
