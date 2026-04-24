import Link from "next/link";

const STEPS = [
  {
    number: "01",
    emoji: "📱",
    title: "Choose your device",
    desc: "Select your phone or tablet brand and model. We support Apple, Samsung, Google Pixel, OnePlus, and more.",
    detail: "Get an instant price quote before you commit — no surprises.",
    cta: { label: "Browse devices →", href: "/repair/browse" },
    color: "bg-blue-50 border-blue-200",
    numberColor: "text-[var(--fonfix-blue)]",
  },
  {
    number: "02",
    emoji: "🔧",
    title: "Select your repair",
    desc: "Pick the repair you need — screen replacement, battery swap, back glass, charging port, or more.",
    detail: "Each repair shows the price, estimated time, and whether a deposit is required.",
    cta: null,
    color: "bg-purple-50 border-purple-200",
    numberColor: "text-purple-600",
  },
  {
    number: "03",
    emoji: "📍",
    title: "Pick a store & time slot",
    desc: "Choose your nearest IErepair store and book a time slot that works for you — same-day slots often available.",
    detail: "A small deposit secures your booking. You'll get an SMS and email confirmation instantly.",
    cta: { label: "View stores →", href: "/pages/stores" },
    color: "bg-green-50 border-green-200",
    numberColor: "text-green-600",
  },
  {
    number: "04",
    emoji: "🛠️",
    title: "Drop off your device",
    desc: "Arrive at your booked time. Our technician checks your device and confirms the repair scope with you before starting.",
    detail: "Most screen and battery repairs are done in 30–60 minutes while you wait.",
    cta: null,
    color: "bg-orange-50 border-orange-200",
    numberColor: "text-orange-600",
  },
  {
    number: "05",
    emoji: "✅",
    title: "Quality check & collection",
    desc: "Every repair passes a quality check before handover. We'll show you the device working before you pay.",
    detail: "Pay the remaining balance on collection. Card and cash accepted at all stores.",
    cta: null,
    color: "bg-teal-50 border-teal-200",
    numberColor: "text-teal-600",
  },
  {
    number: "06",
    emoji: "🛡️",
    title: "180-day warranty",
    desc: "Your repair is covered by our 180-day warranty on parts and labour. If the same fault returns, we fix it free.",
    detail: "Need to make a claim? Contact the store directly or visit any IErepair location.",
    cta: { label: "Warranty details →", href: "/pages/warranty" },
    color: "bg-yellow-50 border-yellow-200",
    numberColor: "text-yellow-600",
  },
];

const PROMISES = [
  { emoji: "⚡", title: "Same-day repairs", desc: "Most repairs done while you wait in 30–60 min" },
  { emoji: "💰", title: "No fix, no fee", desc: "If we can't fix it, you pay nothing" },
  { emoji: "🔍", title: "Upfront pricing", desc: "Full price shown before you book — no hidden fees" },
  { emoji: "🏅", title: "Certified technicians", desc: "Trained engineers, OEM-grade parts" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Hero */}
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] px-3 py-1 rounded-full mb-4">
            The IErepair process
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-4">
            How it works
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg max-w-xl mx-auto">
            From booking to collection — a fast, transparent repair process designed around your day.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-[var(--fonfix-border)] hidden md:block" />

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative flex gap-6">
                {/* Step number circle */}
                <div className="shrink-0 w-16 h-16 rounded-full bg-white border-2 border-[var(--fonfix-border)] flex flex-col items-center justify-center z-10 shadow-sm">
                  <span className="text-xl leading-none">{step.emoji}</span>
                  <span className={`text-[10px] font-bold mt-0.5 ${step.numberColor}`}>{step.number}</span>
                </div>

                {/* Card */}
                <div className={`flex-1 rounded-2xl border p-6 ${step.color}`}>
                  <h3 className="font-extrabold text-[var(--fonfix-text)] text-lg mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed mb-2">
                    {step.desc}
                  </p>
                  <p className="text-xs text-[var(--fonfix-text-muted)] italic mb-3">
                    💡 {step.detail}
                  </p>
                  {step.cta && (
                    <Link
                      href={step.cta.href}
                      className="inline-block text-sm font-bold text-[var(--fonfix-blue)] hover:underline"
                    >
                      {step.cta.label}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our promises */}
        <div className="mt-16">
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-6 text-center">
            Our promises to you
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROMISES.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-5 text-center"
              >
                <div className="text-3xl mb-2">{p.emoji}</div>
                <p className="font-bold text-sm text-[var(--fonfix-text)] mb-1">{p.title}</p>
                <p className="text-xs text-[var(--fonfix-text-muted)] leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 bg-[var(--fonfix-blue)] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-2">Ready to book?</h2>
          <p className="text-blue-100 text-sm mb-6">
            Takes 2 minutes. Same-day slots available at all stores.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/repair/browse"
              className="inline-block px-8 py-3 bg-white text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Get a quote & book
            </Link>
            <Link
              href="/pages/faq"
              className="inline-block px-8 py-3 border-2 border-white/40 text-white font-bold rounded-xl hover:border-white/70 transition-colors text-sm"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
