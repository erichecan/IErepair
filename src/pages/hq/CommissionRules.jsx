import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockRules = [
  { id: '1', name: 'Global Default', rate: 10, scope_type: 'global', scope_value: null, start_date: null, end_date: null, priority: 0, is_active: true, created_at: '2025-06-01' },
  { id: '2', name: 'Dublin Summer Promo', rate: 5, scope_type: 'region', scope_value: 'Dublin', start_date: '2026-03-01', end_date: '2026-06-30', priority: 10, is_active: true, created_at: '2026-02-15' },
  { id: '3', name: 'New Shop Incentive - Galway Phone Clinic', rate: 0, scope_type: 'merchant', scope_value: 'Galway Phone Clinic', start_date: '2025-10-01', end_date: '2026-01-01', priority: 20, is_active: false, created_at: '2025-10-01' },
  { id: '4', name: 'Featured Shop Premium', rate: 15, scope_type: 'merchant', scope_value: "O'Neill's Repairs", start_date: '2026-01-01', end_date: null, priority: 5, is_active: true, created_at: '2025-12-20' },
];

const COUNTIES = ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kerry', 'Wexford', 'Donegal', 'Kildare', 'Meath', 'Wicklow', 'Tipperary', 'Clare', 'Kilkenny', 'Louth', 'Sligo', 'Mayo', 'Carlow', 'Cavan', 'Laois', 'Leitrim', 'Longford', 'Monaghan', 'Offaly', 'Roscommon', 'Westmeath'];

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  primaryBtn: { background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem' },
  ghostBtn: { padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  editBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  dangerBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  tableWrap: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 70px 1.2fr 1.2fr 70px 70px 110px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 },
  tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 70px 1.2fr 1.2fr 70px 70px 110px', padding: '14px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 },
  activeBadge: (active) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: active ? 'rgba(0,208,132,0.15)' : 'rgba(107,114,128,0.15)', color: active ? '#00D084' : '#6B7280', fontSize: '0.75rem', fontWeight: 600 }),
  scopeBadge: (type) => {
    const colors = { global: '#3B82F6', region: '#8B5CF6', merchant: '#F59E0B' };
    const c = colors[type] || '#6B7280';
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: `${c}22`, color: c, fontSize: '0.75rem', fontWeight: 600 };
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg-sidebar)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 520 },
  modalTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 },
  input: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' },
  select: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  rateDisplay: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1rem' },
  muted: { color: 'var(--text-muted)', fontSize: '0.82rem' },
  infoBox: { padding: 14, borderRadius: 'var(--radius-sm)', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 },
};

const emptyForm = { name: '', rate: 10, scope_type: 'global', scope_value: '', start_date: '', end_date: '', priority: 0, is_active: true };

export default function CommissionRules() {
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await hqAPI.get('/commission/rules');
        setRules(res.data?.data || res.data || []);
      } catch {
        setRules(mockRules);
      }
    };
    load();
  }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => { setEditId(r.id); setForm({ ...r, start_date: r.start_date || '', end_date: r.end_date || '', scope_value: r.scope_value || '' }); setShowModal(true); };

  const handleSave = async () => {
    const payload = { ...form, scope_value: form.scope_type === 'global' ? null : form.scope_value, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editId) {
      try { await hqAPI.patch(`/commission/rules/${editId}`, payload); } catch { /* demo */ }
      setRules(prev => prev.map(r => r.id === editId ? { ...r, ...payload } : r));
    } else {
      const newRule = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString().slice(0, 10) };
      try { await hqAPI.post('/commission/rules', payload); } catch { /* demo */ }
      setRules(prev => [...prev, newRule]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try { await hqAPI.delete(`/commission/rules/${id}`); } catch { /* demo */ }
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const scopeDisplay = (r) => {
    if (r.scope_type === 'global') return 'Global';
    return `${r.scope_type === 'region' ? 'Region' : 'Merchant'}: ${r.scope_value}`;
  };

  const dateDisplay = (r) => {
    if (!r.start_date && !r.end_date) return 'Always';
    return `${r.start_date || '...'} to ${r.end_date || '...'}`;
  };

  return (
    <div className="animate-up">
      <div style={s.topBar}>
        <h2 style={s.heading}>Commission Rules</h2>
        <button style={s.primaryBtn} onClick={openAdd}>+ Add Rule</button>
      </div>

      <div style={s.infoBox}>
        Resolution: highest priority wins. If tied, specificity decides: merchant &gt; region &gt; global.
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span>Rule Name</span><span>Rate</span><span>Scope</span>
          <span>Date Range</span><span>Priority</span><span>Status</span><span>Actions</span>
        </div>
        {rules.map(r => (
          <div key={r.id} style={s.tableRow}>
            <span style={{ fontWeight: 500 }}>{r.name}</span>
            <span style={s.rateDisplay}>{r.rate}%</span>
            <span style={s.scopeBadge(r.scope_type)}>{scopeDisplay(r)}</span>
            <span style={s.muted}>{dateDisplay(r)}</span>
            <span style={{ textAlign: 'center', fontWeight: 600 }}>{r.priority}</span>
            <span style={s.activeBadge(r.is_active)}>{r.is_active ? 'Active' : 'Off'}</span>
            <span style={{ display: 'flex', gap: 6 }}>
              <button style={s.editBtn} onClick={() => openEdit(r)}>Edit</button>
              <button style={s.dangerBtn} onClick={() => handleDelete(r.id)}>Delete</button>
            </span>
          </div>
        ))}
        {rules.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No commission rules defined</div>}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{editId ? 'Edit Rule' : 'Add New Rule'}</h3>
            <div style={s.formGrid}>
              <div style={s.fieldFull}>
                <label style={s.label}>Rule Name</label>
                <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dublin Summer Promo" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Rate (%): {form.rate}%</label>
                <input type="range" min="0" max="15" step="0.5" value={form.rate} onChange={e => setForm({ ...form, rate: Number(e.target.value) })} style={{ accentColor: 'var(--primary-green)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}><span>0%</span><span>15%</span></div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Priority</label>
                <input style={s.input} type="number" min="0" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
              </div>
              <div style={s.fieldFull}>
                <label style={s.label}>Scope Type</label>
                <select style={s.select} value={form.scope_type} onChange={e => setForm({ ...form, scope_type: e.target.value, scope_value: '' })}>
                  <option value="global">Global (all merchants)</option>
                  <option value="region">Region (by county)</option>
                  <option value="merchant">Merchant (specific shop)</option>
                </select>
              </div>
              {form.scope_type === 'region' && (
                <div style={s.fieldFull}>
                  <label style={s.label}>County</label>
                  <select style={s.select} value={form.scope_value} onChange={e => setForm({ ...form, scope_value: e.target.value })}>
                    <option value="">Select county...</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {form.scope_type === 'merchant' && (
                <div style={s.fieldFull}>
                  <label style={s.label}>Merchant Name</label>
                  <input style={s.input} value={form.scope_value} onChange={e => setForm({ ...form, scope_value: e.target.value })} placeholder="Search merchant..." />
                </div>
              )}
              <div style={s.field}>
                <label style={s.label}>Start Date (optional)</label>
                <input style={s.input} type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>End Date (optional)</label>
                <input style={s.input} type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active
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
