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
  images: string[];
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

async function uploadImage(file: File): Promise<string> {
  const presignRes = await fetch("/api/admin/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json();
    throw new Error(err.error || "获取上传地址失败");
  }
  const { uploadUrl, publicUrl } = await presignRes.json();
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("上传到 R2 失败");
  return publicUrl;
}

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
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  type CsvRow = { name: string; nameEn: string; brand: string; categoryName: string; categoryId: number | null; basePriceMin: string; basePriceMax: string; description: string; _error?: string };
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState<{ ok: number; fail: number } | null>(null);

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
          images: pendingImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setProducts(prev => [data.product, ...prev]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setPendingImages([]);
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

  function parseCSVFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = (e.target?.result as string) || "";
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) { alert("CSV 文件至少需要 1 行标题 + 1 行数据"); return; }
      const catByName = Object.fromEntries(categories.map(c => [c.name.toLowerCase(), c]));
      const rows: CsvRow[] = lines.slice(1).map(line => {
        const cols = parseCSVLine(line);
        const [name = "", nameEn = "", brand = "", categoryName = "", basePriceMin = "", basePriceMax = "", description = ""] = cols;
        const catMatch = catByName[categoryName.trim().toLowerCase()];
        const errors: string[] = [];
        if (!name.trim()) errors.push("商品名称不能为空");
        if (!categoryName.trim()) errors.push("品类不能为空");
        else if (!catMatch) errors.push(`品类"${categoryName}"不存在`);
        return {
          name: name.trim(), nameEn: nameEn.trim(), brand: brand.trim(),
          categoryName: categoryName.trim(), categoryId: catMatch?.id ?? null,
          basePriceMin: basePriceMin.trim(), basePriceMax: basePriceMax.trim(),
          description: description.trim(),
          _error: errors.length ? errors.join("；") : undefined,
        };
      });
      setCsvRows(rows);
      setCsvResult(null);
    };
    reader.readAsText(file, "utf-8");
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current); current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  async function importCSV() {
    const valid = csvRows.filter(r => !r._error);
    if (!valid.length) return;
    setCsvImporting(true);
    let ok = 0; let fail = 0;
    const newProducts: Product[] = [];
    for (const row of valid) {
      try {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name, nameEn: row.nameEn || null, brand: row.brand || null,
            description: row.description || null, categoryId: row.categoryId,
            basePriceMin: row.basePriceMin ? parseFloat(row.basePriceMin) : null,
            basePriceMax: row.basePriceMax ? parseFloat(row.basePriceMax) : null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          newProducts.push(data.product);
          ok++;
        } else { fail++; }
      } catch { fail++; }
    }
    setProducts(prev => [...newProducts, ...prev]);
    setCsvImporting(false);
    setCsvResult({ ok, fail });
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
          onClick={() => { setShowCsvImport(true); setCsvRows([]); setCsvResult(null); }}
          style={{ padding: "9px 16px", background: "#f5f5f7", color: "#1d1d1f", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          CSV 导入
        </button>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {p.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.images[0]} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5ea", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, background: "#f5f5f7", borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                        )}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{p.name}</div>
                          {p.nameEn && <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 1 }}>{p.nameEn}</div>}
                        </div>
                      </div>
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

      {showCsvImport && (
        <Modal title="CSV 批量导入商品" onClose={() => setShowCsvImport(false)}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 8 }}>
              CSV 格式（第一行为标题，品类名称须与系统中完全一致）：
            </div>
            <code style={{ display: "block", fontSize: 11, background: "#f5f5f7", padding: "8px 12px", borderRadius: 6, color: "#3c3c43", wordBreak: "break-all" }}>
              name,nameEn,brand,category,basePriceMin,basePriceMax,description
            </code>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 16px", borderRadius: 8, border: "1.5px dashed #d1d1d6",
              cursor: "pointer", fontSize: 13, color: "#6e6e73",
            }}>
              <input
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) parseCSVFile(file);
                  e.target.value = "";
                }}
              />
              选择 CSV 文件
            </label>
          </div>

          {csvRows.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: "#6e6e73", marginBottom: 8 }}>
                共 {csvRows.length} 行，其中 <span style={{ color: "#146345", fontWeight: 600 }}>{csvRows.filter(r => !r._error).length} 行有效</span>
                {csvRows.some(r => r._error) && <span>，<span style={{ color: "#ff3b30", fontWeight: 600 }}>{csvRows.filter(r => r._error).length} 行有误</span></span>}
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid #e5e5ea", borderRadius: 8, marginBottom: 16 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f5f5f7", position: "sticky", top: 0 }}>
                      {["商品名称", "英文名", "品牌", "品类", "最低价", "最高价", "状态"].map(h => (
                        <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "#6e6e73", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid #f0f0f0", background: row._error ? "#fff5f5" : undefined }}>
                        <td style={{ padding: "7px 10px", color: "#1d1d1f" }}>{row.name || <em style={{ color: "#aeaeb2" }}>（空）</em>}</td>
                        <td style={{ padding: "7px 10px", color: "#6e6e73" }}>{row.nameEn || "—"}</td>
                        <td style={{ padding: "7px 10px", color: "#6e6e73" }}>{row.brand || "—"}</td>
                        <td style={{ padding: "7px 10px", color: row.categoryId ? "#1d1d1f" : "#ff3b30" }}>{row.categoryName || "—"}</td>
                        <td style={{ padding: "7px 10px", color: "#6e6e73" }}>{row.basePriceMin ? `€${row.basePriceMin}` : "—"}</td>
                        <td style={{ padding: "7px 10px", color: "#6e6e73" }}>{row.basePriceMax ? `€${row.basePriceMax}` : "—"}</td>
                        <td style={{ padding: "7px 10px" }}>
                          {row._error
                            ? <span style={{ color: "#ff3b30", fontWeight: 500 }} title={row._error}>✕ {row._error}</span>
                            : <span style={{ color: "#146345", fontWeight: 500 }}>✓ 可导入</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {csvResult && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: csvResult.fail > 0 ? "#fff8e1" : "#e6f7ee", marginBottom: 16, fontSize: 13 }}>
              导入完成：<strong style={{ color: "#146345" }}>{csvResult.ok} 个成功</strong>
              {csvResult.fail > 0 && <span>，<strong style={{ color: "#ff3b30" }}>{csvResult.fail} 个失败</strong></span>}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowCsvImport(false)}
              style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}
            >
              关闭
            </button>
            <button
              onClick={importCSV}
              disabled={csvImporting || csvRows.filter(r => !r._error).length === 0}
              style={{
                padding: "9px 20px", background: "#146345", color: "#fff", border: "none",
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: (csvImporting || csvRows.filter(r => !r._error).length === 0) ? "default" : "pointer",
                opacity: (csvImporting || csvRows.filter(r => !r._error).length === 0) ? 0.5 : 1,
              }}
            >
              {csvImporting ? "导入中…" : `导入 ${csvRows.filter(r => !r._error).length} 个商品`}
            </button>
          </div>
        </Modal>
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

          <FormField label="商品图片">
            <div>
              <label style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, border: "1.5px dashed #d1d1d6",
                cursor: uploading ? "default" : "pointer", fontSize: 13, color: "#6e6e73",
                opacity: uploading ? 0.6 : 1,
              }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={uploading}
                  style={{ display: "none" }}
                  onChange={async e => {
                    const files = Array.from(e.target.files ?? []);
                    if (!files.length) return;
                    setUploading(true);
                    setError("");
                    try {
                      const urls = await Promise.all(files.map(uploadImage));
                      setPendingImages(prev => [...prev, ...urls]);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "图片上传失败");
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                {uploading ? "上传中…" : "+ 选择图片"}
              </label>
              {pendingImages.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {pendingImages.map((url, i) => (
                    <div key={url} style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5ea" }} />
                      <button
                        type="button"
                        onClick={() => setPendingImages(prev => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: "absolute", top: -6, right: -6, width: 18, height: 18,
                          borderRadius: "50%", border: "none", background: "#ff3b30", color: "#fff",
                          fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center",
                          justifyContent: "center", padding: 0, lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
