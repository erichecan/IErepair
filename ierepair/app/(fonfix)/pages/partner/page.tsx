import Link from "next/link";

/* ─── Merchant onboarding journey ─────────────────────────────────────────── */
const ONBOARDING_STEPS = [
  {
    phase: "Phase 1",
    number: "01",
    emoji: "📋",
    title: "Apply to join",
    who: "You (repair shop owner)",
    desc: "Send us your store details — name, location, the devices and repairs you handle. No upfront fee.",
    detail: "We accept independent repair shops, multi-location chains, and franchise operators across Ireland.",
    action: { label: "Email us to apply →", href: "mailto:business@ierepair.ie" },
    color: "bg-blue-50 border-blue-200",
    phaseColor: "text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)]",
  },
  {
    phase: "Phase 1",
    number: "02",
    emoji: "🔍",
    title: "Platform review",
    who: "IErepair team",
    desc: "We verify your business details, check certifications, and confirm your repair capabilities. Usually completed within 2 business days.",
    detail: "We look for quality standards, insurance, and capacity to serve customers reliably.",
    action: null,
    color: "bg-purple-50 border-purple-200",
    phaseColor: "text-purple-700 bg-purple-100",
  },
  {
    phase: "Phase 2",
    number: "03",
    emoji: "🔑",
    title: "Account activation & login",
    who: "You",
    desc: "You receive your merchant login credentials. Sign in to the IErepair merchant portal to begin setup.",
    detail: "Merchant portal: /merchant/login — your private dashboard for all store operations.",
    action: { label: "Merchant portal →", href: "/merchant/login" },
    color: "bg-green-50 border-green-200",
    phaseColor: "text-green-700 bg-green-100",
  },
  {
    phase: "Phase 2",
    number: "04",
    emoji: "🏪",
    title: "Set up your store profile",
    who: "You",
    desc: "Fill in your store name, address, opening hours, and contact info. Upload your store photo. This is what customers see when they search for nearby repair shops.",
    detail: "Settings → Store Profile. Changes go live immediately.",
    action: null,
    color: "bg-orange-50 border-orange-200",
    phaseColor: "text-orange-700 bg-orange-100",
  },
  {
    phase: "Phase 2",
    number: "05",
    emoji: "🔧",
    title: "Add your repair services",
    who: "You",
    desc: "Browse the IErepair service catalog and activate the repairs you offer — screen, battery, back glass, charging port, and more. Set your own prices per device model.",
    detail: "Products → Catalog: pick from platform-standard services. Or add custom services not in the catalog.",
    action: null,
    color: "bg-teal-50 border-teal-200",
    phaseColor: "text-teal-700 bg-teal-100",
  },
  {
    phase: "Phase 3",
    number: "06",
    emoji: "🟢",
    title: "Go live",
    who: "IErepair team + You",
    desc: "Once your profile and services are complete, IErepair activates your store on the public platform. Customers can now find and book you.",
    detail: "Your store appears in nearby search results, device detail pages, and the store map.",
    action: { label: "View stores →", href: "/pages/stores" },
    color: "bg-lime-50 border-lime-200",
    phaseColor: "text-lime-700 bg-lime-100",
  },
];

/* ─── Day-to-day operations ────────────────────────────────────────────────── */
const OPERATIONS = [
  {
    emoji: "📅",
    title: "Receive bookings",
    desc: "Customer books online → you see a new booking in your dashboard. Accept or flag it.",
    badge: "Bookings → Accept",
  },
  {
    emoji: "📲",
    title: "Check in the customer",
    desc: "When the customer arrives, mark them as checked in. Repair timer starts.",
    badge: "Bookings → Check-in",
  },
  {
    emoji: "✅",
    title: "Mark repair complete",
    desc: "Repair done and quality-checked? Mark as complete. Customer is notified automatically.",
    badge: "Bookings → Complete",
  },
  {
    emoji: "💰",
    title: "Track earnings",
    desc: "View completed repairs, revenue, and upcoming payouts from the Finance tab.",
    badge: "Finance",
  },
];

