import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockOrders = [
  { id: 1, booking_number: 'IRA-2026-0042', customer: 'Sarah Murphy', service: 'iPhone 15 Pro Screen', date: '2026-04-05', time: '09:00', status: 'confirmed' },
  { id: 2, booking_number: 'IRA-2026-0041', customer: 'James Kelly', service: 'Samsung S24 Battery', date: '2026-04-05', time: '09:30', status: 'checked_in' },
  { id: 3, booking_number: 'IRA-2026-0040', customer: 'Emma Lynch', service: 'iPhone 14 Screen', date: '2026-04-05', time: '10:30', status: 'in_progress' },
  { id: 4, booking_number: 'IRA-2026-0039', customer: 'Liam O\'Brien', service: 'Water Damage Assessment', date: '2026-04-04', time: '11:00', status: 'completed' },
  { id: 5, booking_number: 'IRA-2026-0038', customer: 'Aoife Ryan', service: 'Google Pixel 8 Screen', date: '2026-04-04', time: '13:00', status: 'completed' },
  { id: 6, booking_number: 'IRA-2026-0037', customer: 'Ciaran Walsh', service: 'iPhone 15 Battery', date: '2026-04-03', time: '14:00', status: 'no_show' },
];

const statusTabs = ['all', 'confirmed', 'checked_in', 'in_progress', 'completed', 'no_show'];

const statusColors = {
  confirmed: { bg: 'rgba(0,208,132,0.15)', color: '#00D084' },
  checked_in: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  in_progress: { bg: 'rgba(234,179,8,0.15)', color: '#EAB308' },
  completed: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
  no_show: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};

const actionMap = {
  confirmed: ['Check-in', 'No-show'],
  checked_in: ['Start'],
  in_progress: ['Complete'],
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-muted)', marginBottom: 16, overflowX: 'auto' },
  tab: (active) => ({
    padding: '10px 16px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
    color: active ? 'var(--primary-green)' : 'var(--text-muted)',
    background: 'none', border: 'none', whiteSpace: 'nowrap',
    borderBottom: active ? '2px solid var(--primary-green)' : '2px solid transparent',
  }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-muted)' },
  td: { padding: '14px 16px', fontSize: '0.9rem', borderBottom: '1px solid var(--border-muted)' },
  badge: (status) => {
    const c = statusColors[status] || statusColors.confirmed;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' };
  },
  actionBtn: {
    padding: '5px 12px', borderRadius: 12, border: '1px solid var(--border-muted)',
    background: 'transparent', color: 'var(--text-main)', fontSize: '0.75rem',
    cursor: 'pointer', marginRight: 6, fontWeight: 500,
  },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  function handleAction(order, action) {
    const statusMap = { 'Check-in': 'checked_in', 'Start': 'in_progress', 'Complete': 'completed', 'No-show': 'no_show' };
    const newStatus = statusMap[action];
    if (newStatus) {
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: newStatus } : o));
    }
  }

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Orders</h2>

      <div style={s.tabs}>
        {statusTabs.map((t) => (
          <button key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.empty}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No orders found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Booking #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Service</th>
                <th style={s.th}>Date / Time</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={s.td}>{o.booking_number}</td>
                  <td style={s.td}>{o.customer}</td>
                  <td style={{ ...s.td, color: 'var(--text-muted)' }}>{o.service}</td>
                  <td style={{ ...s.td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{o.date} {o.time}</td>
                  <td style={s.td}><span style={s.badge(o.status)}>{(o.status || '').replace(/_/g, ' ')}</span></td>
                  <td style={s.td}>
                    {(actionMap[o.status] || []).map((a) => (
                      <button key={a} style={s.actionBtn} onClick={() => handleAction(o, a)}>{a}</button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
