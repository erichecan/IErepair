import Link from "next/link";

const STATS = [
  { value: "15,000+", label: "Repairs completed" },
  { value: "4.9 / 5", label: "Average customer rating" },
  { value: "180 days", label: "Warranty on every repair" },
  { value: "4 stores", label: "Across Ireland" },
];

const VALUES = [
  {
    title: "Honest pricing",
    body: "Every quote is shown upfront on our website. No surprise fees when you pick up your device.",
  },
  {
    title: "Quality parts",
    body: "We only fit OEM-equivalent or genuine parts that meet the original manufacturer's specifications.",
  },
  {
    title: "No Fix, No Fee",
    body: "If we can't fix your device, you pay nothing. Your device is returned in the same condition.",
  },
  {
    title: "Fast turnaround",
    body: "Most screen and battery repairs are done in under an hour while you wait in-store.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[var(--fonfix-blue)] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            We fix phones. Simply.
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Fonfix is Ireland's fastest-growing phone repair service — built on transparent pricing,
            quality parts, and a no-nonsense warranty.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--fonfix-blue-light)] py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-[var(--fonfix-blue)] mb-1">{s.value}</p>
              <p className="text-sm text-[var(--fonfix-text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[var(--fonfix-text)] mb-6">Our story</h2>
          <div className="space-y-4 text-[var(--fonfix-text-muted)] leading-relaxed">
            <p>
              Fonfix started in Dublin in 2019 with a single goal: make quality phone repair accessible to
              everyone in Ireland. We were frustrated by the lack of transparent pricing, long wait times,
              and repairs that failed within weeks.
            </p>
            <p>
              Today we operate four stores across Ireland — Dublin, Cork, Galway, and Limerick — and have
              completed over 15,000 repairs. Every repair comes with our 180-day warranty and our promise:
              if we can't fix it, you don't pay.
            </p>
            <p>
              We invest in our technicians, train them to manufacturer standards, and only source parts
              that we'd put in our own devices. That's it — no shortcuts.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#F8FAFD]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[var(--fonfix-text)] mb-10 text-center">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6">
                <h3 className="font-bold text-[var(--fonfix-text)] text-lg mb-2">{v.title}</h3>
                <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-extrabold text-[var(--fonfix-text)] mb-4">
          Ready to get your device fixed?
        </h2>
        <Link
          href="/repair/book"
          className="inline-block px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
        >
          Book a Repair →
        </Link>
      </section>
    </div>
  );
}
