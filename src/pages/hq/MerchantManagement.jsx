import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockMerchants = [
  { id: '1', name: "O'Neill's Repairs", slug: 'oneills-dublin', email: 'info@oneills.ie', city: 'Dublin', county: 'Dublin', status: 'active', rating_avg: 4.8, rating_count: 312, created_at: '2025-06-15', phone: '01 234 5678', address: "12 O'Connell Street", active_products: 18, total_bookings: 856 },
  { id: '2', name: 'CorkFix Mobile', slug: 'corkfix-mobile', email: 'hello@corkfix.ie', city: 'Cork', county: 'Cork', status: 'active', rating_avg: 4.5, rating_count: 189, created_at: '2025-08-20', phone: '021 555 1234', address: '45 Patrick Street', active_products: 15, total_bookings: 423 },
  { id: '3', name: 'Galway Phone Clinic', slug: 'galway-phone-clinic', email: 'info@galwayphoneclinic.ie', city: 'Galway', county: 'Galway', status: 'active', rating_avg: 4.6, rating_count: 97, created_at: '2025-10-01', phone: '091 333 4567', address: '8 Shop Street', active_products: 12, total_bookings: 198 },
  { id: '4', name: 'Limerick Screen Fix', slug: 'limerick-screen-fix', email: 'contact@limerickscreenfix.ie', city: 'Limerick', county: 'Limerick', status: 'pending', rating_avg: 0, rating_count: 0, created_at: '2026-03-28', phone: '061 222 3456', address: '22 William Street', active_products: 0, total_bookings: 0 },
  { id: '5', name: 'Waterford Repairs', slug: 'waterford-repairs', email: 'info@waterfordrepairs.ie', city: 'Waterford', county: 'Waterford', status: 'suspended', rating_avg: 3.2, rating_count: 45, created_at: '2025-09-10', phone: '051 444 5678', address: '5 The Quay', active_products: 8, total_bookings: 112 },
];

const TABS = ['all', 'pending', 'active', 'suspended'];

const statusColors = {
  pending:   { bg: 'rgba(234,179,8,0.15)',  color: '#EAB308' },
  active:    { bg: 'rgba(0,208,132,0.15)',  color: '#00D084' },
  suspended: { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: (active) => ({
    padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
    border: active ? '1px solid var(--primary-green)' : '1px solid var(--border-muted)',
    background: active ? 'rgba(0,208,132,0.1)' : 'transparent',
    color: active ? 'var(--primary-green)' : 'var(--text-muted)',
  }),
  tableWrap: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 1.2fr 0.6fr 80px 90px 140px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 },
  tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 1.2fr 0.6fr 80px 90px 140px', padding: '14px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 },
  badge: (status) => {
    const c = statusColors[status] || statusColors.pending;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600 };
  },
  activateBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(0,208,132,0.15)', color: '#00D084', border: '1px solid rgba(0,208,132,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  suspendBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  detailBtn: { padding: '6px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg-sidebar)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 520 },
  modalTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: 20 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.9rem' },
  detailLabel: { color: 'var(--text-muted)' },
  ghostBtn: { padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  muted: { color: 'var(--text-muted)', fontSize: '0.82rem' },
};

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await hqAPI.get('/merchants');
        setMerchants(res.data?.data || res.data || []);
      } catch {
        setMerchants(mockMerchants);
      }
    };
    load();
  }, []);

  const filtered = activeTab === 'all' ? merchants : merchants.filter(m => m.status === activeTab);

  const handleActivate = async (id) => {
    try { await hqAPI.post(`/merchants/${id}/activate`); } catch { /* demo */ }
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: 'active' } : m));
  };

  const handleSuspend = async (id) => {
    try { await hqAPI.post(`/merchants/${id}/suspend`); } catch { /* demo */ }
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: 'suspended' } : m));
  };

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Merchant Management</h2>

      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'all' ? merchants.length : merchants.filter(m => m.status === t).length})
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span>Shop Name</span><span>City</span><span>County</span><span>Email</span>
          <span>Rating</span><span>Status</span><span>Joined</span><span>Actions</span>
        </div>
        {filtered.map(m => (
          <div key={m.id} style={s.tableRow}>
            <span style={{ fontWeight: 500 }}>{m.name}</span>
            <span>{m.city}</span>
            <span style={s.muted}>{m.county}</span>
            <span style={{ fontSize: '0.82rem' }}>{m.email}</span>
            <span>{m.rating_avg > 0 ? `${m.rating_avg} (${m.rating_count})` : '—'}</span>
            <span style={s.badge(m.status)}>{m.status}</span>
            <span style={s.muted}>{m.created_at?.slice(0, 10)}</span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={s.detailBtn} onClick={() => setDetail(m)}>Detail</button>
              {m.status === 'pending' && <button style={s.activateBtn} onClick={() => handleActivate(m.id)}>Activate</button>}
              {m.status === 'active' && <button style={s.suspendBtn} onClick={() => handleSuspend(m.id)}>Suspend</button>}
              {m.status === 'suspended' && <button style={s.activateBtn} onClick={() => handleActivate(m.id)}>Activate</button>}
            </span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No merchants found</div>}
      </div>

      {detail && (
        <div style={s.overlay} onClick={() => setDetail(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>{detail.name}</h3>
            <div style={s.detailRow}><span style={s.detailLabel}>Status</span><span style={s.badge(detail.status)}>{detail.status}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Address</span><span>{detail.address}, {detail.city}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>County</span><span>{detail.county}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Email</span><span>{detail.email}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Phone</span><span>{detail.phone}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Rating</span><span>{detail.rating_avg > 0 ? `${detail.rating_avg} / 5 (${detail.rating_count} reviews)` : 'No reviews yet'}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Active Products</span><span>{detail.active_products}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Total Bookings</span><span>{detail.total_bookings}</span></div>
            <div style={s.detailRow}><span style={s.detailLabel}>Joined</span><span>{detail.created_at?.slice(0, 10)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              {detail.status !== 'active' && <button style={s.activateBtn} onClick={() => { handleActivate(detail.id); setDetail({ ...detail, status: 'active' }); }}>Activate</button>}
              {detail.status === 'active' && <button style={s.suspendBtn} onClick={() => { handleSuspend(detail.id); setDetail({ ...detail, status: 'suspended' }); }}>Suspend</button>}
              <button style={s.ghostBtn} onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
