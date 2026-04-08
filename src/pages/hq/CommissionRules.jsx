import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockRules = [
  { id: '1', name: 'Global Default', rate: 10, scope_type: 'global', scope_value: null, start_date: null, end_date: null, priority: 0, is_active: true, created_at: '2025-06-01' },
  { id: '2', name: 'Dublin Summer Promo', rate: 5, scope_type: 'region', scope_value: 'Dublin', start_date: '2026-03-01', end_date: '2026-06-30', priority: 10, is_active: true, created_at: '2026-02-15' },
  { id: '3', name: 'New Shop Incentive - Galway Phone Clinic', rate: 0, scope_type: 'merchant', scope_value: 'Galway Phone Clinic', start_date: '2025-10-01', end_date: '2026-01-01', priority: 20, is_active: false, created_at: '2025-10-01' },
  { id: '4', name: 'Featured Shop Premium', rate: 15, scope_type: 'merchant', scope_value: "O'Neill's Repairs", start_date: '2026-01-01', end_date: null, priority: 5, is_active: true, created_at: '2025-12-20' },
];

const COUNTIES = ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kerry', 'Wexford', 'Donegal', 'Kildare', 'Meath', 'Wicklow', 'Tipperary', 'Clare', 'Kilkenny', 'Louth', 'Sligo', 'Mayo', 'Carlow', 'Cavan', 'Laois', 'Leitrim', 'Longford', 'Monaghan', 'Offaly', 'Roscommon', 'Westmeath'];

const SCOPE_MAP = {
  global:   { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   label: 'Global'   },
  region:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  label: 'Region'   },
  merchant: { color: '#d97706', bg: 'rgba(217,119,6,0.08)',   label: 'Merchant' },
};

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
  infoBox: {
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(37,99,235,0.05)',
    border: '1px solid rgba(37,99,235,0.12)',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginBottom: 20,
  },
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 80px 1.2fr 1.2fr 70px 80px 100px',
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
    gridTemplateColumns: '1.6fr 80px 1.2fr 1.2fr 70px 80px 100px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.1s',
  },
  ruleName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  rateCell: {
    fontSize: '0.875rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  dateCell: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  priorityCell: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'center',
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
    maxWidth: 520,
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
  rateSliderWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  rateValue: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
  },
  rateRange: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: 2,
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
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    justifyContent: 'flex-end',
  },
};

const emptyForm = { name: '', rate: 10, scope_type: 'global', scope_value: '', start_date: '', end_date: '', priority: 0, is_active: true };

function ScopeBadge({ type, value }) {
  const sc = SCOPE_MAP[type] || SCOPE_MAP.global;
  const display = type === 'global' ? 'Global' : `${type === 'region' ? 'Region' : 'Merchant'}: ${value}`;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 'var(--radius-full)', background: sc.bg, color: sc.color, fontSize: '0.72rem', fontWeight: 700 }}>
      {display}
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

export default function CommissionRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await hqAPI.get('/commission/rules');
        if (!cancelled) setRules(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setRules(mockRules);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => {
    setEditId(r.id);
    setForm({ ...r, start_date: r.start_date || '', end_date: r.end_date || '', scope_value: r.scope_value || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = { ...form, scope_value: form.scope_type === 'global' ? null : form.scope_value, start_date: form.start_date || null, end_date: form.end_date || null };
    if (editId) {
      try { await hqAPI.patch(`/commission/rules/${editId}`, payload); } catch { /* demo */ }
      setRules((prev) => prev.map((r) => r.id === editId ? { ...r, ...payload } : r));
    } else {
      const newRule = { ...payload, id: Date.now().toString(), created_at: new Date().toISOString().slice(0, 10) };
      try { await hqAPI.post('/commission/rules', payload); } catch { /* demo */ }
      setRules((prev) => [...prev, newRule]);
    }
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    try { await hqAPI.delete(`/commission/rules/${id}`); } catch { /* demo */ }
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const dateDisplay = (r) => {
    if (!r.start_date && !r.end_date) return 'Always';
    return `${r.start_date || '...'} → ${r.end_date || '...'}`;
  };

  const activeCount = rules.filter((r) => r.is_active).length;

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Commission Rules</div>
          <div style={s.subtitle}>{activeCount} active rule{activeCount !== 1 ? 's' : ''} · {rules.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Rule</button>
      </div>

      <div style={s.infoBox}>
        Resolution order: highest priority wins. If tied, specificity decides: merchant &gt; region &gt; global.
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading rules...</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>Rule Name</span>
            <span>Rate</span>
            <span>Scope</span>
            <span>Date Range</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {rules.map((r, idx) => (
            <div
              key={r.id}
              style={{ ...s.tableRow, borderBottom: idx < rules.length - 1 ? '1px solid var(--border-muted)' : 'none', opacity: r.is_active ? 1 : 0.55 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={s.ruleName}>{r.name}</span>
              <span style={s.rateCell}>{r.rate}%</span>
              <span><ScopeBadge type={r.scope_type} value={r.scope_value} /></span>
              <span style={s.dateCell}>{dateDisplay(r)}</span>
              <span style={s.priorityCell}>{r.priority}</span>
              <span><span className={`badge ${r.is_active ? 'badge-green' : 'badge-gray'}`}>{r.is_active ? 'Active' : 'Off'}</span></span>
              <div style={s.actionGroup}>
                <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(r)}>Edit</button>
                <button
                  style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                  onClick={() => handleDelete(r.id)}
                >Del</button>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No commission rules defined yet.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>{editId ? 'Edit Rule' : 'Add Commission Rule'}</div>

            <div style={s.formGrid}>
              <div style={s.fieldFull}>
                <label style={s.label}>Rule Name</label>
                <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dublin Summer Promo" />
              </div>

              <div style={{ ...s.field, ...s.fieldFull }}>
                <label style={s.label}>Commission Rate — <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{form.rate}%</span></label>
                <input
                  type="range" min="0" max="15" step="0.5"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                  style={{ accentColor: '#242424', width: '100%' }}
                />
                <div style={s.rateRange}><span>0%</span><span>15%</span></div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Priority</label>
                <input style={s.input} type="number" min="0" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
              </div>

              <div style={s.field}>
                <label style={s.label}>Scope Type</label>
                <select style={s.select} value={form.scope_type} onChange={(e) => setForm({ ...form, scope_type: e.target.value, scope_value: '' })}>
                  <option value="global">Global — all merchants</option>
                  <option value="region">Region — by county</option>
                  <option value="merchant">Merchant — specific shop</option>
                </select>
              </div>

              {form.scope_type === 'region' && (
                <div style={s.fieldFull}>
                  <label style={s.label}>County</label>
                  <select style={s.select} value={form.scope_value} onChange={(e) => setForm({ ...form, scope_value: e.target.value })}>
                    <option value="">Select county...</option>
                    {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {form.scope_type === 'merchant' && (
                <div style={s.fieldFull}>
                  <label style={s.label}>Merchant Name</label>
                  <input style={s.input} value={form.scope_value} onChange={(e) => setForm({ ...form, scope_value: e.target.value })} placeholder="e.g. O'Neill's Repairs" />
                </div>
              )}

              <div style={s.field}>
                <label style={s.label}>Start Date (optional)</label>
                <input style={s.input} type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.label}>End Date (optional)</label>
                <input style={s.input} type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>

              <div style={s.activeToggleRow}>
                <Toggle enabled={form.is_active} onChange={(val) => setForm({ ...form, is_active: val })} />
                <span style={s.toggleLabel}>Rule is active</span>
              </div>
            </div>

            <div style={s.modalActions}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Save Changes' : 'Create Rule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
