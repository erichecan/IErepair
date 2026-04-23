"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/**
 * Nav routes are grounded in what the app actually renders today:
 *   /repair/browse?type=phone|tablet&brand=Apple|Samsung|Google|OnePlus|… (server-rendered device catalog)
 *   /repair/list/{screen|battery|back-glass|charging}                    (category landing pages)
 *   /pages/stores /pages/warranty /pages/business /pages/faq /pages/contact /pages/about
 *
 * Everything else used to 404 — removed.
 */
const NAV_ITEMS: {
  label: string;
  href?: string;
  items?: { name: string; href: string }[];
}[] = [
  {
    label: "Phones",
    items: [
      { name: "Apple iPhone",      href: "/repair/browse?type=phone&brand=Apple" },
      { name: "Samsung Galaxy",    href: "/repair/browse?type=phone&brand=Samsung" },
      { name: "Google Pixel",      href: "/repair/browse?type=phone&brand=Google" },
      { name: "OnePlus",           href: "/repair/browse?type=phone&brand=OnePlus" },
      { name: "All phone models",  href: "/repair/browse?type=phone" },
    ],
  },
  {
    label: "Tablets",
    items: [
      { name: "iPad",              href: "/repair/browse?type=tablet&brand=Apple" },
      { name: "Samsung Tab",       href: "/repair/browse?type=tablet&brand=Samsung" },
      { name: "All tablet models", href: "/repair/browse?type=tablet" },
    ],
  },
  {
    label: "Repairs",
    items: [
      { name: "Screen repair",       href: "/repair/list/screen" },
      { name: "Battery replacement", href: "/repair/list/battery" },
      { name: "Back glass",          href: "/repair/list/back-glass" },
      { name: "Charging port",       href: "/repair/list/charging" },
    ],
  },
  { label: "Stores",    href: "/pages/stores" },
  { label: "Business",  href: "/pages/business" },
  { label: "Help",      href: "/help" },
];

export default function IErepairHeader() {
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-[#1c3230]">
      {/* Desktop — single dark bar */}
      <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-6 h-14">
        <Link href="/" className="flex items-center gap-1.5 shrink-0 mr-6">
          <span className="text-white font-extrabold text-xl tracking-tight">IErepair</span>
          <span className="text-white/40 text-xs border border-white/20 rounded px-1 py-0.5 font-medium">.ie</span>
        </Link>

        <nav className="flex items-center gap-0 flex-1">
          {NAV_ITEMS.map((item) => {
            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  aria-expanded={activeMenu === item.label}
                  aria-haspopup="menu"
                >
                  {item.label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${activeMenu === item.label ? "rotate-180" : ""}`}
                  />
                </button>

                {activeMenu === item.label && item.items && (
                  <div className="absolute top-full left-0 pt-1 min-w-[220px] z-50" role="menu">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                      {item.items.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1c3230] font-medium transition-colors"
                          role="menuitem"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-4">
          <Link
            href="/repair/browse"
            className="px-4 py-1.5 text-xs font-semibold bg-white text-[#1c3230] rounded-lg hover:bg-gray-100 transition-colors"
          >
            Book a Repair
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center justify-center w-8 h-8"
            aria-label="Cart"
          >
            <ShoppingCart size={18} className="text-white/80 hover:text-white" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[#1c3230] text-[9px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 h-12">
        <Link href="/" className="font-extrabold text-lg text-white">
          IErepair<span className="text-white/40 text-xs">.ie</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative w-8 h-8 flex items-center justify-center"
            aria-label="Cart"
          >
            <ShoppingCart size={18} className="text-white/80" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-[#1c3230] text-[9px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-12 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.items ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 pt-3 pb-1">
                      {item.label}
                    </p>
                    {item.items.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Account
            </Link>
            <div className="pt-2">
              <Link
                href="/repair/browse"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center bg-[#1c3230] text-white py-3 rounded-xl font-semibold text-sm"
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
