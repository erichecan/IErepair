"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { RepairProduct } from "@/data/fonfix/products";

export type CartItem = {
  product: RepairProduct;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: RepairProduct) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  isInCart: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "ierepair_cart";
const LEGACY_STORAGE_KEYS = ["fonfix_cart"];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      // Migrate legacy cart data from previous brand names.
      if (!raw) {
        for (const legacy of LEGACY_STORAGE_KEYS) {
          const v = localStorage.getItem(legacy);
          if (v) {
            raw = v;
            localStorage.removeItem(legacy);
            break;
          }
        }
      }
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: RepairProduct) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug);
      if (existing) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (slug: string) => items.some((i) => i.product.slug === slug),
    [items],
  );

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
