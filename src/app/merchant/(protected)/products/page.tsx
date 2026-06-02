"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface MerchantProductItem {
  id: number;
  price: number;
  isActive: boolean;
  productId: number;
  product: {
    name: string;
    brand: string | null;
    images: string[];
    basePriceMin: number | null;
    basePriceMax: number | null;
    category: { id: number; name: string };
  };
}

interface Category { id: number; name: string; }

export default function MerchantProductsPage() {
  const [lang] = useLang("en");
  const t = useMerchantT(lang);
  const [items, setItems] = useState<MerchantProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState("");

  // Filters
  const [filterCat, setFilterCat] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [searchQ, setSearchQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    fetch("/api/merchant/catalog/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ), 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch("/api/merchant/products")
      .then(r => r.json())
      .then(d => setItems(d.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const filtered = items.filter(item => {
    if (filterCat && String(item.product.category.id) !== filterCat) return false;
    if (filterStatus === "active" && !item.isActive) return false;
    if (filterStatus === "inactive" && item.isActive) return false;
    if (debouncedQ && !item.product.name.toLowerCase().includes(debouncedQ.toLowerCase())) return false;
    return true;
  });

  async function savePrice(id: number) {
    const item = items.find(i => i.id === id);
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) { setEditError(t.errorInvalidPrice); return; }
    if (item && item.product.basePriceMin != null && price < item.product.basePriceMin) {
      setEditError(t.productsErrPriceTooLow(item.product.basePriceMin));
      return;
    }
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, price } : i));
      setEditingId(null);
    }
  }

  async function toggleActive(id: number, current: boolean) {
    const res = await fetch(`/api/merchant/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: !current } : i));
  }

  async function removeItem(id: number) {
    if (!confirm(t.productsRemoveConfirm)) return;
    const res = await fetch(`/api/merchant/products/${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>{t.productsTitle}</h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>{t.productsDesc}</p>
        </div>
        <Link href="/merchant/products/catalog" style={{ padding: "10px 20px", background: "#146345", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          {t.productsAddBtn}
        </Link>
      </div>

      {/* Filter toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder={t.productsSearchPlaceholder}
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "8px 14px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none" }}
        />
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ padding: "8px 14px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none" }}
        >
          <option value="">{t.productsFilterAllCats}</option>
          {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
          style={{ padding: "8px 14px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none" }}
        >
          <option value="all">{t.productsFilterAll}</option>
          <option value="active">{t.productsFilterActive}</option>
          <option value="inactive">{t.productsFilterInactive}</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: "#6e6e73", fontSize: 14 }}>{t.loadingText}</div>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>{t.productsEmptyTitle}</div>
          <div style={{ fontSize: 14, color: "#6e6e73", marginBottom: 24 }}>{t.productsEmptyDesc}</div>
          <Link href="/merchant/products/catalog" style={{ padding: "10px 24px", background: "#146345", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            {t.productsBrowseBtn}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "40px", textAlign: "center", color: "#6e6e73", fontSize: 14 }}>
          {t.productsNoMatch}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5ea" }}>
                {[t.productsColProduct, t.productsColCategory, t.productsColRefPrice, t.productsColMyPrice, t.productsColStatus, t.productsColActions].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f5" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{item.product.name}</div>
                    {item.product.brand && <div style={{ fontSize: 12, color: "#6e6e73" }}>{item.product.brand}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6e6e73" }}>{item.product.category.name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6e6e73" }}>
                    {item.product.basePriceMin != null ? `€${item.product.basePriceMin}–${item.product.basePriceMax}` : "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {editingId === item.id ? (
                      <div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => { setEditPrice(e.target.value); setEditError(""); }}
                            min={item.product.basePriceMin ?? 0}
                            step="0.01"
                            style={{ width: 80, padding: "4px 8px", border: `1px solid ${editError ? "#ffccc7" : "#146345"}`, borderRadius: 6, fontSize: 13 }}
                            autoFocus
                            onKeyDown={e => { if (e.key === "Enter") savePrice(item.id); if (e.key === "Escape") setEditingId(null); }}
                          />
                          <button onClick={() => savePrice(item.id)} style={{ padding: "4px 10px", background: "#146345", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer" }}>{t.productsSaveBtn}</button>
                          <button onClick={() => { setEditingId(null); setEditError(""); }} style={{ padding: "4px 10px", background: "#f5f5f7", border: "none", borderRadius: 6, color: "#6e6e73", fontSize: 12, cursor: "pointer" }}>{t.productsCancelBtn}</button>
                        </div>
                        {editError && <div style={{ fontSize: 11, color: "#c0392b", marginTop: 4 }}>{editError}</div>}
                        {item.product.basePriceMin != null && (
                          <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>{t.productsMinPrice(item.product.basePriceMin!)}</div>
                        )}
                      </div>
                    ) : (
                      <span
                        onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); setEditError(""); }}
                        title={t.productsClickToEdit}
                        style={{ fontSize: 14, fontWeight: 600, color: "#146345", cursor: "pointer" }}
                      >
                        €{item.price.toFixed(2)} <span style={{ fontSize: 11, opacity: 0.6 }}>✏</span>
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: item.isActive ? "#e8f7f0" : "#f5f5f7", color: item.isActive ? "#146345" : "#6e6e73" }}>
                      {item.isActive ? t.productsStatusActive : t.productsStatusInactive}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleActive(item.id, item.isActive)} style={{ padding: "4px 12px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", color: "#1d1d1f" }}>
                        {item.isActive ? t.productsToggleInactive : t.productsToggleActive}
                      </button>
                      <button onClick={() => removeItem(item.id)} style={{ padding: "4px 12px", border: "1px solid #ffccc7", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", color: "#c0392b" }}>
                        {t.productsRemoveBtn}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
