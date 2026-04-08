import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockCatalog = [
  { id: 1, sku: 'SCR-IP15P', name: 'iPhone 15 Pro Screen',    base_cost: 45, enabled: true,  my_price: 89 },
  { id: 2, sku: 'SCR-IP14',  name: 'iPhone 14 Screen',         base_cost: 35, enabled: true,  my_price: 69 },
  { id: 3, sku: 'SCR-SS24',  name: 'Samsung S24 Screen',       base_cost: 40, enabled: true,  my_price: 79 },
  { id: 4, sku: 'BAT-IP15',  name: 'iPhone 15 Battery',        base_cost: 22, enabled: true,  my_price: 49 },
  { id: 5, sku: 'BAT-SS24',  name: 'Samsung S24 Battery',      base_cost: 20, enabled: false, my_price: 45 },
  { id: 6, sku: 'SCR-GP8',   name: 'Google Pixel 8 Screen',    base_cost: 38, enabled: false, my_price: 75 },
  { id: 7, sku: 'CHG-IP15',  name: 'iPhone 15 Charging Port',  base_cost: 18, enabled: true,  my_price: 39 },
  { id: 8, sku: 'WTR-GEN',   name: 'Water Damage Assessment',  base_cost: 10, enabled: true,  my_price: 30 },
];

const s = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: 200,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 14px 9px 34px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr 90px 80px 130px 80px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    gap: 12,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '90px 1fr 90px 80px 130px 80px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 12,
    transition: 'background 0.1s',
  },
  sku: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  productName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  baseCost: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  toggle: (enabled) => ({
    width: 36,
    height: 20,
    borderRadius: 10,
    background: enabled ? '#16a34a' : 'var(--border-muted)',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
  }),
  toggleKnob: (enabled) => ({
    position: 'absolute',
    top: 2,
    left: enabled ? 18 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  }),
  priceInput: (enabled) => ({
    width: '100%',
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    background: enabled ? 'var(--input-bg)' : 'transparent',
    color: enabled ? 'var(--text-main)' : 'var(--text-muted)',
    fontSize: '0.875rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    outline: 'none',
    opacity: enabled ? 1 : 0.4,
  }),
  margin: (base, price, enabled) => {
    if (!enabled || !price || !base) return null;
    const pct = Math.round(((price - base) / base) * 100);
    return {
      text: `${pct > 0 ? '+' : ''}${pct}%`,
      color: pct >= 50 ? '#16a34a' : pct >= 20 ? '#d97706' : '#dc2626',
    };
  },
};

export default function Pricing() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    ? catalog.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    : catalog;

  const enabledCount = catalog.filter((p) => p.enabled).length;

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
    } catch { /* demo mode */ }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Pricing</div>
          <div style={s.subtitle}>{enabledCount} of {catalog.length} services enabled</div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading catalog...</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>SKU</span>
            <span>Service</span>
            <span>Base Cost</span>
            <span>Enabled</span>
            <span>Your Price</span>
            <span>Margin</span>
          </div>
          {filtered.map((p, idx) => {
            const m = s.margin(p.base_cost, p.my_price, p.enabled);
            return (
              <div
                key={p.id}
                style={{ ...s.tableRow, borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-muted)' : 'none', opacity: p.enabled ? 1 : 0.6 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={s.sku}>{p.sku}</span>
                <span style={s.productName}>{p.name}</span>
                <span style={s.baseCost}>€{p.base_cost}</span>
                <div>
                  <button
                    style={s.toggle(p.enabled)}
                    onClick={() => toggleEnabled(p.id)}
                    title={p.enabled ? 'Disable' : 'Enable'}
                  >
                    <div style={s.toggleKnob(p.enabled)} />
                  </button>
                </div>
                <div>
                  <input
                    style={s.priceInput(p.enabled)}
                    type="number"
                    min="0"
                    step="1"
                    value={p.my_price}
                    onChange={(e) => updatePrice(p.id, Number(e.target.value))}
                    disabled={!p.enabled}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: m ? m.color : 'var(--text-muted)' }}>
                  {m ? m.text : '—'}
                </span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No services match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
