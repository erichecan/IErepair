import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantAPI } from '../../api/client';

const mockStats = [
  { label: "Today's Bookings", value: '8', icon: '📅', trend: '+2 vs yesterday', up: true },
  { label: "Revenue Today",    value: '€1,240', icon: '💰', trend: '+€180 vs yesterday', up: true },
  { label: 'Pending Check-ins', value: '3', icon: '⏳', trend: '2 in next hour', up: null },
  { label: 'Completed',        value: '5', icon: '✅', trend: '62.5% completion', up: null },
];

const todayBookings = [
  { id: 1, time: '09:00', customer: 'Sarah Murphy',  service: 'iPhone 15 Pro Screen',   status: 'checked_in' },
  { id: 2, time: '09:30', customer: 'James Kelly',   service: 'Samsung S24 Battery',    status: 'in_progress' },
  { id: 3, time: '10:30', customer: 'Emma Lynch',    service: 'iPhone 14 Screen',       status: 'confirmed' },
  { id: 4, time: '11:00', customer: "Liam O'Brien",  service: 'Water Damage Assessment',status: 'confirmed' },
  { id: 5, time: '13:00', customer: 'Aoife Ryan',    service: 'Google Pixel 8 Screen',  status: 'confirmed' },
  { id: 6, time: '14:00', customer: 'Ciaran Walsh',  service: 'iPhone 15 Battery',      status: 'completed' },
  { id: 7, time: '15:00', customer: 'Niamh Byrne',   service: 'Samsung S24 Screen',     status: 'completed' },
  { id: 8, time: '16:30', customer: 'Sean Doyle',    service: 'iPad Screen',            status: 'completed' },
];

const STATUS_MAP = {
  confirmed:   { label: 'Confirmed',   cls: 'badge-green' },
  checked_in:  { label: 'Checked In',  cls: 'badge-blue' },
  in_progress: { label: 'In Progress', cls: 'badge-yellow' },
  completed:   { label: 'Completed',   cls: 'badge-gray' },
  no_show:     { label: 'No Show',     cls: 'badge-red' },
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '18px 20px',
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  statValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.04em',
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    marginBottom: 8,
  },
  statTrend: (up) => ({
    fontSize: '0.72rem',
    fontWeight: 600,
    color: up === true ? '#16a34a' : up === false ? '#dc2626' : 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
  }),
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '70px 1fr 1.5fr 110px 140px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    gap: 12,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '70px 1fr 1.5fr 110px 140px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 12,
    transition: 'background 0.1s',
  },
  timeCell: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    fontFamily: 'monospace',
  },
  customerCell: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  serviceCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionsCell: {
    display: 'flex',
    gap: 6,
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
    transition: 'background 0.1s',
    whiteSpace: 'nowrap',
  }),
  quickActions: {
    display: 'flex',
    gap: 10,
  },
};

function getToday() {
  return new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockStats);
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
        const s = statsRes.data?.data || statsRes.data;
        if (s) {
          setStats([
            { label: "Today's Bookings",  value: String(s.todayCount ?? 8), icon: '📅', trend: '+2 vs yesterday', up: true },
            { label: 'Revenue Today',     value: `€${s.revenue ?? 1240}`, icon: '💰', trend: '+€180 vs yesterday', up: true },
            { label: 'Pending Check-ins', value: String(s.pendingCheckins ?? 3), icon: '⏳', trend: '2 in next hour', up: null },
            { label: 'Completed',         value: String(s.completed ?? 5), icon: '✅', trend: '62.5% completion', up: null },
          ]);
        }
      } catch { /* use mock data */ }
    };
    load();
  }, []);

  function handleAction(id, action) {
    const newStatus = STATUS_TRANSITIONS[action];
    if (newStatus) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
    }
  }

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Dashboard</div>
          <div style={s.subtitle}>{getToday()}</div>
        </div>
        <div style={s.quickActions}>
          <button className="btn btn-secondary" onClick={() => navigate('/merchant/scan')}>Scan QR</button>
          <button className="btn btn-primary" onClick={() => navigate('/merchant/orders')}>All Orders</button>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={s.statTop}>
              <div style={s.statIcon}>{stat.icon}</div>
            </div>
            <div style={s.statValue}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
            <div style={s.statTrend(stat.up)}>
              {stat.up === true ? '↑' : stat.up === false ? '↓' : ''}
              {' '}{stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div style={s.sectionHeader}>
        <div style={s.sectionTitle}>Today's Schedule</div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{bookings.length} appointments</span>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHead}>
          <span>Time</span>
          <span>Customer</span>
          <span>Service</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {bookings.map((b, idx) => {
          const st = STATUS_MAP[b.status] || STATUS_MAP.confirmed;
          const actions = ACTION_MAP[b.status] || [];
          return (
            <div
              key={b.id}
              style={{ ...s.tableRow, borderBottom: idx < bookings.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={s.timeCell}>{b.time}</span>
              <span style={s.customerCell}>{b.customer}</span>
              <span style={s.serviceCell}>{b.service}</span>
              <span><span className={`badge ${st.cls}`}>{st.label}</span></span>
              <div style={s.actionsCell}>
                {actions.map((a) => (
                  <button
                    key={a}
                    style={s.actionBtn(a === 'No-show' ? 'danger' : 'default')}
                    onClick={() => handleAction(b.id, a)}
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
  );
}
