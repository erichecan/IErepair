"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FAQ_ITEMS } from "@/data/fonfix/faq";

const CATEGORIES = [
  {
    title: "Repairs",
    emoji: "🔧",
    desc: "How long repairs take, warranties, parts quality",
    href: "/pages/faq?cat=Repairs",
  },
  {
    title: "Booking",
    emoji: "📅",
    desc: "How to book, cancel, or reschedule an appointment",
    href: "/pages/faq?cat=Booking",
  },
  {
    title: "Warranty",
    emoji: "🛡️",
    desc: "What's covered, what's not, how to make a claim",
    href: "/pages/warranty",
  },
  {
    title: "Contact Us",
    emoji: "💬",
    desc: "Reach us by email, phone, or visit a store",
    href: "/pages/contact",
  },
];

const HOT_QUESTIONS = FAQ_ITEMS.slice(0, 5);

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/pages/faq?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Hero with search */}
      <div className="bg-[var(--fonfix-blue)] text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            How can we help?
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Search our help centre or browse topics below.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. screen repair, battery, booking..."
              className="flex-1 px-4 py-3 rounded-xl text-[var(--fonfix-text)] placeholder-[var(--fonfix-text-muted)] outline-none text-sm font-medium shadow-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-white text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Category cards */}
        <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-6">
          Browse by topic
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-5 flex flex-col items-center text-center gap-2 hover:border-[var(--fonfix-blue)] hover:shadow-sm transition-all group"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="font-bold text-sm text-[var(--fonfix-text)] group-hover:text-[var(--fonfix-blue)] transition-colors">
                {cat.title}
              </span>
              <span className="text-xs text-[var(--fonfix-text-muted)] leading-snug">
                {cat.desc}
              </span>
            </Link>
          ))}
        </div>

        {/* Hot questions */}
        <h2 className="text-xl font-extrabold text-[var(--fonfix-text)] mb-4">
          Popular questions
        </h2>
        <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] divide-y divide-[var(--fonfix-border)]">
          {HOT_QUESTIONS.map((item) => (
            <Link
              key={item.id}
              href={`/pages/faq?cat=${encodeURIComponent(item.category)}`}
              className="flex items-start justify-between gap-4 px-6 py-4 hover:bg-[var(--fonfix-blue-light)] transition-colors group"
            >
              <div>
                <p className="font-semibold text-sm text-[var(--fonfix-text)] group-hover:text-[var(--fonfix-blue)] transition-colors">
                  {item.question}
                </p>
                <p className="text-xs text-[var(--fonfix-text-muted)] mt-1">
                  {item.category}
                </p>
              </div>
              <span className="text-[var(--fonfix-blue)] text-lg shrink-0 mt-0.5">→</span>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center bg-white rounded-2xl border border-[var(--fonfix-border)] px-6 py-10">
          <p className="text-lg font-extrabold text-[var(--fonfix-text)] mb-2">
            Still need help?
          </p>
          <p className="text-sm text-[var(--fonfix-text-muted)] mb-6">
            Our team is available Monday–Saturday across all stores.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@ierepair.ie"
              className="inline-block px-6 py-3 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Email us
            </a>
            <Link
              href="/pages/contact"
              className="inline-block px-6 py-3 border-2 border-[var(--fonfix-blue)] text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-[var(--fonfix-blue-light)] transition-colors text-sm"
            >
              View store contacts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
