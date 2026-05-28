"use client";

import { useState } from "react";
import Modal from "./Modal";
import FormField, { TextInput } from "./FormField";

type ProductCategory = { id: number; name: string };

type Product = {
  id: number;
  name: string;
  nameEn: string | null;
  brand: string | null;
  description: string | null;
  categoryId: number;
  category: { id: number; name: string };
  basePriceMin: number | null;
  basePriceMax: number | null;
  isActive: boolean;
  status: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: "已上架", color: "#146345", bg: "#e6f7ee" },
  pending:  { label: "待审核", color: "#8a6500", bg: "#fff8e1" },
  rejected: { label: "已拒绝", color: "#c0392b", bg: "#fde8e8" },
};

const EMPTY_FORM = { name: "", nameEn: "", brand: "", description: "", categoryId: "", basePriceMin: "", basePriceMax: "" };

export default function ProductCatalog({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: ProductCategory[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filterCat, setFilterCat] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function field(k: keyof typeof EMPTY_FORM) {
    return { value: form[k], onChange: (v: string) => setForm(prev => ({ ...prev, [k]: v })) };
  }

  const filtered = products.filter(p => {
    if (filterCat && p.categoryId !== filterCat) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  async function createProduct() {
    setError("");
    if (!form.name.trim() || !form.categoryId) {
      setError("商品名称和品类为必填项");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categoryId: parseInt(form.categoryId),
          basePriceMin: form.basePriceMin ? parseFloat(form.basePriceMin) : null,
          basePriceMax: form.basePriceMax ? parseFloat(form.basePriceMax) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setProducts(prev => [data.product, ...prev]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(product: Product) {
    const newStatus = product.status === "active" ? "pending" : "active";
    const newActive = newStatus === "active";
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus, isActive: newActive } : p));
    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, isActive: newActive }),
    });
  }

  async function deleteProduct(id: number) {
    if (!confirm("确认删除此商品？删除后无法恢复。")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  }

  const selectStyle = {
    padding: "7px 12px", border: "1px solid #e5e5ea", borderRadius: 8,
    fontSize: 13, color: "#1d1d1f", background: "#fff", cursor: "pointer", outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filterCat ?? ""} onChange={e => setFilterCat(e.target.value ? parseInt(e.target.value) : null)} style={selectStyle}>
          <option value="">全部品类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="all">全部状态</option>
          <option value="active">已上架</option>
          <option value="pending">待审核</option>
          <option value="rejected">已拒绝</option>
        </select>
        <span style={{ fontSize: 13, color: "#6e6e73", flex: 1 }}>{filtered.length} 个商品</span>
        <button
          onClick={() => { setShowCreate(true); setError(""); }}
          style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          + 添加商品
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73", fontSize: 14 }}>
          {products.length === 0 ? "暂无商品，点击右上角添加第一个" : "没有符合筛选条件的商品"}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f7" }}>
                {["商品名称", "品牌", "品类", "参考价格 (€)", "状态", "操作"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = STATUS_LABEL[p.status] || STATUS_LABEL.pending;
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{p.name}</div>
                      {p.nameEn && <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 1 }}>{p.nameEn}</div>}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{p.brand || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{p.category.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#1d1d1f" }}>
                      {p.basePriceMin != null && p.basePriceMax != null
                        ? `€${p.basePriceMin} – €${p.basePriceMax}`
                        : p.basePriceMin != null ? `€${p.basePriceMin}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() => toggleStatus(p)}
                          style={{ fontSize: 12, color: "#146345", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          {p.status === "active" ? "下架" : "上架"}
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{ fontSize: 12, color: "#ff3b30", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="添加商品" onClose={() => setShowCreate(false)}>
          <FormField label="商品名称" required>
            <TextInput {...field("name")} placeholder="例：iPhone 15 钢化膜" required />
          </FormField>
          <FormField label="英文名称">
            <TextInput {...field("nameEn")} placeholder="Tempered Glass for iPhone 15" />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="品牌">
              <TextInput {...field("brand")} placeholder="例：Belkin" />
            </FormField>
            <FormField label="品类" required>
              <select
                value={form.categoryId}
                onChange={e => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5ea", borderRadius: 8, fontSize: 14, color: "#1d1d1f", background: "#fff", outline: "none", boxSizing: "border-box" as const }}
              >
                <option value="">选择品类</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="最低参考价 (€)">
              <TextInput {...field("basePriceMin")} type="number" placeholder="0.00" />
            </FormField>
            <FormField label="最高参考价 (€)">
              <TextInput {...field("basePriceMax")} type="number" placeholder="0.00" />
            </FormField>
          </div>
          <FormField label="商品描述">
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="商品简介、适配机型等"
              rows={3}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5ea", borderRadius: 8, fontSize: 14, color: "#1d1d1f", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" as const }}
            />
          </FormField>

          {error && <p style={{ color: "#ff3b30", fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}>取消</button>
            <button
              onClick={createProduct}
              disabled={saving}
              style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "添加中…" : "添加商品"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
