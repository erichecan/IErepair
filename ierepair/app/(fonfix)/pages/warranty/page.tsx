import Link from "next/link";

const COVERED = [
  "Screen replacements — OLED/LCD panel, touch digitiser, and bezel",
  "Battery replacements — capacity, charge cycles, and fast-charge compatibility",
  "Charging port repairs — physical connector and solder points",
  "Back cover replacements — adhesive and frame alignment",
  "Water damage treatments — all cleaned components",
  "Camera replacements — image sensor and optical image stabilisation",
];

const NOT_COVERED = [
  "New physical damage after the repair (drops, cracks, liquid exposure)",
  "Software issues unrelated to the repair performed",
  "Damage caused by unofficial modifications or jailbreaking",
  "Normal wear and tear (cosmetic scratches, paint fade)",
];

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[var(--fonfix-blue-light)] border-b border-[var(--fonfix-border)]">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            180-Day Repair Warranty
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg">
            Every Fonfix repair is backed by our 180-day warranty covering parts and labour.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* What's covered */}
        <div>
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">What's covered</h2>
          <ul className="space-y-3">
            {COVERED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[var(--fonfix-text-muted)] text-sm">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What's not covered */}
        <div>
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">What's not covered</h2>
          <ul className="space-y-3">
            {NOT_COVERED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[var(--fonfix-text-muted)] text-sm">
                <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* How to claim */}
        <div className="bg-[var(--fonfix-blue-light)] rounded-2xl p-6">
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-3">How to make a claim</h2>
          <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed mb-4">
            Bring your device and your original repair receipt to any Fonfix store. We'll assess the fault
            and, if it's covered under warranty, fix it at no charge. No booking required for warranty claims.
          </p>
          <Link
            href="/pages/stores"
            className="inline-block text-sm font-semibold text-[var(--fonfix-blue)] hover:underline"
          >
            Find your nearest store →
          </Link>
        </div>
      </div>
    </div>
  );
}
