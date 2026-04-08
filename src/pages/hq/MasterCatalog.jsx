import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockProducts = [
  { id: '1', sku: 'APL-IP15P-SCR', name: 'iPhone 15 Pro Screen Replacement', device_name: 'iPhone 15 Pro', brand_name: 'Apple', category_name: 'Screen Replacement', base_cost: 285, suggested_price: 349, estimated_time: 45, warranty_days: 180, is_active: true },
  { id: '2', sku: 'APL-IP15P-BAT', name: 'iPhone 15 Pro Battery Replacement', device_name: 'iPhone 15 Pro', brand_name: 'Apple', category_name: 'Battery Replacement', base_cost: 45, suggested_price: 79, estimated_time: 30, warranty_days: 180, is_active: true },
  { id: '3', sku: 'APL-IP14-SCR', name: 'iPhone 14 Screen Replacement', device_name: 'iPhone 14', brand_name: 'Apple', category_name: 'Screen Replacement', base_cost: 220, suggested_price: 279, estimated_time: 40, warranty_days: 180, is_active: true },
  { id: '4', sku: 'SAM-S24U-SCR', name: 'Samsung S24 Ultra Screen', device_name: 'Samsung S24 Ultra', brand_name: 'Samsung', category_name: 'Screen Replacement', base_cost: 310, suggested_price: 389, estimated_time: 60, warranty_days: 180, is_active: true },
  { id: '5', sku: 'SAM-S24U-BAT', name: 'Samsung S24 Ultra Battery', device_name: 'Samsung S24 Ultra', brand_name: 'Samsung', category_name: 'Battery Replacement', base_cost: 40, suggested_price: 69, estimated_time: 30, warranty_days: 180, is_active: true },
  { id: '6', sku: 'GOO-PX8-SCR', name: 'Google Pixel 8 Screen', device_name: 'Google Pixel 8', brand_name: 'Google', category_name: 'Screen Replacement', base_cost: 190, suggested_price: 249, estimated_time: 45, warranty_days: 180, is_active: false },
  { id: '7', sku: 'APL-IP15P-CHG', name: 'iPhone 15 Pro Charging Port', device_name: 'iPhone 15 Pro', brand_name: 'Apple', category_name: 'Charging Port', base_cost: 55, suggested_price: 89, estimated_time: 35, warranty_days: 180, is_active: true },
  { id: '8', sku: 'SAM-S24U-BGL', name: 'Samsung S24 Ultra Back Glass', device_name: 'Samsung S24 Ultra', brand_name: 'Samsung', category_name: 'Back Glass', base_cost: 85, suggested_price: 129, estimated_time: 40, warranty_days: 180, is_active: true },
];

const mockBrands = ['Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'OnePlus'];
const mockCategories = ['Screen Replacement', 'Battery Replacement', 'Charging Port', 'Water Damage', 'Back Glass'];

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
    minWidth: 220,
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
    boxSizing: 'border-box',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '100px 2fr 1fr 1fr 90px 90px 80px 110px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    gap: 10,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '100px 2fr 1fr 1fr 90px 90px 80px 110px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
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
  productSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  categoryCell: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  priceCell: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  baseCostCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  actionGroup: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
    width: '100%',
    maxWidth: 560,
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-pop)',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    marginBottom: 20,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginBottom: 4,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fieldFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  input: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  select: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    justifyContent: 'flex-end',
  },
  activeToggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    gridColumn: '1 / -1',
    padding: '4px 0',
  },
  toggleLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-main)',
  },
};

const emptyForm = {
  sku: '', name: '', device_name: '', brand_name: 'Apple',
  category_name: 'Screen Replacement', base_cost: '', suggested_price: '',
  estimated_time: 45, warranty_days: 180, is_active: true,
};

