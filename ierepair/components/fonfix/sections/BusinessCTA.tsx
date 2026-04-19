import Link from "next/link";

export default function BusinessCTA() {
  return (
    <section className="py-16 bg-[var(--fonfix-footer-bg)]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Repairing phones for your business?
          </h2>
          <p className="text-white/60 max-w-lg">
            Fonfix Business offers bulk repair pricing, dedicated account managers, and priority
            scheduling for companies with 10+ devices.
          </p>
        </div>
        <Link
          href="/pages/business"
          className="shrink-0 px-8 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors text-sm"
        >
          Learn about Fonfix Business →
        </Link>
      </div>
    </section>
  );
}
