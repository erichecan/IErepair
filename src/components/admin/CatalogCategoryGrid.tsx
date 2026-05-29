"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InlineEdit from "./InlineEdit";

const CATEGORY_ICONS: Record<string, string> = {
  smartphone: "📱",
  tablet: "⬛",
  laptop: "💻",
  desktop: "🖥️",
  console: "🎮",
};

type EditCell = { key: string; value: string };

export type CategoryRow = {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  modelCount: number;
  brandCount: number;
  repairTypeCount: number;
};

export default function CatalogCategoryGrid({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [editCell, setEditCell] = useState<EditCell | null>(null);

  function startEdit(key: string, value: string) { setEditCell({ key, value }); }
  function cancelEdit() { setEditCell(null); }

  async function commitEdit() {
    if (!editCell) return;
    const { key, value } = editCell;
    setEditCell(null);
    if (!value.trim()) return;
    const colonIdx = key.indexOf(":");
    const kind = key.slice(0, colonIdx);
    const id = parseInt(key.slice(colonIdx + 1));
    const field = kind === "cat-name" ? "name" : "nameEn";
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value.trim() } : c));
    await fetch(`/api/admin/device-categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value.trim() }),
    });
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确认删除分类"${name}"？该分类必须没有任何品牌和维修类型才能删除。`)) return;
    const res = await fetch(`/api/admin/device-categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      alert(data.error || "删除失败");
    }
  }

  const totalModels = categories.reduce((s, c) => s + c.modelCount, 0);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>产品母库</h1>
        <p style={{ fontSize: 14, color: "#6e6e73", marginTop: 6 }}>
          共 {categories.length} 个设备类别 · {totalModels} 个设备型号
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => router.push(`/admin/repair-catalog/${cat.id}`)}
            style={{
              background: "#fff", borderRadius: 12, padding: 24,
              border: "1px solid #e5e5ea", cursor: "pointer",
              position: "relative", transition: "box-shadow 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <button
              onClick={e => { e.stopPropagation(); handleDelete(cat.id, cat.name); }}
              title="删除分类"
              style={{
                position: "absolute", top: 10, right: 10,
                width: 22, height: 22, borderRadius: "50%", border: "none",
                background: "transparent", color: "#aeaeb2", cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ff3b30"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aeaeb2"; }}
            >
              ×
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, background: "#f5f5f7", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>
                {CATEGORY_ICONS[cat.slug] ?? "📦"}
              </div>
              <div onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>
                  <InlineEdit
                    isEditing={editCell?.key === `cat-name:${cat.id}`}
                    displayText={cat.name}
                    editValue={editCell?.key === `cat-name:${cat.id}` ? editCell.value : cat.name}
                    onStartEdit={() => startEdit(`cat-name:${cat.id}`, cat.name)}
                    onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                    onCommit={commitEdit} onCancel={cancelEdit}
                    inputWidth={140}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#6e6e73" }}>
                  <InlineEdit
                    isEditing={editCell?.key === `cat-nameEn:${cat.id}`}
                    displayText={cat.nameEn}
                    editValue={editCell?.key === `cat-nameEn:${cat.id}` ? editCell.value : cat.nameEn}
                    onStartEdit={() => startEdit(`cat-nameEn:${cat.id}`, cat.nameEn)}
                    onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                    onCommit={commitEdit} onCancel={cancelEdit}
                    inputWidth={120}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent, #146345)" }}>{cat.brandCount}</div>
                <div style={{ fontSize: 12, color: "#6e6e73" }}>品牌</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f" }}>{cat.modelCount}</div>
                <div style={{ fontSize: 12, color: "#6e6e73" }}>型号</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f" }}>{cat.repairTypeCount}</div>
                <div style={{ fontSize: 12, color: "#6e6e73" }}>维修类型</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
