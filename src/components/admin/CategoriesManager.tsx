"use client";

import { useState } from "react";
import Modal from "./Modal";
import FormField, { TextInput } from "./FormField";

type DeviceCat = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  _count: { brands: number; repairTypes: number };
};

type ProductCat = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  _count: { products: number };
};

const EMPTY_DC = { name: "", nameEn: "", slug: "" };
const EMPTY_PC = { name: "", nameEn: "", slug: "" };

export default function CategoriesManager({
  initialDeviceCats,
  initialProductCats,
}: {
  initialDeviceCats: DeviceCat[];
  initialProductCats: ProductCat[];
}) {
  const [tab, setTab] = useState<"device" | "product">("device");
  const [deviceCats, setDeviceCats] = useState(initialDeviceCats);
  const [productCats, setProductCats] = useState(initialProductCats);
  const [showCreate, setShowCreate] = useState(false);
  const [dcForm, setDcForm] = useState(EMPTY_DC);
  const [pcForm, setPcForm] = useState(EMPTY_PC);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createDeviceCat() {
    setError("");
    if (!dcForm.name.trim() || !dcForm.nameEn.trim() || !dcForm.slug.trim()) {
      setError("三个字段均为必填");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/device-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dcForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setDeviceCats(prev => [...prev, { ...data.category, _count: { brands: 0, repairTypes: 0 } }]);
      setShowCreate(false);
      setDcForm(EMPTY_DC);
    } finally {
      setSaving(false);
    }
  }

  async function createProductCat() {
    setError("");
    if (!pcForm.name.trim() || !pcForm.nameEn.trim() || !pcForm.slug.trim()) {
      setError("三个字段均为必填");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pcForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "创建失败"); return; }
      setProductCats(prev => [...prev, { ...data.category, _count: { products: 0 } }]);
      setShowCreate(false);
      setPcForm(EMPTY_PC);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProductCat(id: number) {
    if (!confirm("确认删除此品类？")) return;
    const res = await fetch(`/api/admin/product-categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "删除失败"); return; }
    setProductCats(prev => prev.filter(c => c.id !== id));
  }

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "#146345" : "#6e6e73",
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid #146345" : "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid #e5e5ea" }}>
        <div style={{ display: "flex" }}>
          <button style={tabStyle(tab === "device")} onClick={() => setTab("device")}>设备品类</button>
          <button style={tabStyle(tab === "product")} onClick={() => setTab("product")}>商品品类</button>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(""); }}
          style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}
        >
          + 添加品类
        </button>
      </div>

      {tab === "device" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          {deviceCats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73", fontSize: 14 }}>暂无设备品类</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f7" }}>
                  {["品类名称", "英文名", "Slug", "品牌数", "维修项目数"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviceCats.map(c => (
                  <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{c.nameEn}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#aeaeb2", fontFamily: "monospace" }}>{c.slug}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{c._count.brands}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{c._count.repairTypes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "product" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          {productCats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73", fontSize: 14 }}>暂无商品品类</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f7" }}>
                  {["品类名称", "英文名", "Slug", "商品数", "操作"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productCats.map(c => (
                  <tr key={c.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{c.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{c.nameEn}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#aeaeb2", fontFamily: "monospace" }}>{c.slug}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6e6e73" }}>{c._count.products}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {c._count.products === 0 && (
                        <button
                          onClick={() => deleteProductCat(c.id)}
                          style={{ fontSize: 12, color: "#ff3b30", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          删除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showCreate && (
        <Modal
          title={tab === "device" ? "添加设备品类" : "添加商品品类"}
          onClose={() => setShowCreate(false)}
        >
          {tab === "device" ? (
            <>
              <FormField label="品类名称" required>
                <TextInput value={dcForm.name} onChange={v => setDcForm(p => ({ ...p, name: v }))} placeholder="例：手机" />
              </FormField>
              <FormField label="英文名称" required>
                <TextInput value={dcForm.nameEn} onChange={v => setDcForm(p => ({ ...p, nameEn: v }))} placeholder="Phone" />
              </FormField>
              <FormField label="Slug" required>
                <TextInput value={dcForm.slug} onChange={v => setDcForm(p => ({ ...p, slug: v }))} placeholder="phone" />
              </FormField>
              {error && <p style={{ color: "#ff3b30", fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}>取消</button>
                <button onClick={createDeviceCat} disabled={saving} style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "添加中…" : "添加"}
                </button>
              </div>
            </>
          ) : (
            <>
              <FormField label="品类名称" required>
                <TextInput value={pcForm.name} onChange={v => setPcForm(p => ({ ...p, name: v }))} placeholder="例：保护壳" />
              </FormField>
              <FormField label="英文名称" required>
                <TextInput value={pcForm.nameEn} onChange={v => setPcForm(p => ({ ...p, nameEn: v }))} placeholder="Phone Case" />
              </FormField>
              <FormField label="Slug" required>
                <TextInput value={pcForm.slug} onChange={v => setPcForm(p => ({ ...p, slug: v }))} placeholder="phone-case" />
              </FormField>
              {error && <p style={{ color: "#ff3b30", fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", background: "#f5f5f7", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", color: "#3c3c43" }}>取消</button>
                <button onClick={createProductCat} disabled={saving} style={{ padding: "9px 20px", background: "#146345", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "添加中…" : "添加"}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
