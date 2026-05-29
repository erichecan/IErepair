"use client";

import { useState } from "react";

type RepairType = { id: number; name: string; nameEn: string };

export default function RepairTypeManager({
  categoryId,
  initialRepairTypes,
}: {
  categoryId: number;
  initialRepairTypes: RepairType[];
}) {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>(initialRepairTypes);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !nameEn.trim()) { setError("中文名和英文名均为必填项"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/admin/device-categories/${categoryId}/repair-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), nameEn: nameEn.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setRepairTypes(prev => [...prev, data.repairType]);
      setAdding(false); setName(""); setNameEn("");
    } else {
      setError(data.error || "创建失败");
    }
  }

  async function handleDelete(id: number, rtName: string) {
    if (!confirm(`确认删除维修类型"${rtName}"？`)) return;
    const res = await fetch(`/api/admin/repair-types/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setRepairTypes(prev => prev.filter(r => r.id !== id));
    } else {
      alert(data.error || "删除失败");
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <h2 style={{
          fontSize: 13, fontWeight: 600, color: "#aeaeb2",
          textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
        }}>
          维修类型
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            style={{
              fontSize: 12, color: "#146345", background: "transparent",
              border: "none", cursor: "pointer", fontWeight: 500,
            }}
          >
            + 新增类型
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {repairTypes.map(rt => (
          <div
            key={rt.id}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 8px 5px 12px", background: "#f5f5f7", borderRadius: 20,
            }}
          >
            <span style={{ fontSize: 13, color: "#1d1d1f" }}>{rt.name}</span>
            <span style={{ fontSize: 11, color: "#aeaeb2", marginLeft: 2 }}>{rt.nameEn}</span>
            <button
              onClick={() => handleDelete(rt.id, rt.name)}
              style={{
                width: 18, height: 18, borderRadius: "50%", border: "none",
                background: "transparent", color: "#aeaeb2", cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: 2, lineHeight: 1, padding: 0,
              }}
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
        {repairTypes.length === 0 && !adding && (
          <span style={{ fontSize: 12, color: "#aeaeb2" }}>暂无维修类型，点击右上角新增</span>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          style={{
            marginTop: 10, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
            padding: "10px 14px", background: "#f4faf7", borderRadius: 10,
            border: "1px solid #c3e8d5",
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            placeholder="中文名称（如 屏幕更换）"
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d1d6", fontSize: 13, width: 180 }}
          />
          <input
            value={nameEn}
            onChange={e => { setNameEn(e.target.value); setError(""); }}
            placeholder="英文名称（如 Screen Replacement）"
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d1d6", fontSize: 13, width: 220 }}
          />
          {error && <span style={{ fontSize: 11, color: "#ff3b30" }}>{error}</span>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: "none", background: "#146345", color: "#fff", cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "…" : "创建"}
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setName(""); setNameEn(""); setError(""); }}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 13,
              border: "1px solid #d1d1d6", background: "#fff", color: "#6e6e73", cursor: "pointer",
            }}
          >
            取消
          </button>
        </form>
      )}
    </div>
  );
}
