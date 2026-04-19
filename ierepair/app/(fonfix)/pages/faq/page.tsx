"use client";

import { useState } from "react";
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

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === activeCategory);

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
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat
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
          {filtered.map((item) => (
            <Accordion key={item.id} question={item.question} answer={item.answer} />
          ))}
        </div>

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
