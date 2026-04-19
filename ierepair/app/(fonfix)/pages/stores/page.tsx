import Link from "next/link";
import { STORES } from "@/data/fonfix/stores";

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            Find a IErepair Store
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg">
            {STORES.length} repair centres across Ireland — all offering same-day service.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORES.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6 flex flex-col gap-4"
            >
              {/* Name & rating */}
              <div>
                <h2 className="text-lg font-extrabold text-[var(--fonfix-text)] mb-1">{store.name}</h2>
                <div className="flex items-center gap-2">
                  <Stars rating={store.rating} />
                  <span className="text-sm text-[var(--fonfix-text-muted)]">
                    {store.rating} ({store.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="text-sm text-[var(--fonfix-text-muted)]">
                <p>{store.address}</p>
                <p>{store.city}, {store.eircode}</p>
              </div>

              {/* Hours */}
              <div className="text-sm">
                {Object.entries(store.hours).map(([day, time]) => (
                  <div key={day} className="flex justify-between py-1 border-b border-[var(--fonfix-border)] last:border-0">
                    <span className="text-[var(--fonfix-text-muted)]">{day}</span>
                    <span className={`font-medium ${time === "Closed" ? "text-red-400" : "text-[var(--fonfix-text)]"}`}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact & CTA */}
              <div className="flex flex-col gap-2 pt-2">
                <a href={`tel:${store.phone}`} className="text-sm text-[var(--fonfix-blue)] font-semibold hover:underline">
                  {store.phone}
                </a>
                <a href={`mailto:${store.email}`} className="text-sm text-[var(--fonfix-text-muted)] hover:text-[var(--fonfix-blue)]">
                  {store.email}
                </a>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 border border-[var(--fonfix-border)] text-[var(--fonfix-text)] text-sm font-semibold rounded-xl hover:border-[var(--fonfix-blue)] hover:text-[var(--fonfix-blue)] transition-colors"
                >
                  Get directions
                </a>
                <Link
                  href="/repair/browse"
                  className="flex-1 text-center py-2.5 bg-[var(--fonfix-blue)] text-white text-sm font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
                >
                  Book here
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
