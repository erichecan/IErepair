import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const STATUS_MAP = {
  confirmed:   { label: 'Confirmed',   color: '#16a34a', bg: 'rgba(22,163,74,0.08)'  },
  checked_in:  { label: 'Checked In',  color: '#2563eb', bg: 'rgba(37,99,235,0.08)'  },
  in_progress: { label: 'In Progress', color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
  completed:   { label: 'Completed',   color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  no_show:     { label: 'No Show',     color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
};

const mockEvents = [
  { day: 0, time: '09:00', service: 'iPhone 15 Pro Screen', customer: 'Sarah M.', status: 'completed' },
  { day: 0, time: '10:30', service: 'Samsung S24 Battery', customer: 'James K.', status: 'in_progress' },
  { day: 0, time: '14:00', service: 'iPhone 14 Screen', customer: 'Emma L.', status: 'confirmed' },
  { day: 1, time: '09:30', service: 'Water Damage Assess.', customer: 'Liam O.', status: 'confirmed' },
  { day: 1, time: '11:00', service: 'Google Pixel 8 Screen', customer: 'Aoife R.', status: 'confirmed' },
  { day: 2, time: '10:00', service: 'iPhone 15 Battery', customer: 'Ciaran W.', status: 'confirmed' },
  { day: 3, time: '13:00', service: 'Samsung S24 Screen', customer: 'Niamh B.', status: 'confirmed' },
  { day: 4, time: '09:00', service: 'iPad Screen', customer: 'Sean D.', status: 'confirmed' },
  { day: 4, time: '15:30', service: 'iPhone 15 Pro Screen', customer: 'Orla F.', status: 'confirmed' },
];

function getWeekDays(offset) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
  navBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    background: 'transparent',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  weekRange: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    minWidth: 160,
    textAlign: 'center',
  },
  todayBtn: {
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  gridWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  gridHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid var(--border-muted)',
  },
  dayHeader: (isToday) => ({
    padding: '12px 8px',
    textAlign: 'center',
    borderRight: '1px solid var(--border-muted)',
    background: isToday ? 'rgba(36,36,36,0.03)' : 'transparent',
  }),
  dayHeaderLast: (isToday) => ({
    padding: '12px 8px',
    textAlign: 'center',
    background: isToday ? 'rgba(36,36,36,0.03)' : 'transparent',
  }),
  dayName: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 4,
  },
  dateNum: (isToday) => ({
    fontSize: '1rem',
    fontWeight: 800,
    color: isToday ? '#242424' : 'var(--text-main)',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: isToday ? 'rgba(36,36,36,0.1)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    letterSpacing: '-0.02em',
  }),
  gridBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
  },
  dayCol: (isToday, isLast) => ({
    minHeight: 200,
    padding: '10px 8px',
    borderRight: isLast ? 'none' : '1px solid var(--border-muted)',
    background: isToday ? 'rgba(36,36,36,0.015)' : 'transparent',
    verticalAlign: 'top',
  }),
  event: (status) => {
    const st = STATUS_MAP[status] || STATUS_MAP.confirmed;
    return {
      padding: '6px 8px',
      borderRadius: 6,
      marginBottom: 6,
      borderLeft: `3px solid ${st.color}`,
      background: st.bg,
    };
  },
  eventTime: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  eventCustomer: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  eventService: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legend: {
    display: 'flex',
    gap: 16,
    padding: '12px 20px',
    borderTop: '1px solid var(--border-muted)',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  legendDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
};

export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState(mockEvents);
  const days = getWeekDays(weekOffset);

  const todayStr = new Date().toDateString();
  const todayIdx = days.findIndex((d) => d.toDateString() === todayStr);

  useEffect(() => {
    const load = async () => {
      try {
        const from = days[0].toISOString().slice(0, 10);
        const to = days[6].toISOString().slice(0, 10);
        const res = await merchantAPI.get(`/bookings?date_from=${from}&date_to=${to}`);
        const bookings = res.data?.data || res.data || [];
        setEvents(bookings.map((b) => {
          const bDate = new Date(b.booking_date || b.bookingDate);
          return {
            day: (bDate.getDay() + 6) % 7,
            time: b.booking_time || b.bookingTime,
            service: b.service_name || b.serviceName,
            customer: b.customer_name || b.customerName,
            status: b.status,
          };
        }));
      } catch {
        setEvents(weekOffset === 0 ? mockEvents : []);
      }
    };
    load();
  }, [weekOffset]);

  const weekStart = days[0].toLocaleDateString('en-IE', { month: 'short', day: 'numeric' });
  const weekEnd = days[6].toLocaleDateString('en-IE', { month: 'short', day: 'numeric', year: 'numeric' });
  const totalBookings = events.length;

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Calendar</div>
          <div style={s.subtitle}>{totalBookings} booking{totalBookings !== 1 ? 's' : ''} this week</div>
        </div>
        <div style={s.navBar}>
          {weekOffset !== 0 && (
            <button style={s.todayBtn} onClick={() => setWeekOffset(0)}>Today</button>
          )}
          <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset - 1)}>‹</button>
          <span style={s.weekRange}>{weekStart} – {weekEnd}</span>
          <button style={s.navBtn} onClick={() => setWeekOffset(weekOffset + 1)}>›</button>
        </div>
      </div>

      <div style={s.gridWrap}>
        {/* Day headers */}
        <div style={s.gridHeader}>
          {days.map((date, idx) => {
            const isToday = idx === todayIdx;
            const style = idx < 6 ? s.dayHeader(isToday) : s.dayHeaderLast(isToday);
            return (
              <div key={idx} style={style}>
                <div style={s.dayName}>{DAY_NAMES[idx]}</div>
                <div style={s.dateNum(isToday)}>{date.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        <div style={s.gridBody}>
          {days.map((_, idx) => {
            const dayEvents = events.filter((e) => e.day === idx);
            const isToday = idx === todayIdx;
            return (
              <div key={idx} style={s.dayCol(isToday, idx === 6)}>
                {dayEvents.length === 0 ? (
                  <div style={{ fontSize: '0.72rem', color: 'var(--border-muted)', textAlign: 'center', paddingTop: 20 }}>—</div>
                ) : (
                  dayEvents.map((ev, ei) => (
                    <div key={ei} style={s.event(ev.status)}>
                      <div style={s.eventTime}>{ev.time}</div>
                      <div style={s.eventCustomer}>{ev.customer}</div>
                      <div style={s.eventService}>{ev.service}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={s.legend}>
          {Object.entries(STATUS_MAP).map(([key, st]) => (
            <div key={key} style={s.legendItem}>
              <div style={s.legendDot(st.color)} />
              <span>{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
