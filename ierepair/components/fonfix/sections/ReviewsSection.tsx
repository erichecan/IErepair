const REVIEWS = [
  {
    name: "Sarah M.",
    location: "Dublin",
    rating: 5,
    text: "Screen replaced in 40 minutes. Looks brand new. Staff were friendly and explained everything clearly. Will definitely return.",
  },
  {
    name: "Ciarán O'B.",
    location: "Cork",
    rating: 5,
    text: "Dropped my Samsung in a puddle. Brought it to IErepair the same day — they cleaned it up perfectly. No data lost. Amazing service.",
  },
  {
    name: "Emma L.",
    location: "Galway",
    rating: 5,
    text: "Battery replacement sorted in 30 minutes. Phone is back to lasting a full day. Very competitive pricing compared to the Apple Store.",
  },
  {
    name: "Darragh F.",
    location: "Limerick",
    rating: 5,
    text: "Booked online, paid the deposit, walked in and was done in under an hour. Exactly as advertised. Top marks.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-sm">★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Stars count={5} />
            <span className="font-bold text-[var(--fonfix-text)]">4.9 / 5</span>
            <span className="text-[var(--fonfix-text-muted)] text-sm">from 744 reviews</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            What our customers say
          </h2>
          <p className="text-[var(--fonfix-text-muted)] text-lg max-w-xl mx-auto">
            Real reviews from real customers across Ireland.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="bg-[#F8FAFD] rounded-2xl p-5 border border-[var(--fonfix-border)] flex flex-col gap-3"
            >
              <Stars count={r.rating} />
              <p className="text-[var(--fonfix-text)] text-sm leading-relaxed flex-1">
                &ldquo;{r.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-sm text-[var(--fonfix-text)]">{r.name}</p>
                <p className="text-xs text-[var(--fonfix-text-muted)]">{r.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
