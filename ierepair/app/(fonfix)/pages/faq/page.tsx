"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/data/fonfix/faq";

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--fonfix-border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-[var(--fonfix-text)]">{question}</span>
        <span className={`text-[var(--fonfix-blue)] text-xl transition-transform duration-200 shrink-0 ${open ? "rotate-45" : ""}`}>
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 text-[var(--fonfix-text-muted)] text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function FAQContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const qParam = searchParams.get("q") ?? "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(qParam);

  useEffect(() => {
    if (catParam && FAQ_CATEGORIES.includes(catParam)) {
      setActiveCategory(catParam);
    }
  }, [catParam]);

  useEffect(() => {
    if (qParam) setSearchQuery(qParam);
  }, [qParam]);

  const filtered = FAQ_ITEMS.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchQ =
      !searchQuery.trim() ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <>
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === cat && !searchQuery
                ? "bg-[var(--fonfix-blue)] text-white"
                : "bg-white text-[var(--fonfix-text-muted)] border border-[var(--fonfix-border)] hover:border-[var(--fonfix-blue)] hover:text-[var(--fonfix-blue)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] px-6">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Accordion key={item.id} question={item.question} answer={item.answer} />
          ))
        ) : (
          <div className="py-12 text-center text-[var(--fonfix-text-muted)] text-sm">
            No results found.{" "}
            <a href="mailto:hello@ierepair.ie" className="text-[var(--fonfix-blue)] hover:underline">
              Email us
            </a>{" "}
            and we'll help.
          </div>
        )}
      </div>
    </>
  );
}

function FAQSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] px-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 border-b border-[var(--fonfix-border)] last:border-0" />
        ))}
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg">
            Everything you need to know about IErepair repairs.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Suspense fallback={<FAQSkeleton />}>
          <FAQContent />
        </Suspense>

        {/* Contact nudge */}
        <div className="mt-12 text-center">
          <p className="text-[var(--fonfix-text-muted)] mb-4">Still have questions?</p>
          <a
            href="mailto:hello@ierepair.ie"
            className="inline-block px-6 py-3 border-2 border-[var(--fonfix-blue)] text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-[var(--fonfix-blue-light)] transition-colors"
          >
            Email us →
          </a>
        </div>
      </div>
    </div>
  );
}