/* ─── Benefits ─────────────────────────────────────────────────────────────── */
const BENEFITS = [
  { emoji: "📈", title: "More customers", desc: "Tap into IErepair's organic search traffic and repeat customer base" },
  { emoji: "💳", title: "Deposit collection", desc: "Deposits collected at booking — fewer no-shows, guaranteed intent" },
  { emoji: "🛡️", title: "Warranty backing", desc: "IErepair's 180-day warranty brand builds customer trust for you" },
  { emoji: "📊", title: "Unified dashboard", desc: "All bookings, revenue, and customer history in one place" },
];

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFD]">

      {/* Hero */}
      <div className="bg-[var(--fonfix-footer-bg)] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-xs font-semibold bg-white/10 rounded-full px-3 py-1 mb-4">
            For repair shops
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Join IErepair as a partner
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            List your repair shop on Ireland&apos;s largest repair platform. Get bookings, manage your store, and grow your business — all in one place.
          </p>
          <a
            href="mailto:business@ierepair.ie"
            className="inline-block px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Apply to join →
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Phase labels */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { label: "Phase 1 — Application", color: "text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)]" },
            { label: "Phase 2 — Onboarding", color: "text-green-700 bg-green-100" },
            { label: "Phase 3 — Go live", color: "text-lime-700 bg-lime-100" },
          ].map((p) => (
            <span key={p.label} className={`text-xs font-bold px-3 py-1 rounded-full ${p.color}`}>
              {p.label}
            </span>
          ))}
        </div>

        {/* Onboarding steps */}
        <div className="relative">
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-[var(--fonfix-border)] hidden md:block" />
          <div className="space-y-6">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.number} className="relative flex gap-6">
                <div className="shrink-0 w-16 h-16 rounded-full bg-white border-2 border-[var(--fonfix-border)] flex flex-col items-center justify-center z-10 shadow-sm">
                  <span className="text-xl leading-none">{step.emoji}</span>
                  <span className="text-[10px] font-bold mt-0.5 text-[var(--fonfix-text-muted)]">{step.number}</span>
                </div>
                <div className={`flex-1 rounded-2xl border p-6 ${step.color}`}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${step.phaseColor}`}>
                      {step.phase}
                    </span>
                    <span className="text-xs text-[var(--fonfix-text-muted)]">
                      → <span className="font-semibold">{step.who}</span>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[var(--fonfix-text)] text-lg mb-1">{step.title}</h3>
                  <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed mb-2">{step.desc}</p>
                  <p className="text-xs text-[var(--fonfix-text-muted)] italic mb-3">💡 {step.detail}</p>
                  {step.action && (
                    <a
                      href={step.action.href}
                      className="inline-block text-sm font-bold text-[var(--fonfix-blue)] hover:underline"
                    >
                      {step.action.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day-to-day operations */}
        <div className="mt-16">
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-2">
            Day-to-day operations
          </h2>
          <p className="text-sm text-[var(--fonfix-text-muted)] mb-6">
            Once live, your merchant dashboard handles the full booking lifecycle.
          </p>
          <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] divide-y divide-[var(--fonfix-border)]">
            {OPERATIONS.map((op, i) => (
              <div key={op.title} className="flex items-start gap-4 px-6 py-5">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--fonfix-blue-light)] flex items-center justify-center text-xl">
                  {op.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-[var(--fonfix-text)]">{op.title}</p>
                    <span className="text-[10px] font-bold bg-gray-100 text-[var(--fonfix-text-muted)] px-2 py-0.5 rounded-full">
                      {op.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--fonfix-text-muted)] leading-relaxed">{op.desc}</p>
                </div>
                <span className="text-xs font-bold text-[var(--fonfix-text-muted)] shrink-0 mt-1">
                  Step {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link
              href="/merchant/login"
              className="text-sm font-bold text-[var(--fonfix-blue)] hover:underline"
            >
              Go to merchant portal →
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-14">
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-6 text-center">
            Why partner with IErepair?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-5">
                <div className="text-2xl mb-2">{b.emoji}</div>
                <p className="font-bold text-sm text-[var(--fonfix-text)] mb-1">{b.title}</p>
                <p className="text-xs text-[var(--fonfix-text-muted)] leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 bg-[var(--fonfix-blue)] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">Ready to get started?</h2>
          <p className="text-blue-100 text-sm mb-6">
            Email us your store details and we'll get back to you within 2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:business@ierepair.ie"
              className="inline-block px-8 py-3 bg-white text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Apply now →
            </a>
            <Link
              href="/pages/how-it-works"
              className="inline-block px-8 py-3 border-2 border-white/40 text-white font-bold rounded-xl hover:border-white/70 transition-colors text-sm"
            >
              Customer flow ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
