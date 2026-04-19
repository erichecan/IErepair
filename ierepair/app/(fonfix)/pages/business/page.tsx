import Link from "next/link";

const PERKS = [
  { title: "Bulk pricing", body: "Discounted rates for companies repairing 10+ devices per month." },
  { title: "Dedicated account manager", body: "One point of contact for scheduling, invoicing, and updates." },
  { title: "Priority scheduling", body: "Skip the queue — your repairs are booked at peak-friendly slots." },
  { title: "Consolidated invoicing", body: "Monthly invoices with itemised repair logs for your records." },
  { title: "On-site collection", body: "We can collect devices from your office in Dublin (ask us)." },
  { title: "180-day warranty", body: "Same industry-leading warranty applies to all business repairs." },
];

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[var(--fonfix-footer-bg)] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center text-white">
          <span className="inline-block text-xs font-semibold bg-white/10 rounded-full px-3 py-1 mb-4">
            IErepair Business
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Phone repair, at scale.
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            IErepair Business offers bulk pricing, dedicated account management, and priority booking for
            companies with 10 or more devices.
          </p>
          <a
            href="mailto:business@ierepair.ie"
            className="inline-block px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
          >
            Contact Business Team →
          </a>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 px-6 bg-[#F8FAFD]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[var(--fonfix-text)] text-center mb-10">
            Everything your team needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6">
                <h3 className="font-bold text-[var(--fonfix-text)] mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--fonfix-text-muted)] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-2xl font-extrabold text-[var(--fonfix-text)] mb-3">
          Ready to get started?
        </h2>
        <p className="text-[var(--fonfix-text-muted)] mb-8">
          Email our business team and we'll set up an account within one business day.
        </p>
        <a
          href="mailto:business@ierepair.ie"
          className="inline-block px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
        >
          business@ierepair.ie
        </a>
      </section>
    </div>
  );
}
