import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockBookings = [
  { id: 'b1', booking_number: 'IRA-2026-0042', service_name: 'iPhone 15 Pro Screen', shop_name: 'Fix-It Dublin', date: '2026-04-05', time: '10:30', status: 'confirmed' },
  { id: 'b2', booking_number: 'IRA-2026-0038', service_name: 'Samsung S24 Battery', shop_name: 'Phone Rescue', date: '2026-04-02', time: '14:00', status: 'checked_in' },
  { id: 'b3', booking_number: 'IRA-2026-0021', service_name: 'iPhone 14 Screen', shop_name: 'iPhone Clinic', date: '2026-03-15', time: '11:00', status: 'completed' },
  { id: 'b4', booking_number: 'IRA-2026-0010', service_name: 'Water Damage Assessment', shop_name: 'Screen Fix Pro', date: '2026-02-20', time: '09:30', status: 'completed' },
];

const statusColors = {
  confirmed: { bg: 'rgba(0,208,132,0.15)', color: '#00D084' },
  checked_in: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  in_progress: { bg: 'rgba(234,179,8,0.15)', color: '#EAB308' },
  completed: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  no_show: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};

const s = {
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-muted)', marginBottom: 16 },
  tab: (active) => ({
    padding: '10px 20px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
    color: active ? 'var(--primary-green)' : 'var(--text-muted)',
    background: 'none', border: 'none',
    borderBottom: active ? '2px solid var(--primary-green)' : '2px solid transparent',
  }),
  card: {
    padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.2s',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingNum: { fontWeight: 600, fontSize: '0.9rem' },
  badge: (status) => {
    const c = statusColors[status] || statusColors.confirmed;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600 };
  },
  service: { fontSize: '0.95rem', fontWeight: 500, marginBottom: 4 },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)' },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await clientAPI.get('/booking/bookings');
        if (!cancelled) setBookings(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setBookings(mockBookings);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== 'completed' && b.status !== 'cancelled');
  const past = bookings.filter((b) => b.date < today || b.status === 'completed' || b.status === 'cancelled');
  const display = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="animate-up">
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>My Bookings</h2>

      <div style={s.tabs}>
        <button style={s.tab(tab === 'upcoming')} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button style={s.tab(tab === 'past')} onClick={() => setTab('past')}>Past</button>
      </div>

      {loading ? (
        <div style={s.empty}>Loading...</div>
      ) : display.length === 0 ? (
        <div style={s.empty}>No {tab} bookings.</div>
      ) : (
        display.map((b) => (
          <div key={b.id || b.booking_number} style={s.card} onClick={() => navigate(`/booking/${b.id}`)}>
            <div style={s.top}>
              <span style={s.bookingNum}>{b.booking_number}</span>
              <span style={s.badge(b.status)}>{(b.status || '').replace(/_/g, ' ')}</span>
            </div>
            <div style={s.service}>{b.service_name}</div>
            <div style={s.meta}>{b.shop_name} &bull; {b.date} at {b.time}</div>
          </div>
        ))
      )}
    </div>
  );
}
