import Link from "next/link";
import { STORES } from "@/data/fonfix/stores";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            Get in Touch
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg">
            We're here Monday to Saturday across all our stores.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* General contact */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">General enquiries</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-[var(--fonfix-blue)]">✉</span>
                <a href="mailto:hello@ierepair.ie" className="text-[var(--fonfix-blue)] hover:underline">
                  hello@ierepair.ie
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--fonfix-blue)]">⏱</span>
                <span className="text-[var(--fonfix-text-muted)]">Response within 1 business day</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">Business enquiries</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--fonfix-blue)]">✉</span>
              <a href="mailto:business@ierepair.ie" className="text-[var(--fonfix-blue)] hover:underline">
                business@ierepair.ie
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-5">
            <p className="text-sm text-[var(--fonfix-text-muted)] mb-3">
              For booking changes, warranty claims, or repair updates — contact your store directly.
            </p>
            <Link
              href="/pages/stores"
              className="text-sm font-semibold text-[var(--fonfix-blue)] hover:underline"
            >
              View all store contact details →
            </Link>
          </div>
        </div>

        {/* Store phones */}
        <div>
          <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">Call a store</h2>
          <div className="space-y-3">
            {STORES.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-xl border border-[var(--fonfix-border)] p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-[var(--fonfix-text)] text-sm">{store.name}</p>
                  <p className="text-xs text-[var(--fonfix-text-muted)]">{store.city}</p>
                </div>
                <a
                  href={`tel:${store.phone}`}
                  className="text-sm font-semibold text-[var(--fonfix-blue)] hover:underline"
                >
                  {store.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
