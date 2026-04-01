import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockCatalog = [
  { id: 1, sku: 'SCR-IP15P', name: 'iPhone 15 Pro Screen', base_cost: 45, enabled: true, my_price: 89 },
  { id: 2, sku: 'SCR-IP14', name: 'iPhone 14 Screen', base_cost: 35, enabled: true, my_price: 69 },
  { id: 3, sku: 'SCR-SS24', name: 'Samsung S24 Screen', base_cost: 40, enabled: true, my_price: 79 },
  { id: 4, sku: 'BAT-IP15', name: 'iPhone 15 Battery', base_cost: 22, enabled: true, my_price: 49 },
  { id: 5, sku: 'BAT-SS24', name: 'Samsung S24 Battery', base_cost: 20, enabled: false, my_price: 45 },
  { id: 6, sku: 'SCR-GP8', name: 'Google Pixel 8 Screen', base_cost: 38, enabled: false, my_price: 75 },
  { id: 7, sku: 'CHG-IP15', name: 'iPhone 15 Charging Port', base_cost: 18, enabled: true, my_price: 39 },
  { id: 8, sku: 'WTR-GEN', name: 'Water Damage Assessment', base_cost: 10, enabled: true, my_price: 30 },
];

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
  searchInput: {
    padding: '10px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)', background: 'var(--input-bg)',
    color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: 'inherit',
    outline: 'none', flex: 1, minWidth: 200,
  },
};

export default function Pricing() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await merchantAPI.get('/catalog/catalog');
        if (!cancelled) setCatalog(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setCatalog(mockCatalog);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = search
    ? catalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : catalog;

  function toggleEnabled(id) {
    setCatalog((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
  }

  function updatePrice(id, value) {
    setCatalog((prev) => prev.map((p) => p.id === id ? { ...p, my_price: value } : p));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await merchantAPI.post('/catalog/sync', { products: catalog });
      alert('Prices saved successfully!');
    } catch {
      alert('Save failed - demo mode. Changes are local only.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Quick Pricing</h2>

      <div style={s.topBar}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-ira-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading catalog...</div>
      ) : (
        <div className="pricing-table-container">
          <div className="table-header">
            <span>#</span>
            <span>Product Name</span>
            <span>Base Cost</span>
            <span>Status</span>
            <span>Your Price</span>
          </div>
          {filtered.map((p, i) => (
            <div className="table-row" key={p.id}>
              <span style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
              <span className="part-name">{p.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>&euro;{p.base_cost}</span>
              <span>
                <label className="ira-switch">
                  <input type="checkbox" checked={p.enabled} onChange={() => toggleEnabled(p.id)} />
                  <span className="ira-slider" />
                </label>
              </span>
              <span>
                <input
                  className="price-input"
                  type="number"
                  min="0"
                  step="1"
                  value={p.my_price}
                  onChange={(e) => updatePrice(p.id, Number(e.target.value))}
                  disabled={!p.enabled}
                  style={!p.enabled ? { opacity: 0.4 } : {}}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
