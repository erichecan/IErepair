const REASONS = [
  {
    icon: "🛡️",
    title: "180-Day Warranty",
    description:
      "Every repair is backed by our 180-day warranty on parts and labour — one of the longest in Ireland.",
  },
  {
    icon: "⚡",
    title: "Same-Day Service",
    description: "Most screen and battery repairs are completed in 30–60 minutes while you wait.",
  },
  {
    icon: "💶",
    title: "No Fix, No Fee",
    description:
      "If we can't fix your device, you pay nothing. We return your phone in the same condition.",
  },
  {
    icon: "🔧",
    title: "OEM-Quality Parts",
    description:
      "We use certified OEM-equivalent parts — the same brightness, colour, and touch sensitivity as factory components.",
  },
  {
    icon: "📍",
    title: "4 Irish Locations",
    description: "Walk-in stores in Dublin, Cork, Galway, and Limerick. No appointment needed for most repairs.",
  },
  {
    icon: "🔒",
    title: "Data Privacy",
    description:
      "We never access, copy, or transfer your personal data. Your passcode is only requested when strictly necessary.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-[#F8FAFD]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            Why choose IErepair?
          </h2>
          <p className="text-[var(--fonfix-text-muted)] text-lg max-w-xl mx-auto">
            We've repaired over 50,000 devices across Ireland. Here's what makes us different.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="bg-white rounded-2xl p-6 border border-[var(--fonfix-border)] hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-4">{r.icon}</div>
              <h3 className="font-bold text-[var(--fonfix-text)] text-base mb-2">{r.title}</h3>
              <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
