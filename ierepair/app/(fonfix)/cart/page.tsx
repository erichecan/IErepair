"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { items, total, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFD] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-extrabold text-[var(--fonfix-text)] mb-3">Your cart is empty</h1>
        <p className="text-[var(--fonfix-text-muted)] mb-8">
          Browse our repairs and add a service to get started.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
        >
          Browse Repairs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--fonfix-text)] mb-8">
          Your Cart
        </h1>

        <div className="flex flex-col gap-4 mb-8">
          {items.map(({ product }) => (
            <div
              key={product.slug}
              className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-5 flex items-start gap-4"
            >
              <div className="flex-1">
                <p className="text-xs text-[var(--fonfix-text-muted)] mb-0.5">{product.brand} · {product.deviceModel}</p>
                <h2 className="font-bold text-[var(--fonfix-text)]">{product.repairType}</h2>
                <p className="text-sm text-[var(--fonfix-text-muted)] mt-1">
                  ~{product.estimatedMin} min · {product.warranty} warranty
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span className="text-lg font-extrabold text-[var(--fonfix-text)]">€{product.price}</span>
                <button
                  onClick={() => removeItem(product.slug)}
                  className="text-xs text-[var(--fonfix-text-muted)] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--fonfix-border)]">
            <span className="font-semibold text-[var(--fonfix-text)]">Estimated total</span>
            <span className="text-2xl font-extrabold text-[var(--fonfix-text)]">€{total}</span>
          </div>
          <p className="text-sm text-[var(--fonfix-text-muted)] mb-6">
            Secure your booking with a small deposit. Pay the remaining balance in-store after your repair.
          </p>
          <Link
            href="/repair/book"
            className="block text-center px-6 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors mb-3"
          >
            Proceed to Booking →
          </Link>
          <button
            onClick={clearCart}
            className="w-full text-sm text-[var(--fonfix-text-muted)] hover:text-[var(--fonfix-text)] transition-colors"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
