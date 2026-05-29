"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const PAGE_SIZE = 20;

interface CatalogProduct {
  id: number;
  name: string;
  brand: string | null;
  basePriceMin: number | null;
  basePriceMax: number | null;
  images: string[];
  category: { id: number; name: string };
  selected: boolean;
  myPrice: number | null;
}

interface Category { id: number; name: string; }

interface PriceModal {
  product: CatalogProduct;
  price: string;
  error: string;
}

export default function ProductCatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState<PriceModal | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/merchant/catalog/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(0);
  }, [selectedCat]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCat) params.set("categoryId", String(selectedCat));
    if (debouncedQ) params.set("q", debouncedQ);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));
    fetch(`/api/merchant/catalog/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, [selectedCat, debouncedQ, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function openModal(product: CatalogProduct) {
    setModal({ product, price: product.basePriceMin != null ? String(product.basePriceMin) : "", error: "" });
  }

  async function confirmAdd() {
    if (!modal) return;
    const price = parseFloat(modal.price);
    if (isNaN(price) || price <= 0) {
      setModal(m => m ? { ...m, error: "请输入有效价格" } : null);
      return;
    }
    if (modal.product.basePriceMin != null && price < modal.product.basePriceMin) {
      setModal(m => m ? { ...m, error: `价格不能低于参考最低价 €${modal.product.basePriceMin}` } : null);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: modal.product.id, price }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === modal.product.id ? { ...p, selected: true, myPrice: price } : p));
        setModal(null);
      } else {
        const d = await res.json();
        setModal(m => m ? { ...m, error: d.error || "添加失败" } : null);
      }
    } finally { setAdding(false); }
  }

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>商品目录</h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>从平台商品库选择您想销售的商品</p>
        </div>
        <Link href="/merchant/products" style={{ padding: "10px 20px", background: "#f5f5f7", borderRadius: 8, color: "#1d1d1f", fontSize: 14, textDecoration: "none" }}>
          我的商品 →
        </Link>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left sidebar: categories */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e5ea", overflow: "hidden" }}>
            <button
              onClick={() => { setSelectedCat(null); setPage(0); }}
              style={{ width: "100%", padding: "12px 16px", textAlign: "left", fontSize: 14, border: "none", cursor: "pointer", background: selectedCat === null ? "#e8f7f0" : "transparent", color: selectedCat === null ? "#146345" : "#1d1d1f", fontWeight: selectedCat === null ? 600 : 400, borderBottom: "1px solid #f0f0f5" }}
            >
              全部品类
            </button>
            {categories.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCat(c.id); setPage(0); }}
                style={{ width: "100%", padding: "12px 16px", textAlign: "left", fontSize: 14, border: "none", cursor: "pointer", background: selectedCat === c.id ? "#e8f7f0" : "transparent", color: selectedCat === c.id ? "#146345" : "#1d1d1f", fontWeight: selectedCat === c.id ? 600 : 400, borderBottom: idx < categories.length - 1 ? "1px solid #f0f0f5" : "none" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: search + grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            type="search"
            placeholder="搜索商品名称..."
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
          />

          {loading ? (
            <div style={{ color: "#6e6e73", fontSize: 14, padding: "40px", textAlign: "center" }}>加载中...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#6e6e73", background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea" }}>没有找到匹配的商品</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {products.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 10, border: `1px solid ${p.selected ? "#a8e6cb" : "#e5e5ea"}`, overflow: "hidden", position: "relative" }}>
                    {p.selected && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "#146345", color: "#fff", borderRadius: 10, fontSize: 11, padding: "2px 8px", fontWeight: 600 }}>已选</div>
                    )}
                    <div style={{ height: 120, background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.name} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 32, opacity: 0.3 }}>📦</span>
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      {p.brand && <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 4 }}>{p.brand}</div>}
                      <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 10 }}>
                        {p.basePriceMin != null ? `参考价 €${p.basePriceMin}–${p.basePriceMax}` : "价格待定"}
                      </div>
                      {p.selected ? (
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#146345" }}>€{p.myPrice?.toFixed(2)}</div>
                      ) : (
                        <button
                          onClick={() => openModal(p)}
                          style={{ width: "100%", padding: "7px", background: "#146345", border: "none", borderRadius: 6, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          添加到本店
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pageCount > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>上一页</button>
                  <span style={{ padding: "6px 14px", fontSize: 13, color: "#6e6e73" }}>{page + 1} / {pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page >= pageCount - 1 ? "not-allowed" : "pointer", opacity: page >= pageCount - 1 ? 0.4 : 1 }}>下一页</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Price modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", width: 380, boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>设置销售价格</h3>
            <div style={{ fontSize: 14, color: "#6e6e73", marginBottom: 20 }}>{modal.product.name}</div>

            {modal.product.basePriceMin != null && (
              <div style={{ fontSize: 13, color: "#6e6e73", marginBottom: 12, background: "#f9f9f9", borderRadius: 6, padding: "8px 12px" }}>
                平台参考价：€{modal.product.basePriceMin} – €{modal.product.basePriceMax}
              </div>
            )}

            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>您的售价（€）</label>
            <input
              type="number"
              value={modal.price}
              onChange={e => setModal(m => m ? { ...m, price: e.target.value, error: "" } : null)}
              min={modal.product.basePriceMin ?? 0}
              step="0.01"
              autoFocus
              style={{ width: "100%", padding: "10px 12px", border: `1px solid ${modal.error ? "#ffccc7" : "#d1d1d6"}`, borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
            {modal.error && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#c0392b" }}>{modal.error}</div>
            )}
            {modal.product.basePriceMin != null && parseFloat(modal.price) > 0 && parseFloat(modal.price) >= modal.product.basePriceMin && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#146345" }}>✓ 价格符合要求</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d1d6", borderRadius: 8, background: "#fff", fontSize: 14, cursor: "pointer" }}>取消</button>
              <button onClick={confirmAdd} disabled={adding} style={{ flex: 1, padding: "10px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.7 : 1 }}>
                {adding ? "添加中..." : "确认添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
