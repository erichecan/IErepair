"use client";

import { useState } from "react";
import InlineEdit from "./InlineEdit";

type CatalogService = {
  id: number;
  repairType: { name: string; nameEn: string };
  basePriceMin: number;
  basePriceMax: number;
  durationMinutes: number;
  isActive: boolean;
};

type CatalogModel = {
  id: number;
  name: string;
  year: number | null;
  isActive: boolean;
  repairServices: CatalogService[];
};

export type CatalogBrand = {
  id: number;
  name: string;
  models: CatalogModel[];
};

type EditCell = { key: string; value: string };

export default function CatalogTree({ initialBrands }: { initialBrands: CatalogBrand[] }) {
  const [brands, setBrands] = useState<CatalogBrand[]>(initialBrands);
  const [expandedBrands, setExpandedBrands] = useState<Set<number>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());
  const [editCell, setEditCell] = useState<EditCell | null>(null);

  function toggleBrand(id: number) {
    setExpandedBrands(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function toggleModel(id: number) {
    setExpandedModels(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function startEdit(key: string, value: string) {
    setEditCell({ key, value });
  }

  function cancelEdit() {
    setEditCell(null);
  }

  async function commitEdit() {
    if (!editCell) return;
    const { key, value } = editCell;
    setEditCell(null);

    const colonIdx = key.indexOf(":");
    const kind = key.slice(0, colonIdx);
    const id = parseInt(key.slice(colonIdx + 1));

    if (kind === "model-name") {
      if (!value.trim()) return;
      setBrands(prev => prev.map(b => ({
        ...b,
        models: b.models.map(m => m.id === id ? { ...m, name: value.trim() } : m),
      })));
      await fetch(`/api/admin/device-models/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
    } else if (kind === "model-year") {
      const year = value.trim() === "" ? null : parseInt(value);
      setBrands(prev => prev.map(b => ({
        ...b,
        models: b.models.map(m => m.id === id ? { ...m, year } : m),
      })));
      await fetch(`/api/admin/device-models/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });
    } else if (kind === "svc-min" || kind === "svc-max" || kind === "svc-dur") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return;
      const fieldMap: Record<"svc-min" | "svc-max" | "svc-dur", string> = {
        "svc-min": "basePriceMin",
        "svc-max": "basePriceMax",
        "svc-dur": "durationMinutes",
      };
      const field = fieldMap[kind];
      setBrands(prev => prev.map(b => ({
        ...b,
        models: b.models.map(m => ({
          ...m,
          repairServices: m.repairServices.map(s => s.id === id ? { ...s, [field]: num } : s),
        })),
      })));
      await fetch(`/api/admin/repair-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: num }),
      });
    }
  }

  async function toggleModelActive(modelId: number, current: boolean) {
    setBrands(prev => prev.map(b => ({
      ...b,
      models: b.models.map(m => m.id === modelId ? { ...m, isActive: !current } : m),
    })));
    await fetch(`/api/admin/device-models/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
  }

  async function toggleServiceActive(svcId: number, current: boolean) {
    setBrands(prev => prev.map(b => ({
      ...b,
      models: b.models.map(m => ({
        ...m,
        repairServices: m.repairServices.map(s => s.id === svcId ? { ...s, isActive: !current } : s),
      })),
    })));
    await fetch(`/api/admin/repair-services/${svcId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {brands.map(brand => {
        const brandOpen = expandedBrands.has(brand.id);
        const totalServices = brand.models.reduce((s, m) => s + m.repairServices.length, 0);

        return (
          <div key={brand.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>

            {/* ── Brand header ── */}
            <div
              onClick={() => toggleBrand(brand.id)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 20px",
                gap: 12,
                cursor: "pointer",
                background: brandOpen ? "#f4faf7" : "#fff",
                borderBottom: brandOpen ? "1px solid #e5e5ea" : "none",
                userSelect: "none",
              }}
              onMouseEnter={e => { if (!brandOpen) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!brandOpen) e.currentTarget.style.background = "#fff"; }}
            >
              <span style={{ fontSize: 11, color: "#aeaeb2", width: 14, flexShrink: 0 }}>
                {brandOpen ? "▼" : "▶"}
              </span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>
                {brand.name}
              </span>
              <span style={{ fontSize: 13, color: "#6e6e73" }}>
                {brand.models.length} 个型号
              </span>
              <span style={{ fontSize: 13, color: "#aeaeb2", margin: "0 2px" }}>·</span>
              <span style={{ fontSize: 13, color: "#6e6e73" }}>
                {totalServices} 项服务
              </span>
            </div>

            {/* ── Models list (brand expanded) ── */}
            {brandOpen && brand.models.map((model, mIdx) => {
              const modelOpen = expandedModels.has(model.id);
              return (
                <div key={model.id} style={{ borderTop: mIdx === 0 ? "none" : "1px solid #f0f0f0" }}>

                  {/* Model header row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 20px 12px 36px",
                      gap: 10,
                      background: modelOpen ? "#f9fcfa" : "transparent",
                      borderBottom: modelOpen ? "1px solid #ebebeb" : "none",
                    }}
                  >
                    <button
                      onClick={() => toggleModel(model.id)}
                      style={{
                        width: 20, height: 20, border: "none", background: "none",
                        cursor: "pointer", fontSize: 9, color: "#aeaeb2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, borderRadius: 4, transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f5")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {modelOpen ? "▼" : "▶"}
                    </button>

                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>
                        <InlineEdit
                          isEditing={editCell?.key === `model-name:${model.id}`}
                          displayText={model.name}
                          editValue={editCell?.key === `model-name:${model.id}` ? editCell.value : model.name}
                          onStartEdit={() => startEdit(`model-name:${model.id}`, model.name)}
                          onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                          onCommit={commitEdit}
                          onCancel={cancelEdit}
                          inputType="text"
                          inputWidth={180}
                        />
                      </span>
                      <span style={{ fontSize: 12, color: "#c7c7cc" }}>
                        <InlineEdit
                          isEditing={editCell?.key === `model-year:${model.id}`}
                          displayText={model.year ? String(model.year) : "—"}
                          editValue={editCell?.key === `model-year:${model.id}` ? editCell.value : (model.year ? String(model.year) : "")}
                          onStartEdit={() => startEdit(`model-year:${model.id}`, model.year ? String(model.year) : "")}
                          onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                          onCommit={commitEdit}
                          onCancel={cancelEdit}
                          inputType="number"
                          inputWidth={68}
                        />
                      </span>
                    </div>

                    <span
                      onClick={() => toggleModel(model.id)}
                      style={{
                        fontSize: 11, color: "#6e6e73", cursor: "pointer",
                        padding: "2px 8px", borderRadius: 8, background: "#f5f5f7", flexShrink: 0,
                      }}
                    >
                      {model.repairServices.length} 项
                    </span>

                    <button
                      onClick={() => toggleModelActive(model.id, model.isActive)}
                      style={{
                        padding: "3px 12px", borderRadius: 10, fontSize: 11, fontWeight: 500,
                        border: "none", cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                        background: model.isActive ? "#e6f7ee" : "#f5f5f7",
                        color: model.isActive ? "#146345" : "#6e6e73",
                      }}
                    >
                      {model.isActive ? "已启用" : "已禁用"}
                    </button>
                  </div>

                  {/* Services table (model expanded) */}
                  {modelOpen && (
                    model.repairServices.length === 0 ? (
                      <div style={{ padding: "14px 20px 14px 56px", fontSize: 12, color: "#aeaeb2" }}>
                        暂无维修服务
                      </div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f9f9fb" }}>
                            <th style={{ padding: "8px 14px 8px 56px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>维修类型</th>
                            <th style={{ padding: "8px 14px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>最低价 (€)</th>
                            <th style={{ padding: "8px 14px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>最高价 (€)</th>
                            <th style={{ padding: "8px 14px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>时长 (分钟)</th>
                            <th style={{ padding: "8px 20px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          {model.repairServices.map(svc => (
                            <tr
                              key={svc.id}
                              style={{
                                borderTop: "1px solid #f0f0f0",
                                background: svc.isActive ? "transparent" : "#fafafa",
                              }}
                            >
                              <td style={{ padding: "10px 14px 10px 56px" }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{svc.repairType.name}</div>
                                <div style={{ fontSize: 11, color: "#c7c7cc", marginTop: 1 }}>{svc.repairType.nameEn}</div>
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <InlineEdit
                                  isEditing={editCell?.key === `svc-min:${svc.id}`}
                                  displayText={`€${svc.basePriceMin}`}
                                  editValue={editCell?.key === `svc-min:${svc.id}` ? editCell.value : String(svc.basePriceMin)}
                                  onStartEdit={() => startEdit(`svc-min:${svc.id}`, String(svc.basePriceMin))}
                                  onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                                  onCommit={commitEdit} onCancel={cancelEdit}
                                  inputType="number" inputWidth={70}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <InlineEdit
                                  isEditing={editCell?.key === `svc-max:${svc.id}`}
                                  displayText={`€${svc.basePriceMax}`}
                                  editValue={editCell?.key === `svc-max:${svc.id}` ? editCell.value : String(svc.basePriceMax)}
                                  onStartEdit={() => startEdit(`svc-max:${svc.id}`, String(svc.basePriceMax))}
                                  onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                                  onCommit={commitEdit} onCancel={cancelEdit}
                                  inputType="number" inputWidth={70}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <InlineEdit
                                  isEditing={editCell?.key === `svc-dur:${svc.id}`}
                                  displayText={String(svc.durationMinutes)}
                                  editValue={editCell?.key === `svc-dur:${svc.id}` ? editCell.value : String(svc.durationMinutes)}
                                  onStartEdit={() => startEdit(`svc-dur:${svc.id}`, String(svc.durationMinutes))}
                                  onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                                  onCommit={commitEdit} onCancel={cancelEdit}
                                  inputType="number" inputWidth={60}
                                />
                              </td>
                              <td style={{ padding: "10px 20px", textAlign: "center" }}>
                                <button
                                  onClick={() => toggleServiceActive(svc.id, svc.isActive)}
                                  style={{
                                    padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                                    border: "none", cursor: "pointer", transition: "all 0.15s",
                                    background: svc.isActive ? "#e6f7ee" : "#f5f5f7",
                                    color: svc.isActive ? "#146345" : "#6e6e73",
                                  }}
                                >
                                  {svc.isActive ? "已启用" : "已禁用"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
