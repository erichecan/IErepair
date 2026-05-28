"use client";

import { useState } from "react";
import InlineEdit from "./InlineEdit";

export type RepairService = {
  id: number;
  repairType: { name: string; nameEn: string };
  basePriceMin: number;
  basePriceMax: number;
  durationMinutes: number;
  isActive: boolean;
};

export type DeviceModel = {
  id: number;
  name: string;
  year: number | null;
  isActive: boolean;
  repairServices: RepairService[];
};

type EditCell = { key: string; value: string };

export default function ModelAccordion({ initialModels }: { initialModels: DeviceModel[] }) {
  const [models, setModels] = useState<DeviceModel[]>(initialModels);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [editCell, setEditCell] = useState<EditCell | null>(null);

  function toggleExpand(id: number) {
    setExpanded(prev => {
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
      setModels(prev => prev.map(m => m.id === id ? { ...m, name: value.trim() } : m));
      await fetch(`/api/admin/device-models/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: value.trim() }),
      });
    } else if (kind === "model-year") {
      const year = value.trim() === "" ? null : parseInt(value);
      setModels(prev => prev.map(m => m.id === id ? { ...m, year } : m));
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
      setModels(prev => prev.map(m => ({
        ...m,
        repairServices: m.repairServices.map(s => s.id === id ? { ...s, [field]: num } : s),
      })));
      await fetch(`/api/admin/repair-services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: num }),
      });
    }
  }

  async function toggleModelActive(modelId: number, current: boolean) {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, isActive: !current } : m));
    await fetch(`/api/admin/device-models/${modelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
  }

  async function toggleServiceActive(svcId: number, current: boolean) {
    setModels(prev => prev.map(m => ({
      ...m,
      repairServices: m.repairServices.map(s => s.id === svcId ? { ...s, isActive: !current } : s),
    })));
    await fetch(`/api/admin/repair-services/${svcId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
  }

  if (models.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "#6e6e73", fontSize: 14 }}>
        该品牌暂无设备型号
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {models.map(model => {
        const isOpen = expanded.has(model.id);
        return (
          <div key={model.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                gap: 12,
                background: isOpen ? "#f9fcfa" : "#fff",
                borderBottom: isOpen ? "1px solid #e5e5ea" : "none",
              }}
            >
              <button
                onClick={() => toggleExpand(model.id)}
                style={{
                  width: 22, height: 22, border: "none", background: "none", cursor: "pointer",
                  fontSize: 10, color: "#6e6e73", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, borderRadius: 4, transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f5")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {isOpen ? "▼" : "▶"}
              </button>

              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>
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
                <span style={{ fontSize: 12, color: "#aeaeb2" }}>
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
                onClick={() => toggleExpand(model.id)}
                style={{
                  fontSize: 12, color: "#6e6e73", cursor: "pointer",
                  padding: "3px 10px", borderRadius: 10, background: "#f5f5f7", flexShrink: 0,
                }}
              >
                {model.repairServices.length} 项服务
              </span>

              <button
                onClick={() => toggleModelActive(model.id, model.isActive)}
                style={{
                  padding: "4px 14px", borderRadius: 12, fontSize: 12, fontWeight: 500,
                  border: "none", cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                  background: model.isActive ? "#e6f7ee" : "#f5f5f7",
                  color: model.isActive ? "#146345" : "#6e6e73",
                }}
              >
                {model.isActive ? "已启用" : "已禁用"}
              </button>
            </div>

            {isOpen && (
              model.repairServices.length === 0 ? (
                <div style={{ padding: "20px 56px", fontSize: 13, color: "#aeaeb2" }}>暂无维修服务</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f5f5f7" }}>
                      <th style={{ padding: "9px 16px 9px 56px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>维修类型</th>
                      <th style={{ padding: "9px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>最低价 (€)</th>
                      <th style={{ padding: "9px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>最高价 (€)</th>
                      <th style={{ padding: "9px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>时长 (分钟)</th>
                      <th style={{ padding: "9px 20px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em" }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.repairServices.map(svc => (
                      <tr key={svc.id} style={{ borderTop: "1px solid #f0f0f0", background: svc.isActive ? "transparent" : "#fafafa" }}>
                        <td style={{ padding: "11px 16px 11px 56px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{svc.repairType.name}</div>
                          <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 1 }}>{svc.repairType.nameEn}</div>
                        </td>
                        <td style={{ padding: "11px 16px", textAlign: "center" }}>
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
                        <td style={{ padding: "11px 16px", textAlign: "center" }}>
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
                        <td style={{ padding: "11px 16px", textAlign: "center" }}>
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
                        <td style={{ padding: "11px 20px", textAlign: "center" }}>
                          <button
                            onClick={() => toggleServiceActive(svc.id, svc.isActive)}
                            style={{
                              padding: "3px 12px", borderRadius: 10, fontSize: 11, fontWeight: 500,
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
}
