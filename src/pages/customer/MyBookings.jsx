import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockBookings = [
  { id: 'b1', booking_number: 'IRA-2026-0042', service_name: 'iPhone 15 Pro Screen', shop_name: 'Fix-It Dublin', date: '2026-04-10', time: '10:30', status: 'confirmed' },
  { id: 'b2', booking_number: 'IRA-2026-0038', service_name: 'Samsung S24 Battery', shop_name: 'Phone Rescue', date: '2026-04-12', time: '14:00', status: 'checked_in' },
  { id: 'b3', booking_number: 'IRA-2026-0021', service_name: 'iPhone 14 Screen', shop_name: 'iPhone Clinic', date: '2026-03-15', time: '11:00', status: 'completed' },
  { id: 'b4', booking_number: 'IRA-2026-0010', service_name: 'Water Damage Assessment', shop_name: 'Screen Fix Pro', date: '2026-02-20', time: '09:30', status: 'completed' },
];

const STATUS_MAP = {
  confirmed:   { label: 'Confirmed',   cls: 'badge-green' },
  checked_in:  { label: 'Checked In',  cls: 'badge-blue' },
  in_progress: { label: 'In Progress', cls: 'badge-yellow' },
  completed:   { label: 'Completed',   cls: 'badge-gray' },
  cancelled:   { label: 'Cancelled',   cls: 'badge-red' },
  no_show:     { label: 'No Show',     cls: 'badge-red' },
};

const s = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleGroup: {},
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
  card: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px 20px',
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  bookingNum: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.02em',
    fontFamily: 'monospace',
  },
  serviceName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  },
  arrow: {
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    flexShrink: 0,
  },
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
      <div style={s.header}>
        <div style={s.titleGroup}>
          <div style={s.title}>My Bookings</div>
          <div style={s.subtitle}>Track and manage your repair appointments</div>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-item${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming
          {upcoming.length > 0 && (
            <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 'var(--radius-full)', background: '#242424', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
              {upcoming.length}
            </span>
          )}
        </button>
        <button className={`tab-item${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
          Past
        </button>
      </div>

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...s.card, cursor: 'default' }}>
              <div style={{ ...s.cardIcon, background: 'var(--bg-surface)' }} className="skeleton" />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '55%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : display.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{tab === 'upcoming' ? '📅' : '🗂️'}</div>
          <div className="empty-state-title">No {tab} bookings</div>
          <div className="empty-state-desc">
            {tab === 'upcoming'
              ? 'Book a repair to get started — find a shop near you.'
              : 'Your completed and cancelled bookings will appear here.'}
          </div>
          {tab === 'upcoming' && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
              Find a Shop
            </button>
          )}
        </div>
      ) : (
        display.map((b) => {
          const st = STATUS_MAP[b.status] || { label: b.status, cls: 'badge-gray' };
          return (
            <div
              key={b.id || b.booking_number}
              style={s.card}
              onClick={() => navigate(`/booking/${b.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={s.cardIcon}>🔧</div>
              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <span style={s.bookingNum}>{b.booking_number}</span>
                  <span className={`badge ${st.cls}`}>{st.label}</span>
                </div>
                <div style={s.serviceName}>{b.service_name}</div>
                <div style={s.metaRow}>
                  <span style={s.metaItem}><span>🏪</span><span>{b.shop_name}</span></span>
                  <span style={s.metaItem}><span>📅</span><span>{b.date}</span></span>
                  <span style={s.metaItem}><span>🕐</span><span>{b.time}</span></span>
                </div>
              </div>
              <div style={s.arrow}>›</div>
            </div>
          );
        })
      )}
    </div>
  );
}
