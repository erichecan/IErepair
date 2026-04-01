import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockBooking = {
  id: 'demo-123',
  booking_number: 'IRA-2026-0042',
  status: 'confirmed',
  service_name: 'iPhone 15 Pro Screen Replacement',
  shop_name: 'Fix-It Dublin',
  shop_address: '12 Grafton St, Dublin 2',
  date: '2026-04-05',
  time: '10:30',
  total_price: 89,
  deposit_amount: 18,
  due_at_shop: 71,
  qr_code: 'IRA-2026-0042-QR',
};

const s = {
  center: { textAlign: 'center', marginBottom: 24 },
  badge: {
    display: 'inline-block', padding: '6px 20px', borderRadius: 20,
    background: 'rgba(0,208,132,0.15)', color: 'var(--primary-green)',
    fontWeight: 700, fontSize: '0.9rem', marginBottom: 12,
  },
  bookingNum: { fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 },
  qrBox: {
    width: 180, height: 180, margin: '0 auto 24px',
    border: '2px solid var(--border-muted)', borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-card)', flexDirection: 'column', gap: 8,
  },
  qrText: { fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', padding: '0 12px', textAlign: 'center' },
  qrLabel: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  card: {
    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)',
    padding: 16, background: 'var(--bg-card)', marginBottom: 16,
  },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.9rem' },
  rowLast: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.9rem' },
  label: { color: 'var(--text-muted)' },
  value: { fontWeight: 600 },
  cancelBtn: {
    width: '100%', padding: '12px', borderRadius: 20,
    border: '1px solid rgba(255,100,100,0.3)', background: 'transparent',
    color: '#ff6b6b', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', marginTop: 8,
  },
  loading: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
};

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await clientAPI.get(`/booking/bookings/${bookingId}`);
        if (!cancelled) setBooking(res.data?.data || res.data);
      } catch {
        if (!cancelled) setBooking(mockBooking);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [bookingId]);

  async function handleCancel() {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await clientAPI.post(`/booking/bookings/${bookingId}/cancel`);
      alert('Booking cancelled.');
      navigate('/my/bookings');
    } catch {
      alert('Cancellation failed. Please try again.');
    }
  }

  if (loading) return <div style={s.loading}>Loading booking...</div>;
  if (!booking) return <div style={s.loading}>Booking not found.</div>;

  return (
    <div className="animate-up">
      <div style={s.center}>
        <div style={s.badge}>Confirmed</div>
        <div style={s.bookingNum}>{booking.booking_number || bookingId}</div>
      </div>

      <div style={s.qrBox}>
        <div style={{ fontSize: '2.5rem' }}>&#9634;</div>
        <div style={s.qrText}>{booking.qr_code || booking.booking_number || bookingId}</div>
        <div style={s.qrLabel}>Show this at the shop</div>
      </div>

      <div style={s.card}>
        <div style={s.row}><span style={s.label}>Service</span><span style={s.value}>{booking.service_name}</span></div>
        <div style={s.row}><span style={s.label}>Shop</span><span style={s.value}>{booking.shop_name}</span></div>
        <div style={s.row}><span style={s.label}>Address</span><span style={s.value}>{booking.shop_address}</span></div>
        <div style={s.row}><span style={s.label}>Date</span><span style={s.value}>{booking.date}</span></div>
        <div style={s.rowLast}><span style={s.label}>Time</span><span style={s.value}>{booking.time}</span></div>
      </div>

      <div style={s.card}>
        <div style={s.row}><span style={s.label}>Total</span><span style={s.value}>&euro;{booking.total_price}</span></div>
        <div style={s.row}><span style={s.label}>Deposit Paid</span><span style={{ ...s.value, color: 'var(--primary-green)' }}>&euro;{booking.deposit_amount}</span></div>
        <div style={s.rowLast}><span style={s.label}>Due at Shop</span><span style={s.value}>&euro;{booking.due_at_shop}</span></div>
      </div>

      <button style={s.cancelBtn} onClick={handleCancel}>Cancel Booking</button>
    </div>
  );
}
