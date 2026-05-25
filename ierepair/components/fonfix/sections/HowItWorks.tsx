const STEPS = [
  {
    number: "01",
    title: "Choose your device",
    description: "Select your brand and model to see exact repair prices instantly.",
  },
  {
    number: "02",
    title: "Book online",
    description: "Pick a nearby store and time slot. Pay only a 20% deposit to confirm.",
  },
  {
    number: "03",
    title: "Drop it off",
    description: "Our technicians fix it while you wait — most repairs done in under an hour.",
  },
  {
    number: "04",
    title: "Pick it up, good as new",
    description: "Pay the balance on collection. Every repair is covered by our 180-day warranty.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            How it works
          </h2>
          <p className="text-[var(--fonfix-text-muted)] text-lg max-w-xl mx-auto">
            Getting your phone repaired at IErepair is quick, transparent, and hassle-free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--fonfix-blue-light)] flex items-center justify-center">
                <span className="text-[var(--fonfix-blue)] font-extrabold text-sm">
                  {s.number}
                </span>
              </div>
              <h3 className="text-[var(--fonfix-text)] font-bold text-lg">{s.title}</h3>
              <p className="text-[var(--fonfix-text-muted)] text-sm leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
