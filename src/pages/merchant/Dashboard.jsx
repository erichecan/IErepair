import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantAPI } from '../../api/client';

const summaryCards = [
  { label: "Today's Bookings", value: 8, color: 'var(--primary-green)' },
  { label: 'Revenue', value: '\u20AC1,240', color: '#3B82F6' },
  { label: 'Pending Check-ins', value: 3, color: '#EAB308' },
  { label: 'Completed', value: 5, color: '#6B7280' },
];

const todayBookings = [
  { id: 1, time: '09:00', customer: 'Sarah Murphy', service: 'iPhone 15 Pro Screen', status: 'checked_in' },
  { id: 2, time: '09:30', customer: 'James Kelly', service: 'Samsung S24 Battery', status: 'in_progress' },
  { id: 3, time: '10:30', customer: 'Emma Lynch', service: 'iPhone 14 Screen', status: 'confirmed' },
  { id: 4, time: '11:00', customer: 'Liam O\'Brien', service: 'Water Damage Assessment', status: 'confirmed' },
  { id: 5, time: '13:00', customer: 'Aoife Ryan', service: 'Google Pixel 8 Screen', status: 'confirmed' },
  { id: 6, time: '14:00', customer: 'Ciaran Walsh', service: 'iPhone 15 Battery', status: 'completed' },
  { id: 7, time: '15:00', customer: 'Niamh Byrne', service: 'Samsung S24 Screen', status: 'completed' },
  { id: 8, time: '16:30', customer: 'Sean Doyle', service: 'iPad Screen', status: 'completed' },
];

const statusColors = {
  confirmed: { bg: 'rgba(0,208,132,0.15)', color: '#00D084' },
  checked_in: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  in_progress: { bg: 'rgba(234,179,8,0.15)', color: '#EAB308' },
  completed: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  card: (color) => ({
    padding: 20, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)', background: 'var(--bg-card)',
    borderLeft: `3px solid ${color}`,
  }),
  cardValue: { fontFamily: "'Outfit', sans-serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 },
  cardLabel: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: 14 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: {
    display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)',
  },
  time: { fontWeight: 600, fontSize: '0.9rem', minWidth: 50 },
  customer: { flex: 1, fontWeight: 500, fontSize: '0.9rem' },
  service: { flex: 2, fontSize: '0.85rem', color: 'var(--text-muted)' },
  badge: (status) => {
    const c = statusColors[status] || statusColors.confirmed;
    return { padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' };
  },
  actions: { display: 'flex', gap: 12, marginTop: 24 },
  actionBtn: {
    padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600,
    cursor: 'pointer', fontSize: '0.9rem', transition: 'border-color 0.2s',
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(summaryCards);
  const [bookings, setBookings] = useState(todayBookings);

  useEffect(() => {
    const load = async () => {
      try {
        const [todayRes, statsRes] = await Promise.all([
          merchantAPI.get('/dashboard/today'),
          merchantAPI.get('/dashboard/stats'),
        ]);
        const today = todayRes.data?.data || todayRes.data;
        if (today?.bookings) setBookings(today.bookings);
        const stats = statsRes.data?.data || statsRes.data;
        if (stats) {
          setCards([
            { label: "Today's Bookings", value: stats.todayCount ?? summaryCards[0].value, color: 'var(--primary-green)' },
            { label: 'Revenue', value: stats.revenue ? `\u20AC${stats.revenue}` : summaryCards[1].value, color: '#3B82F6' },
            { label: 'Pending Check-ins', value: stats.pendingCheckins ?? summaryCards[2].value, color: '#EAB308' },
            { label: 'Completed', value: stats.completed ?? summaryCards[3].value, color: '#6B7280' },
          ]);
        }
      } catch { /* use mock data */ }
    };
    load();
  }, []);

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Dashboard</h2>

      <div style={s.cardGrid}>
        {cards.map((c) => (
          <div key={c.label} style={s.card(c.color)}>
            <div style={s.cardValue}>{c.value}</div>
            <div style={s.cardLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={s.sectionTitle}>Today&apos;s Bookings</div>
      <div style={s.timeline}>
        {bookings.map((b) => (
          <div key={b.id} style={s.row}>
            <span style={s.time}>{b.time}</span>
            <span style={s.customer}>{b.customer}</span>
            <span style={s.service}>{b.service}</span>
            <span style={s.badge(b.status)}>{(b.status || '').replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      <div style={s.actions}>
        <button style={s.actionBtn} onClick={() => navigate('/merchant/scan')}>Scan QR</button>
        <button style={s.actionBtn} onClick={() => navigate('/merchant/orders')}>View All Orders</button>
      </div>
    </div>
  );
}
