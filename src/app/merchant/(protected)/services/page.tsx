"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface DeviceCategory { id: number; name: string; }
interface DeviceBrand { id: number; name: string; categoryId: number; }
interface DeviceModel { id: number; name: string; brandId: number; year: number | null; }

interface CatalogService {
  id: number;
  basePriceMin: number;
  basePriceMax: number;
  durationMinutes: number;
  repairType: { name: string };
  deviceModel: { id: number; name: string; brand: { id: number; name: string; category: { id: number; name: string } } };
  selected: boolean;
  myPrice: number | null;
}

interface MyService {
  id: number;
  price: number;
  isActive: boolean;
  repairServiceId: number;
  repairService: {
    basePriceMin: number;
    basePriceMax: number;
    repairType: { name: string };
    deviceModel: { name: string; brand: { name: string; category: { id: number; name: string } } };
  };
}

interface AddModal {
  open: boolean;
  selCat: number | null;
  selBrand: number | null;
  selModel: number | null;
  brands: DeviceBrand[];
  models: DeviceModel[];
  services: CatalogService[];
  servicesLoading: boolean;
  prices: Record<number, string>;
  adding: boolean;
  addingIds: Set<number>;
}

export default function MerchantServicesPage() {
  const [lang] = useLang("zh");
  const t = useMerchantT(lang);

  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  const [modal, setModal] = useState<AddModal>({
    open: false, selCat: null, selBrand: null, selModel: null,
    brands: [], models: [], services: [], servicesLoading: false,
    prices: {}, adding: false, addingIds: new Set(),
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/merchant/catalog/device-categories").then(r => r.json()),
      fetch("/api/merchant/services").then(r => r.json()),
    ]).then(([catData, svcData]) => {
      const cats: DeviceCategory[] = catData.categories ?? [];
      setCategories(cats);
      if (cats.length > 0) setActiveTab(cats[0].id);
      setMyServices(svcData.services ?? []);
    }).finally(() => setMyLoading(false));
  }, []);

  useEffect(() => {
    if (!modal.selCat) return;
    fetch(`/api/merchant/catalog/device-brands?categoryId=${modal.selCat}`)
      .then(r => r.json())
      .then(d => setModal(m => ({ ...m, brands: d.brands ?? [], selBrand: null, selModel: null, models: [], services: [] })));
  }, [modal.selCat]);

  useEffect(() => {
    if (!modal.selBrand) return;
    fetch(`/api/merchant/catalog/device-models?brandId=${modal.selBrand}`)
      .then(r => r.json())
      .then(d => setModal(m => ({ ...m, models: d.models ?? [], selModel: null, services: [] })));
  }, [modal.selBrand]);

  const loadModalServices = useCallback(() => {
    if (!modal.selCat && !modal.selBrand && !modal.selModel) return;
    const params = new URLSearchParams();
    if (modal.selModel) params.set("modelId", String(modal.selModel));
    else if (modal.selBrand) params.set("brandId", String(modal.selBrand));
    else if (modal.selCat) params.set("categoryId", String(modal.selCat));
    setModal(m => ({ ...m, servicesLoading: true }));
    fetch(`/api/merchant/catalog/services?${params}`)
      .then(r => r.json())
      .then(d => setModal(m => ({ ...m, services: d.services ?? [], servicesLoading: false })));
  }, [modal.selCat, modal.selBrand, modal.selModel]);

  useEffect(() => {
    if (modal.open) loadModalServices();
  }, [modal.selCat, modal.selBrand, modal.selModel, modal.open]);

  async function addServiceFromModal(serviceId: number) {
    const price = parseFloat(modal.prices[serviceId] ?? "");
    if (isNaN(price) || price <= 0) { alert(t.errorInvalidPrice); return; }
    setModal(m => ({ ...m, addingIds: new Set([...m.addingIds, serviceId]) }));
    try {
      const res = await fetch("/api/merchant/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repairServiceId: serviceId, price }),
      });
      if (res.ok) {
        const { service } = await res.json();
        setMyServices(prev => [service, ...prev]);
        setModal(m => {
          const newIds = new Set(m.addingIds);
          newIds.delete(serviceId);
          return {
            ...m, addingIds: newIds,
            services: m.services.map(s => s.id === serviceId ? { ...s, selected: true, myPrice: price } : s),
            prices: (() => { const p = { ...m.prices }; delete p[serviceId]; return p; })(),
          };
        });
      }
    } catch {
      setModal(m => { const newIds = new Set(m.addingIds); newIds.delete(serviceId); return { ...m, addingIds: newIds }; });
    }
  }

  async function toggleService(id: number, current: boolean) {
    const res = await fetch(`/api/merchant/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) setMyServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !current } : s));
  }

  async function removeService(id: number) {
    if (!confirm(t.serviceDeleteConfirm)) return;
    const res = await fetch(`/api/merchant/services/${id}`, { method: "DELETE" });
    if (res.ok) setMyServices(prev => prev.filter(s => s.id !== id));
  }

  const tabServices = activeTab
    ? myServices.filter(s => s.repairService.deviceModel.brand.category.id === activeTab)
    : myServices;

  const tableHeaders = [t.serviceTableDevice, t.serviceTableRepairType, t.serviceTableRefPrice, t.serviceTableMyPrice, t.serviceTableStatus, t.serviceTableActions];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>{t.servicesPageTitle}</h1>
          <p style={{ fontSize: 14, color: "#6e6e73" }}>{t.servicesPageDesc}</p>
        </div>
        <button
          onClick={() => setModal(m => ({ ...m, open: true, selCat: null, selBrand: null, selModel: null, brands: [], models: [], services: [], prices: {} }))}
          style={{ padding: "10px 20px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          {t.servicesAddBtn}
        </button>
      </div>

      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 4, background: "#f5f5f7", padding: 4, borderRadius: 24, width: "fit-content", marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab(null)}
            style={{ padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", background: activeTab === null ? "#146345" : "transparent", color: activeTab === null ? "#fff" : "#6e6e73" }}
          >
            {t.serviceAllTab}
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              style={{ padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", background: activeTab === c.id ? "#146345" : "transparent", color: activeTab === c.id ? "#fff" : "#6e6e73" }}
            >
              {c.name}
              {(() => {
                const cnt = myServices.filter(s => s.repairService.deviceModel.brand.category.id === c.id).length;
                return cnt > 0 ? <span style={{ marginLeft: 6, fontSize: 12, background: activeTab === c.id ? "rgba(255,255,255,0.3)" : "#e5e5ea", color: activeTab === c.id ? "#fff" : "#6e6e73", borderRadius: 10, padding: "1px 7px" }}>{cnt}</span> : null;
              })()}
            </button>
          ))}
        </div>
      )}

      {myLoading ? (
        <div style={{ color: "#6e6e73", fontSize: 14 }}>{t.loadingText}</div>
      ) : myServices.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔧</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1d1d1f", marginBottom: 8 }}>{t.servicesEmptyTitle}</div>
          <div style={{ fontSize: 14, color: "#6e6e73", marginBottom: 24 }}>{t.servicesEmptyDesc}</div>
          <button
            onClick={() => setModal(m => ({ ...m, open: true, selCat: null, selBrand: null, selModel: null, brands: [], models: [], services: [], prices: {} }))}
            style={{ padding: "10px 24px", background: "#146345", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            {t.servicesAddBtn}
          </button>
        </div>
      ) : tabServices.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "40px", textAlign: "center", color: "#6e6e73", fontSize: 14 }}>
          {t.servicesEmptyTabMsg}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5ea" }}>
                {tableHeaders.map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabServices.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f5" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.repairService.deviceModel.name}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73" }}>{s.repairService.deviceModel.brand.name} · {s.repairService.deviceModel.brand.category.name}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#1d1d1f" }}>{s.repairService.repairType.name}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6e6e73" }}>€{s.repairService.basePriceMin}–{s.repairService.basePriceMax}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#146345" }}>€{s.price.toFixed(2)}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: s.isActive ? "#e8f7f0" : "#f5f5f7", color: s.isActive ? "#146345" : "#6e6e73" }}>
                      {s.isActive ? t.serviceStatusActive : t.serviceStatusPaused}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleService(s.id, s.isActive)} style={{ padding: "4px 12px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>
                        {s.isActive ? t.serviceBtnPause : t.serviceBtnResume}
                      </button>
                      <button onClick={() => removeService(s.id)} style={{ padding: "4px 12px", border: "1px solid #ffccc7", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", color: "#c0392b" }}>
                        {t.serviceBtnRemove}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget) setModal(m => ({ ...m, open: false })); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px", width: 580, maxHeight: "85vh", overflow: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>{t.modalAddTitle}</h3>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", color: "#6e6e73", padding: "0 4px" }}>×</button>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <select
                value={modal.selCat ?? ""}
                onChange={e => setModal(m => ({ ...m, selCat: e.target.value ? parseInt(e.target.value) : null, selBrand: null, selModel: null, brands: [], models: [], services: [] }))}
                style={{ padding: "8px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}
              >
                <option value="">{t.modalSelectCat}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {modal.selCat && (
                <select
                  value={modal.selBrand ?? ""}
                  onChange={e => setModal(m => ({ ...m, selBrand: e.target.value ? parseInt(e.target.value) : null, selModel: null, models: [], services: [] }))}
                  style={{ padding: "8px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}
                >
                  <option value="">{t.modalSelectBrand}</option>
                  {modal.brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}

              {modal.selBrand && (
                <select
                  value={modal.selModel ?? ""}
                  onChange={e => setModal(m => ({ ...m, selModel: e.target.value ? parseInt(e.target.value) : null }))}
                  style={{ padding: "8px 12px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }}
                >
                  <option value="">{t.modalSelectAllModels}</option>
                  {modal.models.map(mo => <option key={mo.id} value={mo.id}>{mo.name}{mo.year ? ` (${mo.year})` : ""}</option>)}
                </select>
              )}
            </div>

            {!modal.selCat ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6e6e73", fontSize: 14 }}>{t.modalSelectCatFirst}</div>
            ) : modal.servicesLoading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6e6e73", fontSize: 14 }}>{t.loadingText}</div>
            ) : modal.services.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6e6e73", fontSize: 14 }}>{t.modalNoServices}</div>
            ) : (
              <div style={{ border: "1px solid #e5e5ea", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5ea" }}>
                      {[t.modalTableModel, t.modalTableRepairType, t.modalTableRefPrice, t.modalTableMyPrice, ""].map((h, i) => (
                        <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modal.services.map(s => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f5", opacity: s.selected ? 0.65 : 1 }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.deviceModel.name}</div>
                          <div style={{ fontSize: 11, color: "#6e6e73" }}>{s.deviceModel.brand.name}</div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{s.repairType.name}</td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "#6e6e73" }}>€{s.basePriceMin}–{s.basePriceMax}</td>
                        <td style={{ padding: "10px 12px" }}>
                          {s.selected ? (
                            <span style={{ fontSize: 12, color: "#146345" }}>€{s.myPrice?.toFixed(2)}</span>
                          ) : (
                            <input
                              type="number"
                              placeholder={t.modalPricePlaceholder}
                              value={modal.prices[s.id] ?? ""}
                              onChange={e => setModal(m => ({ ...m, prices: { ...m.prices, [s.id]: e.target.value } }))}
                              min={s.basePriceMin}
                              step="0.01"
                              style={{ width: 80, padding: "4px 8px", border: "1px solid #d1d1d6", borderRadius: 6, fontSize: 12 }}
                            />
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {s.selected ? (
                            <span style={{ padding: "3px 10px", background: "#e8f7f0", borderRadius: 6, fontSize: 11, color: "#146345", fontWeight: 500 }}>{t.serviceBtnAdded}</span>
                          ) : (
                            <button
                              onClick={() => addServiceFromModal(s.id)}
                              disabled={modal.addingIds.has(s.id)}
                              style={{ padding: "5px 12px", background: "#146345", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: modal.addingIds.has(s.id) ? "not-allowed" : "pointer", opacity: modal.addingIds.has(s.id) ? 0.7 : 1 }}
                            >
                              {modal.addingIds.has(s.id) ? t.serviceBtnAdding : t.serviceBtnAdd}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} style={{ padding: "10px 24px", border: "1px solid #d1d1d6", borderRadius: 8, background: "#fff", fontSize: 14, cursor: "pointer" }}>{t.modalClose}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
