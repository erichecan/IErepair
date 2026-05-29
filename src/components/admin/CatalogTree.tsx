"use client";

import { useState } from "react";
import InlineEdit from "./InlineEdit";

export type RepairTypeOption = { id: number; name: string; nameEn: string };

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

const inputStyle: React.CSSProperties = {
  padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d1d6",
  fontSize: 13, outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
  border: "none", background: "#146345", color: "#fff", cursor: "pointer",
};

const btnCancel: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 8, fontSize: 13,
  border: "1px solid #d1d1d6", background: "#fff", color: "#6e6e73", cursor: "pointer",
};

export default function CatalogTree({
  initialBrands,
  categoryId: _categoryId,
  repairTypes,
}: {
  initialBrands: CatalogBrand[];
  categoryId: number;
  repairTypes: RepairTypeOption[];
}) {
  const [brands, setBrands] = useState<CatalogBrand[]>(initialBrands);
  const [expandedBrands, setExpandedBrands] = useState<Set<number>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<number>>(new Set());
  const [editCell, setEditCell] = useState<EditCell | null>(null);

  const [addingModel, setAddingModel] = useState<number | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [newModelYear, setNewModelYear] = useState("");
  const [addModelLoading, setAddModelLoading] = useState(false);
  const [addModelError, setAddModelError] = useState("");

  const [addingService, setAddingService] = useState<number | null>(null);
  const [newSvcTypeId, setNewSvcTypeId] = useState("");
  const [newSvcMin, setNewSvcMin] = useState("");
  const [newSvcMax, setNewSvcMax] = useState("");
  const [newSvcDur, setNewSvcDur] = useState("");
  const [addSvcLoading, setAddSvcLoading] = useState(false);
  const [addSvcError, setAddSvcError] = useState("");

  function toggleBrand(id: number) {
    setExpandedBrands(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
        if (addingModel === id) setAddingModel(null);
      } else {
        s.add(id);
      }
      return s;
    });
  }

  function toggleModel(id: number) {
    setExpandedModels(prev => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
        if (addingService === id) setAddingService(null);
      } else {
        s.add(id);
      }
      return s;
    });
  }

  function startEdit(key: string, value: string) { setEditCell({ key, value }); }
  function cancelEdit() { setEditCell(null); }

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
        ...b, models: b.models.map(m => m.id === id ? { ...m, name: value.trim() } : m),
      })));
      await fetch(`/api/admin/device-models/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
    } else if (kind === "model-year") {
      const year = value.trim() === "" ? null : parseInt(value);
      setBrands(prev => prev.map(b => ({
        ...b, models: b.models.map(m => m.id === id ? { ...m, year } : m),
      })));
      await fetch(`/api/admin/device-models/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });
    } else if (kind === "svc-min" || kind === "svc-max" || kind === "svc-dur") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return;
      const fieldMap: Record<"svc-min" | "svc-max" | "svc-dur", string> = {
        "svc-min": "basePriceMin", "svc-max": "basePriceMax", "svc-dur": "durationMinutes",
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
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: num }),
      });
    }
  }

  async function toggleModelActive(modelId: number, current: boolean) {
    setBrands(prev => prev.map(b => ({
      ...b, models: b.models.map(m => m.id === modelId ? { ...m, isActive: !current } : m),
    })));
    await fetch(`/api/admin/device-models/${modelId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
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
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
  }

  async function handleAddModel(brandId: number) {
    if (!newModelName.trim()) { setAddModelError("型号名称为必填项"); return; }
    setAddModelLoading(true); setAddModelError("");
    const res = await fetch("/api/admin/device-models", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        name: newModelName.trim(),
        year: newModelYear.trim() ? parseInt(newModelYear) : null,
      }),
    });
    const data = await res.json();
    setAddModelLoading(false);
    if (res.ok) {
      setBrands(prev => prev.map(b => b.id === brandId ? {
        ...b,
        models: [...b.models, {
          id: data.model.id, name: data.model.name,
          year: data.model.year, isActive: data.model.isActive ?? true,
          repairServices: [],
        }],
      } : b));
      setAddingModel(null); setNewModelName(""); setNewModelYear("");
    } else {
      setAddModelError(data.error || "创建失败");
    }
  }

  async function handleAddService(modelId: number) {
    if (!newSvcTypeId) { setAddSvcError("请选择维修类型"); return; }
    if (!newSvcMin || !newSvcMax || !newSvcDur) { setAddSvcError("价格和时长为必填项"); return; }
    setAddSvcLoading(true); setAddSvcError("");
    const res = await fetch("/api/admin/repair-services", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceModelId: modelId,
        repairTypeId: parseInt(newSvcTypeId),
        basePriceMin: parseFloat(newSvcMin),
        basePriceMax: parseFloat(newSvcMax),
        durationMinutes: parseInt(newSvcDur),
      }),
    });
    const data = await res.json();
    setAddSvcLoading(false);
    if (res.ok) {
      const rt = repairTypes.find(r => r.id === parseInt(newSvcTypeId));
      if (!rt) return;
      setBrands(prev => prev.map(b => ({
        ...b,
        models: b.models.map(m => m.id === modelId ? {
          ...m,
          repairServices: [...m.repairServices, {
            id: data.service.id,
            repairType: { name: rt.name, nameEn: rt.nameEn },
            basePriceMin: parseFloat(newSvcMin),
            basePriceMax: parseFloat(newSvcMax),
            durationMinutes: parseInt(newSvcDur),
            isActive: true,
          }],
        } : m),
      })));
      setAddingService(null);
      setNewSvcTypeId(""); setNewSvcMin(""); setNewSvcMax(""); setNewSvcDur("");
    } else {
      setAddSvcError(data.error || "创建失败");
    }
  }

  function openAddService(modelId: number) {
    setExpandedModels(prev => { const s = new Set(prev); s.add(modelId); return s; });
    setAddingService(prev => prev === modelId ? null : modelId);
  }

  async function handleDeleteBrand(brandId: number, brandName: string) {
    if (!confirm(`确认删除品牌"${brandName}"？该品牌必须没有任何型号才能删除。`)) return;
    const res = await fetch(`/api/admin/device-brands/${brandId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setBrands(prev => prev.filter(b => b.id !== brandId));
    } else {
      alert(data.error || "删除失败");
    }
  }

  async function handleDeleteModel(modelId: number, modelName: string) {
    if (!confirm(`确认删除型号"${modelName}"？该型号必须没有任何维修服务才能删除。`)) return;
    const res = await fetch(`/api/admin/device-models/${modelId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setBrands(prev => prev.map(b => ({ ...b, models: b.models.filter(m => m.id !== modelId) })));
    } else {
      alert(data.error || "删除失败");
    }
  }

  async function handleDeleteService(svcId: number, svcName: string) {
    if (!confirm(`确认删除"${svcName}"维修服务？`)) return;
    const res = await fetch(`/api/admin/repair-services/${svcId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setBrands(prev => prev.map(b => ({
        ...b,
        models: b.models.map(m => ({
          ...m,
          repairServices: m.repairServices.filter(s => s.id !== svcId),
        })),
      })));
    } else {
      alert(data.error || "删除失败");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {brands.map(brand => {
        const brandOpen = expandedBrands.has(brand.id);
        const totalServices = brand.models.reduce((s, m) => s + m.repairServices.length, 0);

        return (
          <div key={brand.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
            <div
              onClick={() => toggleBrand(brand.id)}
              style={{
                display: "flex", alignItems: "center", padding: "16px 20px", gap: 12,
                cursor: "pointer", background: brandOpen ? "#f4faf7" : "#fff",
                borderBottom: brandOpen ? "1px solid #e5e5ea" : "none", userSelect: "none",
              }}
              onMouseEnter={e => { if (!brandOpen) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!brandOpen) e.currentTarget.style.background = "#fff"; }}
            >
              <span style={{ fontSize: 11, color: "#aeaeb2", width: 14, flexShrink: 0 }}>
                {brandOpen ? "▼" : "▶"}
              </span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>{brand.name}</span>
              <span style={{ fontSize: 13, color: "#6e6e73" }}>{brand.models.length} 个型号</span>
              <span style={{ fontSize: 13, color: "#aeaeb2", margin: "0 2px" }}>·</span>
              <span style={{ fontSize: 13, color: "#6e6e73" }}>{totalServices} 项服务</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (!brandOpen) setExpandedBrands(prev => { const s = new Set(prev); s.add(brand.id); return s; });
                  setAddingModel(prev => prev === brand.id ? null : brand.id);
                }}
                style={{
                  padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                  border: "1px solid #146345", background: "transparent", color: "#146345",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                + 新增型号
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteBrand(brand.id, brand.name); }}
                title="删除品牌"
                style={{
                  width: 26, height: 26, borderRadius: "50%", border: "none",
                  background: "transparent", color: "#aeaeb2", cursor: "pointer",
                  fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ff3b30"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aeaeb2"; }}
              >
                ×
              </button>
            </div>

            {brandOpen && addingModel === brand.id && (
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e5ea", background: "#f9fcfa" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <input
                    autoFocus
                    value={newModelName}
                    onChange={e => { setNewModelName(e.target.value); setAddModelError(""); }}
                    placeholder="型号名称（如 iPhone 15 Pro）"
                    style={{ ...inputStyle, width: 220 }}
                  />
                  <input
                    value={newModelYear}
                    onChange={e => setNewModelYear(e.target.value)}
                    placeholder="年份（选填）"
                    type="number" min="2010" max="2030"
                    style={{ ...inputStyle, width: 110 }}
                  />
                  {addModelError && <span style={{ fontSize: 11, color: "#ff3b30" }}>{addModelError}</span>}
                  <button
                    onClick={() => handleAddModel(brand.id)}
                    disabled={addModelLoading}
                    style={{ ...btnPrimary, opacity: addModelLoading ? 0.6 : 1 }}
                  >
                    {addModelLoading ? "…" : "创建"}
                  </button>
                  <button
                    onClick={() => { setAddingModel(null); setNewModelName(""); setNewModelYear(""); setAddModelError(""); }}
                    style={btnCancel}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {brandOpen && brand.models.map((model, mIdx) => {
              const modelOpen = expandedModels.has(model.id);
              const isFirstRow = mIdx === 0 && addingModel !== brand.id;
              return (
                <div key={model.id} style={{ borderTop: isFirstRow ? "none" : "1px solid #f0f0f0" }}>
                  <div
                    style={{
                      display: "flex", alignItems: "center", padding: "12px 20px 12px 36px", gap: 10,
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
                          onCommit={commitEdit} onCancel={cancelEdit}
                          inputType="text" inputWidth={180}
                        />
                      </span>
                      <span style={{ fontSize: 12, color: "#c7c7cc" }}>
                        <InlineEdit
                          isEditing={editCell?.key === `model-year:${model.id}`}
                          displayText={model.year ? String(model.year) : "—"}
                          editValue={editCell?.key === `model-year:${model.id}` ? editCell.value : (model.year ? String(model.year) : "")}
                          onStartEdit={() => startEdit(`model-year:${model.id}`, model.year ? String(model.year) : "")}
                          onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                          onCommit={commitEdit} onCancel={cancelEdit}
                          inputType="number" inputWidth={68}
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

                    {repairTypes.length > 0 && (
                      <button
                        onClick={() => openAddService(model.id)}
                        style={{
                          padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                          border: "1px solid #d1d1d6", background: "transparent", color: "#6e6e73",
                          cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        + 服务
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModel(model.id, model.name)}
                      title="删除型号"
                      style={{
                        width: 22, height: 22, borderRadius: "50%", border: "none",
                        background: "transparent", color: "#aeaeb2", cursor: "pointer",
                        fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, padding: 0,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ff3b30"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aeaeb2"; }}
                    >
                      ×
                    </button>
                  </div>

                  {modelOpen && addingService === model.id && (
                    <div style={{ padding: "10px 20px 10px 36px", borderBottom: "1px solid #ebebeb", background: "#f4faf7" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <select
                          value={newSvcTypeId}
                          onChange={e => { setNewSvcTypeId(e.target.value); setAddSvcError(""); }}
                          style={{ ...inputStyle, background: "#fff" }}
                        >
                          <option value="">选择维修类型</option>
                          {repairTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name} / {rt.nameEn}</option>
                          ))}
                        </select>
                        <input
                          value={newSvcMin}
                          onChange={e => setNewSvcMin(e.target.value)}
                          placeholder="最低价 €"
                          type="number" step="0.01" min="0"
                          style={{ ...inputStyle, width: 90 }}
                        />
                        <input
                          value={newSvcMax}
                          onChange={e => setNewSvcMax(e.target.value)}
                          placeholder="最高价 €"
                          type="number" step="0.01" min="0"
                          style={{ ...inputStyle, width: 90 }}
                        />
                        <input
                          value={newSvcDur}
                          onChange={e => setNewSvcDur(e.target.value)}
                          placeholder="时长(分钟)"
                          type="number" min="1"
                          style={{ ...inputStyle, width: 90 }}
                        />
                        {addSvcError && <span style={{ fontSize: 11, color: "#ff3b30" }}>{addSvcError}</span>}
                        <button
                          onClick={() => handleAddService(model.id)}
                          disabled={addSvcLoading}
                          style={{ ...btnPrimary, opacity: addSvcLoading ? 0.6 : 1 }}
                        >
                          {addSvcLoading ? "…" : "添加"}
                        </button>
                        <button
                          onClick={() => {
                            setAddingService(null);
                            setNewSvcTypeId(""); setNewSvcMin(""); setNewSvcMax(""); setNewSvcDur("");
                            setAddSvcError("");
                          }}
                          style={btnCancel}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

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
                            <th style={{ padding: "8px 14px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.05em" }}>状态</th>
                            <th style={{ padding: "8px 14px" }} />
                          </tr>
                        </thead>
                        <tbody>
                          {model.repairServices.map(svc => (
                            <tr key={svc.id} style={{ borderTop: "1px solid #f0f0f0", background: svc.isActive ? "transparent" : "#fafafa" }}>
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
                                  onCommit={commitEdit} onCancel={cancelEdit} inputType="number" inputWidth={70}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <InlineEdit
                                  isEditing={editCell?.key === `svc-max:${svc.id}`}
                                  displayText={`€${svc.basePriceMax}`}
                                  editValue={editCell?.key === `svc-max:${svc.id}` ? editCell.value : String(svc.basePriceMax)}
                                  onStartEdit={() => startEdit(`svc-max:${svc.id}`, String(svc.basePriceMax))}
                                  onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                                  onCommit={commitEdit} onCancel={cancelEdit} inputType="number" inputWidth={70}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <InlineEdit
                                  isEditing={editCell?.key === `svc-dur:${svc.id}`}
                                  displayText={String(svc.durationMinutes)}
                                  editValue={editCell?.key === `svc-dur:${svc.id}` ? editCell.value : String(svc.durationMinutes)}
                                  onStartEdit={() => startEdit(`svc-dur:${svc.id}`, String(svc.durationMinutes))}
                                  onChange={v => setEditCell(prev => prev ? { ...prev, value: v } : null)}
                                  onCommit={commitEdit} onCancel={cancelEdit} inputType="number" inputWidth={60}
                                />
                              </td>
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
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
                              <td style={{ padding: "10px 14px", textAlign: "center" }}>
                                <button
                                  onClick={() => handleDeleteService(svc.id, svc.repairType.name)}
                                  title="删除服务"
                                  style={{
                                    width: 22, height: 22, borderRadius: "50%", border: "none",
                                    background: "transparent", color: "#aeaeb2", cursor: "pointer",
                                    fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto", padding: 0,
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ff3b30"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#aeaeb2"; }}
                                >
                                  ×
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
