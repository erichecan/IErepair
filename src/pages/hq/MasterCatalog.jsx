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
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  searchRow: { display: 'flex', gap: 12, alignItems: 'center' },
  searchInput: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '9px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', width: 260 },
  primaryBtn: { background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem' },
  ghostBtn: { padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  dangerBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  editBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  tableWrap: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 90px 90px 70px 120px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 },
  tableRow: { display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 90px 90px 70px 120px', padding: '12px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 },
  activeBadge: (active) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: active ? 'rgba(0,208,132,0.15)' : 'rgba(107,114,128,0.15)', color: active ? '#00D084' : '#6B7280', fontSize: '0.75rem', fontWeight: 600 }),
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg-sidebar)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 },
  input: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' },
  select: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  muted: { color: 'var(--text-muted)', fontSize: '0.82rem' },
};

const emptyForm = { sku: '', name: '', device_name: '', brand_name: 'Apple', category_name: 'Screen Replacement', base_cost: '', suggested_price: '', estimated_time: 45, warranty_days: 180, is_active: true };

export default function MasterCatalog() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await hqAPI.get('/catalog');
        setProducts(res.data?.data || res.data || []);
      } catch {
        setProducts(mockProducts);
      }
    };
    load();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand_name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ ...p, base_cost: p.base_cost, suggested_price: p.suggested_price }); setShowModal(true); };

  const handleSave = async () => {
    if (editId) {
      try { await hqAPI.patch(`/catalog/${editId}`, form); } catch { /* demo */ }
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
    } else {
      const newProduct = { ...form, id: Date.now().toString() };
      try { await hqAPI.post('/catalog', form); } catch { /* demo */ }
      setProducts(prev => [...prev, newProduct]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try { await hqAPI.delete(`/catalog/${id}`); } catch { /* demo */ }
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="animate-up">
      <div style={s.topBar}>
        <h2 style={s.heading}>Master Product Catalog</h2>
        <div style={s.searchRow}>
          <input style={s.searchInput} placeholder="Search by name, SKU, brand..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.primaryBtn} onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span>SKU</span><span>Product Name</span><span>Device</span><span>Category</span>
          <span>Base Cost</span><span>Sugg. Price</span><span>Status</span><span>Actions</span>
        </div>
        {filtered.map(p => (
          <div key={p.id} style={s.tableRow}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{p.sku}</span>
            <span style={{ fontWeight: 500 }}>{p.name}</span>
            <span style={s.muted}>{p.device_name}</span>
            <span style={s.muted}>{p.category_name}</span>
            <span>&euro;{Number(p.base_cost).toFixed(2)}</span>
            <span>&euro;{Number(p.suggested_price).toFixed(2)}</span>
            <span style={s.activeBadge(p.is_active)}>{p.is_active ? 'Active' : 'Off'}</span>
            <span style={{ display: 'flex', gap: 6 }}>
              <button style={s.editBtn} onClick={() => openEdit(p)}>Edit</button>
              <button style={s.dangerBtn} onClick={() => handleDelete(p.id)}>Delete</button>
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No products found</div>}
      </div>

      <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtered.length} products</div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Brand</label>
                <select style={s.select} value={form.brand_name} onChange={e => updateForm('brand_name', e.target.value)}>
                  {mockBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <select style={s.select} value={form.category_name} onChange={e => updateForm('category_name', e.target.value)}>
                  {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Device Name</label>
                <input style={s.input} value={form.device_name} onChange={e => updateForm('device_name', e.target.value)} placeholder="iPhone 15 Pro" />
              </div>
              <div style={s.field}>
                <label style={s.label}>SKU</label>
                <input style={s.input} value={form.sku} onChange={e => updateForm('sku', e.target.value)} placeholder="APL-IP15P-SCR" />
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Product Name</label>
                <input style={s.input} value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="iPhone 15 Pro Screen Replacement" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Base Cost (&euro;)</label>
                <input style={s.input} type="number" step="0.01" value={form.base_cost} onChange={e => updateForm('base_cost', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Suggested Price (&euro;)</label>
                <input style={s.input} type="number" step="0.01" value={form.suggested_price} onChange={e => updateForm('suggested_price', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Estimated Time (min)</label>
                <input style={s.input} type="number" value={form.estimated_time} onChange={e => updateForm('estimated_time', Number(e.target.value))} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Warranty Days</label>
                <input style={s.input} type="number" value={form.warranty_days} onChange={e => updateForm('warranty_days', Number(e.target.value))} />
              </div>
              <div style={s.field}>
                <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => updateForm('is_active', e.target.checked)} /> Active
                </label>
              </div>
            </div>
            <div style={s.modalActions}>
              <button style={s.ghostBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={s.primaryBtn} onClick={handleSave}>{editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
