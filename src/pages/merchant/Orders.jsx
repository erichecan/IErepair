import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockOrders = [
  { id: 1, booking_number: 'IRA-2026-0042', customer: 'Sarah Murphy',  service: 'iPhone 15 Pro Screen',    date: '2026-04-08', time: '09:00', status: 'confirmed',   price: 89 },
  { id: 2, booking_number: 'IRA-2026-0041', customer: 'James Kelly',   service: 'Samsung S24 Battery',     date: '2026-04-08', time: '09:30', status: 'checked_in',  price: 45 },
  { id: 3, booking_number: 'IRA-2026-0040', customer: 'Emma Lynch',    service: 'iPhone 14 Screen',        date: '2026-04-08', time: '10:30', status: 'in_progress', price: 69 },
  { id: 4, booking_number: 'IRA-2026-0039', customer: "Liam O'Brien",  service: 'Water Damage Assessment', date: '2026-04-07', time: '11:00', status: 'completed',   price: 30 },
  { id: 5, booking_number: 'IRA-2026-0038', customer: 'Aoife Ryan',    service: 'Google Pixel 8 Screen',   date: '2026-04-07', time: '13:00', status: 'completed',   price: 75 },
  { id: 6, booking_number: 'IRA-2026-0037', customer: 'Ciaran Walsh',  service: 'iPhone 15 Battery',       date: '2026-04-06', time: '14:00', status: 'no_show',     price: 49 },
];

const STATUS_TABS = [
  { key: 'all',         label: 'All' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'checked_in',  label: 'Checked In' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'no_show',     label: 'No Show' },
];

const STATUS_MAP = {
  confirmed:   { label: 'Confirmed',   cls: 'badge-green' },
  checked_in:  { label: 'Checked In',  cls: 'badge-blue' },
  in_progress: { label: 'In Progress', cls: 'badge-yellow' },
  completed:   { label: 'Completed',   cls: 'badge-gray' },
  no_show:     { label: 'No Show',     cls: 'badge-red' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-red' },
};

const ACTION_MAP = {
  confirmed:   ['Check-in', 'No-show'],
  checked_in:  ['Start'],
  in_progress: ['Complete'],
};

const STATUS_TRANSITIONS = {
  'Check-in': 'checked_in',
  'Start':    'in_progress',
  'Complete': 'completed',
  'No-show':  'no_show',
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
  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
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
    gridTemplateColumns: '130px 1fr 1.4fr 100px 100px 110px 130px',
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
    gridTemplateColumns: '130px 1fr 1.4fr 100px 100px 110px 130px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.1s',
  },
  bookingNum: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  customerName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  serviceName: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dateCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  priceCell: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  actionsCell: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: (variant) => ({
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    border: variant === 'danger'
      ? '1px solid rgba(220,38,38,0.2)'
      : '1px solid var(--border-muted)',
    background: variant === 'danger' ? 'rgba(220,38,38,0.06)' : 'transparent',
    color: variant === 'danger' ? '#b91c1c' : 'var(--text-main)',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  }),
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await merchantAPI.get('/booking/bookings');
        if (!cancelled) setOrders(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setOrders(mockOrders);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleAction(id, action) {
    const newStatus = STATUS_TRANSITIONS[action];
    if (newStatus) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
  }

  const tabFiltered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);
  const filtered = search
    ? tabFiltered.filter((o) =>
        o.customer?.toLowerCase().includes(search.toLowerCase()) ||
        o.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.service?.toLowerCase().includes(search.toLowerCase())
      )
    : tabFiltered;

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Orders</div>
          <div style={s.subtitle}>Manage all repair bookings and their status</div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {STATUS_TABS.map((t) => {
          const count = t.key === 'all' ? orders.length : orders.filter((o) => o.status === t.key).length;
          return (
            <button
              key={t.key}
              className={`tab-item${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {count > 0 && (
                <span style={{
                  marginLeft: 5,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === t.key ? '#242424' : 'var(--bg-surface)',
                  color: activeTab === t.key ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search by customer, booking #, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading orders...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No orders found</div>
          <div className="empty-state-desc">
            {search ? 'Try a different search term.' : `No ${activeTab === 'all' ? '' : activeTab.replace(/_/g,' ')} orders yet.`}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={s.tableWrap}>
            <div style={s.tableHead}>
              <span>Booking #</span>
              <span>Customer</span>
              <span>Service</span>
              <span>Date</span>
              <span>Price</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {filtered.map((o, idx) => {
              const st = STATUS_MAP[o.status] || STATUS_MAP.confirmed;
              const actions = ACTION_MAP[o.status] || [];
              return (
                <div
                  key={o.id}
                  style={{ ...s.tableRow, borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={s.bookingNum}>{o.booking_number}</span>
                  <span style={s.customerName}>{o.customer}</span>
                  <span style={s.serviceName}>{o.service}</span>
                  <span style={s.dateCell}>{o.date}<br /><span style={{ fontSize: '0.72rem' }}>{o.time}</span></span>
                  <span style={s.priceCell}>€{o.price || '--'}</span>
                  <span><span className={`badge ${st.cls}`}>{st.label}</span></span>
                  <div style={s.actionsCell}>
                    {actions.map((a) => (
                      <button
                        key={a}
                        style={s.actionBtn(a === 'No-show' ? 'danger' : 'default')}
                        onClick={() => handleAction(o.id, a)}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
