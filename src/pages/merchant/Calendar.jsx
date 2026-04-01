import React, { useState } from 'react';

const statusColors = {
  confirmed: '#00D084',
  checked_in: '#3B82F6',
  in_progress: '#EAB308',
  completed: '#6B7280',
};

const mockEvents = [
  { day: 0, time: '09:00', service: 'iPhone 15 Pro Screen', customer: 'Sarah M.', status: 'completed' },
  { day: 0, time: '10:30', service: 'Samsung S24 Battery', customer: 'James K.', status: 'in_progress' },
  { day: 0, time: '14:00', service: 'iPhone 14 Screen', customer: 'Emma L.', status: 'confirmed' },
  { day: 1, time: '09:30', service: 'Water Damage Assessment', customer: 'Liam O.', status: 'confirmed' },
  { day: 1, time: '11:00', service: 'Google Pixel 8 Screen', customer: 'Aoife R.', status: 'confirmed' },
  { day: 2, time: '10:00', service: 'iPhone 15 Battery', customer: 'Ciaran W.', status: 'confirmed' },
  { day: 3, time: '13:00', service: 'Samsung S24 Screen', customer: 'Niamh B.', status: 'confirmed' },
  { day: 4, time: '09:00', service: 'iPad Screen', customer: 'Sean D.', status: 'confirmed' },
  { day: 4, time: '15:30', service: 'iPhone 15 Pro Screen', customer: 'Orla F.', status: 'confirmed' },
];

function getWeekDays(offset) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: {
    padding: '8px 16px', borderRadius: 20, border: '1px solid var(--border-muted)',
    background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.85rem',
  },
  weekLabel: { fontWeight: 600, fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 },
  dayHeader: {
    textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)',
    paddingBottom: 8, borderBottom: '1px solid var(--border-muted)',
  },
  dayCol: {
    minHeight: 200, borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)', padding: 8, background: 'var(--bg-card)',
  },
  dateNum: { fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' },
  event: (color) => ({
    padding: '6px 8px', borderRadius: 6, marginBottom: 6,
    borderLeft: `3px solid ${color}`, background: 'rgba(255,255,255,0.03)',
    fontSize: '0.75rem',
  }),
  eventTime: { fontWeight: 600, marginBottom: 2 },
  eventName: { color: 'var(--text-muted)' },
  legend: { display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' },
  legendDot: (c) => ({ width: 10, height: 10, borderRadius: '50%', background: c }),
};

export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const days = getWeekDays(weekOffset);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weekStart = days[0].toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });
  const weekEnd = days[6].toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Calendar</h2>

      <div style={s.nav}>
        <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset - 1)}>Prev</button>
        <span style={s.weekLabel}>{weekStart} - {weekEnd}</span>
        <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset + 1)}>Next</button>
      </div>

      <div style={s.grid}>
        {dayNames.map((d) => <div key={d} style={s.dayHeader}>{d}</div>)}
        {days.map((date, idx) => {
          const eventsForDay = weekOffset === 0 ? mockEvents.filter((e) => e.day === idx) : [];
          return (
            <div key={idx} style={s.dayCol}>
              <div style={s.dateNum}>{date.getDate()}</div>
              {eventsForDay.map((ev, ei) => (
                <div key={ei} style={s.event(statusColors[ev.status] || '#6B7280')}>
                  <div style={s.eventTime}>{ev.time}</div>
                  <div style={s.eventName}>{ev.customer}</div>
                  <div style={s.eventName}>{ev.service}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={s.legend}>
        {Object.entries(statusColors).map(([k, c]) => (
          <div key={k} style={s.legendItem}>
            <div style={s.legendDot(c)} />
            <span>{k.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
