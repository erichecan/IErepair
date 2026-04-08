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

const STATUS_MAP = {
  pending:   { cls: 'badge-yellow', label: 'Pending'   },
  active:    { cls: 'badge-green',  label: 'Active'    },
  suspended: { cls: 'badge-red',    label: 'Suspended' },
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
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 0.8fr 0.8fr 1fr 70px 80px 90px 130px',
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
    gridTemplateColumns: '1.6fr 0.8fr 0.8fr 1fr 70px 80px 90px 130px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.1s',
  },
  merchantName: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  merchantSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  locationCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  ratingCell: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  numCell: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  actionGroup: {
    display: 'flex',
    gap: 5,
    alignItems: 'center',
    flexWrap: 'wrap',
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
    maxWidth: 500,
    boxShadow: 'var(--shadow-pop)',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    marginBottom: 20,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-muted)',
    gap: 12,
  },
  detailRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    gap: 12,
  },
  detailLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  detailValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'right',
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
};

const tabCounts = (merchants) => ({
  all: merchants.length,
  pending: merchants.filter((m) => m.status === 'pending').length,
  active: merchants.filter((m) => m.status === 'active').length,
  suspended: merchants.filter((m) => m.status === 'suspended').length,
});

export default function MerchantManagement() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await hqAPI.get('/merchants');
        if (!cancelled) setMerchants(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setMerchants(mockMerchants);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = activeTab === 'all' ? merchants : merchants.filter((m) => m.status === activeTab);
  const counts = tabCounts(merchants);

  const handleActivate = async (id) => {
    try { await hqAPI.post(`/merchants/${id}/activate`); } catch { /* demo */ }
    setMerchants((prev) => prev.map((m) => m.id === id ? { ...m, status: 'active' } : m));
    if (detail?.id === id) setDetail((d) => ({ ...d, status: 'active' }));
  };

  const handleSuspend = async (id) => {
    try { await hqAPI.post(`/merchants/${id}/suspend`); } catch { /* demo */ }
    setMerchants((prev) => prev.map((m) => m.id === id ? { ...m, status: 'suspended' } : m));
    if (detail?.id === id) setDetail((d) => ({ ...d, status: 'suspended' }));
  };

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Merchant Management</div>
          <div style={s.subtitle}>{counts.active} active · {counts.pending} pending · {counts.suspended} suspended</div>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-item${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {counts[t] > 0 && (
              <span style={{ marginLeft: 6, fontSize: '0.72rem', opacity: 0.7 }}>({counts[t]})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading merchants...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-title">No merchants in this category</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>Merchant</span>
            <span>City</span>
            <span>County</span>
            <span>Email</span>
            <span>Rating</span>
            <span>Products</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map((m, idx) => {
            const st = STATUS_MAP[m.status] || STATUS_MAP.pending;
            return (
              <div
                key={m.id}
                style={{ ...s.tableRow, borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div>
                  <div style={s.merchantName}>{m.name}</div>
                  <div style={s.merchantSub}>Since {m.created_at?.slice(0, 7)}</div>
                </div>
                <span style={s.locationCell}>{m.city}</span>
                <span style={s.locationCell}>{m.county}</span>
                <span style={{ ...s.locationCell, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>
                <span style={s.ratingCell}>
                  {m.rating_count > 0 ? `★ ${m.rating_avg.toFixed(1)}` : '—'}
                </span>
                <span style={s.numCell}>{m.active_products}</span>
                <span><span className={`badge ${st.cls}`}>{st.label}</span></span>
                <div style={s.actionGroup}>
                  <button
                    style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', color: '#2563eb', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                    onClick={() => setDetail(m)}
                  >View</button>
                  {m.status !== 'active' && (
                    <button
                      style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(22,163,74,0.2)', background: 'rgba(22,163,74,0.05)', color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                      onClick={() => handleActivate(m.id)}
                    >Activate</button>
                  )}
                  {m.status === 'active' && (
                    <button
                      style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                      onClick={() => handleSuspend(m.id)}
                    >Suspend</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <div style={s.overlay} onClick={() => setDetail(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>{detail.name}</div>

            {[
              ['Email', detail.email],
              ['Phone', detail.phone],
              ['Address', detail.address],
              ['City / County', `${detail.city}, ${detail.county}`],
              ['Active Services', detail.active_products],
              ['Total Bookings', detail.total_bookings],
              ['Rating', detail.rating_count > 0 ? `${detail.rating_avg.toFixed(1)} (${detail.rating_count} reviews)` : 'No reviews yet'],
              ['Member Since', detail.created_at],
            ].map(([label, value], idx, arr) => (
              <div key={label} style={idx < arr.length - 1 ? s.detailRow : s.detailRowLast}>
                <span style={s.detailLabel}>{label}</span>
                <span style={s.detailValue}>{value}</span>
              </div>
            ))}

            <div style={s.modalActions}>
              <button className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button>
              {detail.status !== 'active' && (
                <button className="btn btn-primary" onClick={() => handleActivate(detail.id)}>Activate</button>
              )}
              {detail.status === 'active' && (
                <button
                  style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.875rem' }}
                  onClick={() => handleSuspend(detail.id)}
                >Suspend Account</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
