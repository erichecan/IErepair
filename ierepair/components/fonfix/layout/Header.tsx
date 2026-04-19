"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, ChevronDown, Phone, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { BRANDS } from "@/data/fonfix/brands";

const REPAIR_TYPES = [
  { label: "Screen Replacement", slug: "screen" },
  { label: "Battery Replacement", slug: "battery" },
  { label: "Charging Port", slug: "charging-port" },
  { label: "Water Damage", slug: "water-damage" },
  { label: "Back Cover", slug: "back-cover" },
];

export default function FonfixHeader() {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--fonfix-border)] shadow-sm">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-[var(--fonfix-blue)] font-extrabold text-2xl tracking-tight">
            Fonfix
          </span>
          <span className="text-xs text-[var(--fonfix-text-muted)] border border-[var(--fonfix-border)] rounded px-1.5 py-0.5 font-medium">
            .ie
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {/* Repairs mega-menu */}
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[var(--fonfix-text)] hover:bg-[var(--fonfix-blue-light)] transition-colors">
              Repairs <ChevronDown size={14} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[640px]">
                <div className="bg-white rounded-2xl shadow-xl border border-[var(--fonfix-border)] p-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-[var(--fonfix-text-muted)] uppercase tracking-widest mb-3">
                      By Brand
                    </p>
                    <div className="space-y-1">
                      {BRANDS.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/collections/${b.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--fonfix-blue-light)] transition-colors text-sm text-[var(--fonfix-text)] font-medium"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--fonfix-text-muted)] uppercase tracking-widest mb-3">
                      By Repair Type
                    </p>
                    <div className="space-y-1">
                      {REPAIR_TYPES.map((r) => (
                        <Link
                          key={r.slug}
                          href={`/repair/browse?type=${r.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--fonfix-blue-light)] transition-colors text-sm text-[var(--fonfix-text)]"
                        >
                          {r.label}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--fonfix-border)]">
                      <Link
                        href="/repair/book"
                        className="block w-full text-center bg-[var(--fonfix-blue)] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[var(--fonfix-blue-dark)] transition-colors"
                      >
                        Book a Repair →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink href="/pages/about">About</NavLink>
          <NavLink href="/pages/faq">FAQ</NavLink>
          <NavLink href="/pages/stores">Stores</NavLink>
          <NavLink href="/blogs">Blog</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+35312345678"
            className="hidden lg:flex items-center gap-1.5 text-sm text-[var(--fonfix-text-muted)] hover:text-[var(--fonfix-blue)] transition-colors font-medium"
          >
            <Phone size={14} />
            +353 1 234 5678
          </a>
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--fonfix-blue-light)] transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart size={20} className="text-[var(--fonfix-text)]" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--fonfix-blue)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 text-sm font-semibold text-white bg-[var(--fonfix-blue)] rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-4 h-14">
        <Link href="/" className="font-extrabold text-xl text-[var(--fonfix-blue)]">
          Fonfix
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--fonfix-blue)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-[var(--fonfix-border)] shadow-lg z-50">
          <div className="px-4 py-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fonfix-text-muted)] px-3 mb-2">
              Repairs by Brand
            </p>
            {BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/collections/${b.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--fonfix-text)] hover:bg-[var(--fonfix-blue-light)]"
              >
                {b.name}
              </Link>
            ))}
            <div className="h-px bg-[var(--fonfix-border)] my-2" />
            {[
              { href: "/pages/about", label: "About" },
              { href: "/pages/faq", label: "FAQ" },
              { href: "/pages/stores", label: "Stores", icon: <MapPin size={14} /> },
              { href: "/blogs", label: "Blog" },
              { href: "/account", label: "Account" },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--fonfix-text)] hover:bg-[var(--fonfix-blue-light)]"
              >
                {icon}
                {label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/repair/book"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-[var(--fonfix-blue)] text-white py-3 rounded-xl font-semibold text-sm"
              >
                Book a Repair
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-[var(--fonfix-text)] hover:bg-[var(--fonfix-blue-light)] transition-colors"
    >
      {children}
    </Link>
  );
}