function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? 'badge-green' : 'badge-gray'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: enabled ? '#16a34a' : 'var(--border-muted)',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
      onClick={() => onChange(!enabled)}
    >
      <div style={{
        position: 'absolute', top: 2, left: enabled ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function MasterCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await hqAPI.get('/catalog');
        if (!cancelled) setProducts(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setProducts(mockProducts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = products.filter((p) => p.is_active).length;

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ ...p }); setShowModal(true); };

  const handleSave = async () => {
    if (editId) {
      try { await hqAPI.patch(`/catalog/${editId}`, form); } catch { /* demo */ }
      setProducts((prev) => prev.map((p) => p.id === editId ? { ...p, ...form } : p));
    } else {
      const newProduct = { ...form, id: Date.now().toString() };
      try { await hqAPI.post('/catalog', form); } catch { /* demo */ }
      setProducts((prev) => [...prev, newProduct]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try { await hqAPI.delete(`/catalog/${id}`); } catch { /* demo */ }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleActive = async (id) => {
    const product = products.find((p) => p.id === id);
    const updated = { ...product, is_active: !product.is_active };
    try { await hqAPI.patch(`/catalog/${id}`, { is_active: updated.is_active }); } catch { /* demo */ }
    setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
  };

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Master Catalog</div>
          <div style={s.subtitle}>{activeCount} of {products.length} services active</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Service</button>
      </div>

      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search by name, SKU, or brand..."
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
            <span>Category</span>
            <span>Device</span>
            <span>Base Cost</span>
            <span>Sugg. Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              style={{ ...s.tableRow, borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-muted)' : 'none', opacity: p.is_active ? 1 : 0.55 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={s.sku}>{p.sku}</span>
              <div>
                <div style={s.productName}>{p.name}</div>
                <div style={s.productSub}>{p.brand_name} · {p.estimated_time}min · {p.warranty_days}d warranty</div>
              </div>
              <span style={s.categoryCell}>{p.category_name}</span>
              <span style={s.categoryCell}>{p.device_name}</span>
              <span style={s.baseCostCell}>€{p.base_cost}</span>
              <span style={s.priceCell}>€{p.suggested_price}</span>
              <span><StatusBadge active={p.is_active} /></span>
              <div style={s.actionGroup}>
                <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(p)}>Edit</button>
                <button
                  style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                  onClick={() => handleDelete(p.id)}
                >Del</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No services match your search.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>{editId ? 'Edit Service' : 'Add New Service'}</div>
            <div style={s.formGrid}>
              <div style={s.fieldFull}>
                <label style={s.label}>Service Name</label>
                <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. iPhone 15 Pro Screen Replacement" />
              </div>
              <div style={s.field}>
                <label style={s.label}>SKU</label>
                <input style={s.input} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="APL-IP15P-SCR" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Device Name</label>
                <input style={s.input} value={form.device_name} onChange={(e) => setForm({ ...form, device_name: e.target.value })} placeholder="iPhone 15 Pro" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Brand</label>
                <select style={s.select} value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })}>
                  {mockBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <select style={s.select} value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })}>
                  {mockCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Base Cost (€)</label>
                <input style={s.input} type="number" min="0" value={form.base_cost} onChange={(e) => setForm({ ...form, base_cost: Number(e.target.value) })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Suggested Price (€)</label>
                <input style={s.input} type="number" min="0" value={form.suggested_price} onChange={(e) => setForm({ ...form, suggested_price: Number(e.target.value) })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Est. Time (min)</label>
                <input style={s.input} type="number" min="5" value={form.estimated_time} onChange={(e) => setForm({ ...form, estimated_time: Number(e.target.value) })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Warranty (days)</label>
                <input style={s.input} type="number" min="0" value={form.warranty_days} onChange={(e) => setForm({ ...form, warranty_days: Number(e.target.value) })} />
              </div>
              <div style={s.activeToggleRow}>
                <Toggle enabled={form.is_active} onChange={(val) => setForm({ ...form, is_active: val })} />
                <span style={s.toggleLabel}>Active — visible to merchants</span>
              </div>
            </div>
            <div style={s.modalActions}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Save Changes' : 'Create Service'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
