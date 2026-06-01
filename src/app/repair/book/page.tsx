"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Category { id: number; name: string; nameEn: string }
interface Brand { id: number; name: string; categoryId: number }
interface Model { id: number; name: string; brandId: number; year: number | null }
interface RepairType { id: number; name: string; categoryId: number }
interface MerchantService {
  id: number;
  repairServiceId: number;
  price: number;
  serviceName: string;
  deviceModel: string;
  deviceBrand: string;
  deviceCategory: string;
  durationMinutes: number;
}
interface MerchantOption {
  id: number;
  name: string;
  address: string | null;
  eircode: string | null;
  phone: string | null;
  distanceKm: number | null;
  hours: Array<{ dayOfWeek: number; isClosed: boolean; openTime: string | null; closeTime: string | null }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = [];
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  let cur = oh * 60 + om;
  const end = ch * 60 + cm - 30;
  while (cur <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, "0");
    const m = (cur % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
    cur += 30;
  }
  return slots;
}

const STEPS = ["Device", "Repair", "Store", "Time", "Contact", "Confirm"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Component ──────────────────────────────────────────────────────────────

export default function BookPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const presetMerchantId = searchParams?.get("merchantId") ? parseInt(searchParams.get("merchantId")!, 10) : null;
  const presetRepairServiceId = searchParams?.get("repairServiceId")
    ? parseInt(searchParams.get("repairServiceId")!, 10)
    : null;

  const [step, setStep] = useState(0);

  // Step 1 — device
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Step 2 — repair type
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [selectedRepairType, setSelectedRepairType] = useState<RepairType | null>(null);

  // Step 3 — merchant
  const [eircode, setEircode] = useState("");
  const [merchants, setMerchants] = useState<MerchantOption[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantOption | null>(null);
  const [merchantService, setMerchantService] = useState<MerchantService | null>(null);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // Step 4 — time
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Step 5 — contact
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Step 7 — success
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    merchantName: string;
    merchantAddress: string | null;
    merchantPhone: string | null;
    serviceName: string;
    deviceModel: string;
    appointmentTime: string;
    quotedPrice: number;
  } | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetch("/api/public/device-categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  // When category changes, load brands
  useEffect(() => {
    if (!selectedCategory) return;
    setBrands([]);
    setModels([]);
    setSelectedBrand(null);
    setSelectedModel(null);
    fetch(`/api/public/device-brands?categoryId=${selectedCategory.id}`)
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []));
    fetch(`/api/public/repair-types?categoryId=${selectedCategory.id}`)
      .then((r) => r.json())
      .then((d) => setRepairTypes(d.repairTypes ?? []));
  }, [selectedCategory]);

  // When brand changes, load models
  useEffect(() => {
    if (!selectedBrand) return;
    setModels([]);
    setSelectedModel(null);
    fetch(`/api/public/device-models?brandId=${selectedBrand.id}`)
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []));
  }, [selectedBrand]);

  // Load merchants for step 3
  const searchMerchants = useCallback(async () => {
    setLoadingMerchants(true);
    try {
      const params = new URLSearchParams();
      if (eircode) params.set("eircode", eircode);
      const res = await fetch(`/api/public/merchants?${params.toString()}`);
      const data = await res.json();
      setMerchants(data.merchants ?? []);
    } finally {
      setLoadingMerchants(false);
    }
  }, [eircode]);

  // Fetch merchant service when merchant is selected
  useEffect(() => {
    if (!selectedMerchant || !selectedRepairType) return;
    setMerchantService(null);
    fetch(`/api/public/merchants/${selectedMerchant.id}/services`)
      .then((r) => r.json())
      .then((d) => {
        const services: MerchantService[] = d.services ?? [];
        const matched = services.find(
          (s) =>
            s.deviceModel === selectedModel?.name &&
            s.deviceBrand === selectedBrand?.name &&
            s.serviceName === selectedRepairType.name
        );
        setMerchantService(matched ?? null);
      });
  }, [selectedMerchant, selectedRepairType, selectedModel, selectedBrand]);

  // Generate time slots when date/merchant changes
  useEffect(() => {
    if (!selectedDate || !selectedMerchant) {
      setAvailableSlots([]);
      return;
    }
    const dayOfWeek = new Date(selectedDate).getDay();
    const dayHours = selectedMerchant.hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!dayHours || dayHours.isClosed || !dayHours.openTime || !dayHours.closeTime) {
      setAvailableSlots([]);
      return;
    }
    setAvailableSlots(generateTimeSlots(dayHours.openTime, dayHours.closeTime));
    setSelectedTime("");
  }, [selectedDate, selectedMerchant]);

  // Handle preset params — skip to step 3 if merchantId + repairServiceId given
  useEffect(() => {
    if (presetMerchantId && presetRepairServiceId) {
      // We can't skip steps without data, just let user pick device first
      // The preset will be used when submitting
    }
  }, [presetMerchantId, presetRepairServiceId]);

  async function handleSubmit() {
    if (!selectedMerchant || !merchantService) return;
    setSubmitting(true);
    try {
      const appointmentTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: selectedMerchant.id,
          repairServiceId: merchantService.repairServiceId,
          userName,
          userPhone,
          userEmail: userEmail || undefined,
          appointmentTime,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Booking failed");
        return;
      }
      setOrderResult(data);
      setStep(6);
    } catch {
      alert("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render success page ─────────────────────────────────────────────────
  if (step === 6 && orderResult) {
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa" }}>
        <div style={styles.topBar}>
          <div className="wrapper">
            <Link href="/" style={styles.logo}>IERepair</Link>
          </div>
        </div>
        <div className="wrapper" style={styles.page}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h1 style={styles.successTitle}>Booking Confirmed!</h1>
            <p style={styles.successSub}>Your repair has been scheduled. Please take note of your order number.</p>
            <div style={styles.orderNumber}>
              Order: <strong>{orderResult.orderNumber}</strong>
            </div>
            <div style={styles.summaryCard}>
              <Row label="Store" value={orderResult.merchantName} />
              {orderResult.merchantAddress && <Row label="Address" value={orderResult.merchantAddress} />}
              {orderResult.merchantPhone && <Row label="Phone" value={orderResult.merchantPhone} />}
              <Row label="Service" value={orderResult.serviceName} />
              <Row label="Device" value={orderResult.deviceModel} />
              <Row label="Appointment" value={new Date(orderResult.appointmentTime).toLocaleString("en-IE")} />
              <Row label="Quoted Price" value={`€${orderResult.quotedPrice.toFixed(2)}`} />
            </div>
            <div style={styles.successActions}>
              <Link href={`/account/bookings?phone=${userPhone}`} style={styles.viewBookingsBtn}>
                View My Bookings
              </Link>
              <Link href="/" style={styles.homeBtn}>Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Progress bar ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <div style={styles.topBar}>
        <div className="wrapper">
          <Link href="/" style={styles.logo}>IERepair</Link>
        </div>
      </div>

      <div className="wrapper" style={styles.page}>
        {/* Progress */}
        <div style={styles.progressBar}>
          {STEPS.map((label, i) => (
            <div key={i} style={styles.progressStep}>
              <div
                style={{
                  ...styles.progressDot,
                  background: i <= step ? "#146345" : "#e0e0e0",
                  color: i <= step ? "#fff" : "#aaa",
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <div
                style={{
                  ...styles.progressLabel,
                  color: i === step ? "#146345" : "#aaa",
                  fontWeight: i === step ? 700 : 400,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={styles.stepCard}>
          {step === 0 && (
            <StepDevice
              categories={categories}
              brands={brands}
              models={models}
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              selectedModel={selectedModel}
              onSelectCategory={setSelectedCategory}
              onSelectBrand={setSelectedBrand}
              onSelectModel={setSelectedModel}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepRepairType
              repairTypes={repairTypes}
              selectedType={selectedRepairType}
              onSelect={setSelectedRepairType}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepMerchant
              eircode={eircode}
              setEircode={setEircode}
              merchants={merchants}
              loading={loadingMerchants}
              selectedMerchant={selectedMerchant}
              selectedModel={selectedModel}
              selectedBrand={selectedBrand}
              selectedRepairType={selectedRepairType}
              onSearch={searchMerchants}
              onSelect={setSelectedMerchant}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepTime
              merchant={selectedMerchant!}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableSlots={availableSlots}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepContact
              userName={userName}
              userPhone={userPhone}
              userEmail={userEmail}
              notes={notes}
              onChangeName={setUserName}
              onChangePhone={setUserPhone}
              onChangeEmail={setUserEmail}
              onChangeNotes={setNotes}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <StepConfirm
              merchant={selectedMerchant!}
              service={merchantService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedModel={selectedModel}
              selectedRepairType={selectedRepairType}
              userName={userName}
              userPhone={userPhone}
              userEmail={userEmail}
              notes={notes}
              submitting={submitting}
              onSubmit={handleSubmit}
              onBack={() => setStep(4)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step sub-components ────────────────────────────────────────────────────

function StepDevice({
  categories, brands, models,
  selectedCategory, selectedBrand, selectedModel,
  onSelectCategory, onSelectBrand, onSelectModel, onNext,
}: {
  categories: Category[]; brands: Brand[]; models: Model[];
  selectedCategory: Category | null; selectedBrand: Brand | null; selectedModel: Model | null;
  onSelectCategory: (c: Category) => void; onSelectBrand: (b: Brand) => void;
  onSelectModel: (m: Model) => void; onNext: () => void;
}) {
  return (
    <div>
      <h2 style={styles.stepTitle}>Select Your Device</h2>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Device Type</label>
        <div style={styles.chipGrid}>
          {categories.map((c) => (
            <ChipBtn key={c.id} label={c.name} active={selectedCategory?.id === c.id} onClick={() => onSelectCategory(c)} />
          ))}
        </div>
      </div>
      {brands.length > 0 && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Brand</label>
          <div style={styles.chipGrid}>
            {brands.map((b) => (
              <ChipBtn key={b.id} label={b.name} active={selectedBrand?.id === b.id} onClick={() => onSelectBrand(b)} />
            ))}
          </div>
        </div>
      )}
      {models.length > 0 && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Model</label>
          <select
            value={selectedModel?.id ?? ""}
            onChange={(e) => {
              const m = models.find((x) => x.id === parseInt(e.target.value));
              if (m) onSelectModel(m);
            }}
            style={styles.select}
          >
            <option value="">Select model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name}{m.year ? ` (${m.year})` : ""}</option>
            ))}
          </select>
        </div>
      )}
      <NavButtons onNext={onNext} nextDisabled={!selectedModel} nextLabel="Next: Repair Type →" />
    </div>
  );
}

function StepRepairType({
  repairTypes, selectedType, onSelect, onNext, onBack,
}: {
  repairTypes: RepairType[]; selectedType: RepairType | null;
  onSelect: (t: RepairType) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div>
      <h2 style={styles.stepTitle}>What needs fixing?</h2>
      <div style={styles.chipGrid}>
        {repairTypes.map((t) => (
          <ChipBtn key={t.id} label={t.name} active={selectedType?.id === t.id} onClick={() => onSelect(t)} />
        ))}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!selectedType} nextLabel="Next: Choose Store →" />
    </div>
  );
}

function StepMerchant({
  eircode, setEircode, merchants, loading, selectedMerchant,
  selectedModel, selectedBrand, selectedRepairType,
  onSearch, onSelect, onNext, onBack,
}: {
  eircode: string; setEircode: (v: string) => void;
  merchants: MerchantOption[]; loading: boolean; selectedMerchant: MerchantOption | null;
  selectedModel: Model | null; selectedBrand: Brand | null; selectedRepairType: RepairType | null;
  onSearch: () => void; onSelect: (m: MerchantOption) => void; onNext: () => void; onBack: () => void;
}) {
  return (
    <div>
      <h2 style={styles.stepTitle}>Find a Store Near You</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter your Eircode (e.g. D01 W2X2)"
          value={eircode}
          onChange={(e) => setEircode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={onSearch} style={styles.searchBtn} disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </div>
      {merchants.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {merchants.map((m) => {
            const isSelected = selectedMerchant?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onSelect(m)}
                style={{
                  ...styles.merchantCard,
                  border: isSelected ? "2px solid #146345" : "1.5px solid #e0e0e0",
                  background: isSelected ? "#f0faf5" : "#fff",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</div>
                  {m.address && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{m.address}</div>}
                  {m.eircode && <div style={{ fontSize: 13, color: "#888" }}>{m.eircode}</div>}
                </div>
                <div style={{ textAlign: "right" as const }}>
                  {m.distanceKm != null && (
                    <div style={{ fontSize: 13, color: "#146345", fontWeight: 600 }}>{m.distanceKm} km</div>
                  )}
                  {isSelected && selectedModel && selectedBrand && selectedRepairType && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                      Checking availability...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {merchants.length === 0 && !loading && eircode && (
        <div style={{ color: "#888", textAlign: "center", padding: "32px 0" }}>
          No stores found. Try a different Eircode.
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!selectedMerchant} nextLabel="Next: Select Time →" />
    </div>
  );
}

function StepTime({
  merchant, selectedDate, selectedTime, availableSlots,
  onDateChange, onTimeChange, onNext, onBack,
}: {
  merchant: MerchantOption; selectedDate: string; selectedTime: string;
  availableSlots: string[]; onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void; onNext: () => void; onBack: () => void;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedDayOfWeek = selectedDate ? new Date(selectedDate).getDay() : -1;
  const dayHours = merchant.hours.find((h) => h.dayOfWeek === selectedDayOfWeek);
  const isClosed = dayHours?.isClosed ?? false;

  return (
    <div>
      <h2 style={styles.stepTitle}>Choose Your Appointment</h2>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Select Date</label>
        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={styles.input}
        />
        {selectedDate && (
          <div style={{ fontSize: 13, color: isClosed ? "#EB001B" : "#146345", marginTop: 6, fontWeight: 600 }}>
            {isClosed
              ? `${DAY_NAMES[selectedDayOfWeek]} — Closed`
              : dayHours
              ? `${DAY_NAMES[selectedDayOfWeek]} — Open ${dayHours.openTime}–${dayHours.closeTime}`
              : "No hours info"}
          </div>
        )}
      </div>
      {!isClosed && availableSlots.length > 0 && (
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Select Time</label>
          <div style={styles.slotGrid}>
            {availableSlots.map((slot) => (
              <ChipBtn
                key={slot}
                label={slot}
                active={selectedTime === slot}
                onClick={() => onTimeChange(slot)}
              />
            ))}
          </div>
        </div>
      )}
      {selectedDate && isClosed && (
        <div style={{ color: "#888", marginTop: 8 }}>Please choose a different date.</div>
      )}
      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedDate || !selectedTime}
        nextLabel="Next: Your Details →"
      />
    </div>
  );
}

function StepContact({
  userName, userPhone, userEmail, notes,
  onChangeName, onChangePhone, onChangeEmail, onChangeNotes, onNext, onBack,
}: {
  userName: string; userPhone: string; userEmail: string; notes: string;
  onChangeName: (v: string) => void; onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void; onChangeNotes: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  return (
    <div>
      <h2 style={styles.stepTitle}>Your Contact Details</h2>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Full Name *</label>
        <input type="text" value={userName} onChange={(e) => onChangeName(e.target.value)} style={styles.input} placeholder="e.g. John Murphy" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Phone Number *</label>
        <input type="tel" value={userPhone} onChange={(e) => onChangePhone(e.target.value)} style={styles.input} placeholder="e.g. 085 123 4567" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email (optional)</label>
        <input type="email" value={userEmail} onChange={(e) => onChangeEmail(e.target.value)} style={styles.input} placeholder="your@email.com" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          style={{ ...styles.input, height: 80, resize: "vertical" as const }}
          placeholder="Any additional info for the store..."
        />
      </div>
      <NavButtons
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!userName.trim() || !userPhone.trim()}
        nextLabel="Review Booking →"
      />
    </div>
  );
}

function StepConfirm({
  merchant, service, selectedDate, selectedTime, selectedModel, selectedRepairType,
  userName, userPhone, userEmail, notes, submitting, onSubmit, onBack,
}: {
  merchant: MerchantOption | null; service: MerchantService | null;
  selectedDate: string; selectedTime: string;
  selectedModel: Model | null; selectedRepairType: RepairType | null;
  userName: string; userPhone: string; userEmail: string; notes: string;
  submitting: boolean; onSubmit: () => void; onBack: () => void;
}) {
  const apptDate = selectedDate ? new Date(`${selectedDate}T${selectedTime}:00`).toLocaleString("en-IE") : "";
  return (
    <div>
      <h2 style={styles.stepTitle}>Confirm Your Booking</h2>
      {!service && (
        <div style={styles.warning}>
          ⚠️ This store may not have pricing for the selected device + repair combo.
          Booking will proceed with estimated pricing from the store.
        </div>
      )}
      <div style={styles.summaryCard}>
        <Row label="Store" value={merchant?.name ?? "—"} />
        <Row label="Address" value={merchant?.address ?? "—"} />
        <Row label="Device" value={`${selectedModel?.name ?? "?"}`} />
        <Row label="Repair" value={selectedRepairType?.name ?? "—"} />
        <Row label="Appointment" value={apptDate} />
        {service && <Row label="Quoted Price" value={`€${service.price.toFixed(2)}`} />}
        <Row label="Name" value={userName} />
        <Row label="Phone" value={userPhone} />
        {userEmail && <Row label="Email" value={userEmail} />}
        {notes && <Row label="Notes" value={notes} />}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={styles.backBtn} disabled={submitting}>← Back</button>
        <button
          onClick={onSubmit}
          disabled={submitting || !service}
          style={{
            ...styles.nextBtn,
            opacity: submitting || !service ? 0.6 : 1,
          }}
        >
          {submitting ? "Submitting..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function ChipBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px",
        borderRadius: 40,
        border: active ? "2px solid #146345" : "1.5px solid #e0e0e0",
        background: active ? "#f0faf5" : "#fff",
        color: active ? "#146345" : "#1d1d1f",
        fontWeight: active ? 700 : 400,
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function NavButtons({
  onBack, onNext, nextDisabled, nextLabel,
}: {
  onBack?: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
      {onBack && (
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
      )}
      <button onClick={onNext} disabled={nextDisabled} style={{ ...styles.nextBtn, opacity: nextDisabled ? 0.4 : 1 }}>
        {nextLabel ?? "Next →"}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 15 }}>
      <span style={{ color: "#888", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right" as const }}>{value}</span>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  topBar: { background: "#1c3830", padding: "14px 0" },
  logo: { color: "#17db66", fontWeight: 800, fontSize: 22, textDecoration: "none" },
  page: { paddingTop: 32, paddingBottom: 64, maxWidth: 680, margin: "0 auto" },
  progressBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 32,
    overflowX: "auto" as const,
  },
  progressStep: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6, flex: 1 },
  progressDot: {
    width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 13, fontWeight: 700, transition: "background 0.2s",
  },
  progressLabel: { fontSize: 12, textAlign: "center" as const, transition: "color 0.2s" },
  stepCard: {
    background: "#fff", borderRadius: 20, padding: "32px 28px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0",
  },
  stepTitle: { fontSize: 20, fontWeight: 800, color: "#1d1d1f", margin: 0, marginBottom: 24 },
  fieldGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "#555", marginBottom: 8 },
  chipGrid: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  slotGrid: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
  select: {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #e0e0e0", fontSize: 15, fontFamily: "inherit", background: "#fff",
  },
  input: {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #e0e0e0", fontSize: 15, fontFamily: "inherit", background: "#fff",
    boxSizing: "border-box" as const,
  },
  searchBtn: {
    padding: "12px 22px", borderRadius: 12, background: "#1d1d1f", color: "#17db66",
    border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  merchantCard: {
    padding: "14px 16px", borderRadius: 12, cursor: "pointer",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
    transition: "all 0.15s",
  },
  backBtn: {
    padding: "12px 24px", borderRadius: 40, border: "1.5px solid #e0e0e0",
    background: "#fff", color: "#1d1d1f", fontSize: 15, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  nextBtn: {
    flex: 1, padding: "14px 24px", borderRadius: 40, background: "#146345",
    color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s",
  },
  summaryCard: {
    background: "#fafafa", borderRadius: 12, padding: "16px 20px",
    border: "1.5px solid #f0f0f0",
  },
  warning: {
    background: "#fff8e1", border: "1px solid #e0b252", borderRadius: 10,
    padding: "12px 16px", fontSize: 14, color: "#555", marginBottom: 16,
  },
  successBox: {
    maxWidth: 540, margin: "60px auto", background: "#fff", borderRadius: 24,
    padding: "48px 40px", textAlign: "center" as const,
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1.5px solid #f0f0f0",
  },
  successIcon: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: 800, color: "#1d1d1f", margin: 0, marginBottom: 12 },
  successSub: { fontSize: 15, color: "#555", marginBottom: 20 },
  orderNumber: {
    fontSize: 16, background: "#f0faf5", padding: "12px 20px",
    borderRadius: 10, display: "inline-block", marginBottom: 24,
    color: "#146345",
  },
  successActions: { display: "flex", gap: 12, justifyContent: "center", marginTop: 24 },
  viewBookingsBtn: {
    padding: "12px 24px", borderRadius: 40, background: "#146345",
    color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 15,
  },
  homeBtn: {
    padding: "12px 24px", borderRadius: 40, border: "1.5px solid #e0e0e0",
    color: "#1d1d1f", textDecoration: "none", fontWeight: 600, fontSize: 15,
    display: "inline-block",
  },
};
