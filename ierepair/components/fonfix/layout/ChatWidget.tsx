"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 rounded-2xl shadow-2xl border border-[var(--fonfix-border)] bg-white overflow-hidden">
          <div className="bg-[var(--fonfix-blue)] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Fonfix Support</p>
              <p className="text-white/80 text-xs">Usually replies in minutes</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-[var(--fonfix-blue-light)] rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm text-[var(--fonfix-text)] max-w-[85%]">
              Hi! How can we help you today? 👋
            </div>
            <div className="bg-[var(--fonfix-blue-light)] rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm text-[var(--fonfix-text)] max-w-[85%]">
              You can ask about repair prices, booking times, or any device issue.
            </div>
          </div>
          <div className="px-4 pb-4">
            <input
              type="text"
              placeholder="Type a message…"
              className="w-full border border-[var(--fonfix-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--fonfix-blue)] transition-colors"
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-[var(--fonfix-blue)] text-white shadow-lg hover:bg-[var(--fonfix-blue-dark)] transition-colors flex items-center justify-center"
        aria-label="Open chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
