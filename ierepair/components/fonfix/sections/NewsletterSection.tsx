"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-16 bg-[var(--fonfix-blue)]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          Get repair tips in your inbox
        </h2>
        <p className="text-white/80 mb-8">
          Monthly advice on keeping your devices in top shape — no spam.
        </p>

        {submitted ? (
          <p className="text-white font-semibold text-lg">
            You're on the list! 🎉
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none text-[var(--fonfix-text)]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-white/90 transition-colors text-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
