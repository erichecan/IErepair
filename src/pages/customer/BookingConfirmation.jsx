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
  date: '2026-04-10',
  time: '10:30',
  total_price: 89,
  deposit_amount: 18,
  due_at_shop: 71,
  qr_code: 'IRA-2026-0042-QR',
};

const s = {
  successBanner: {
    textAlign: 'center',
    padding: '32px 0 24px',
    marginBottom: 24,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(22,163,74,0.1)',
    border: '2px solid rgba(22,163,74,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    margin: '0 auto 16px',
  },
  successTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    marginBottom: 6,
  },
  successSub: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  bookingChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-surface)',
    boxShadow: 'var(--shadow-sm)',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '0.02em',
    marginTop: 12,
    fontFamily: 'monospace',
  },
  qrBlock: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px 20px',
    textAlign: 'center',
    marginBottom: 16,
  },
  qrBox: {
    width: 160,
    height: 160,
    margin: '0 auto 14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
    boxShadow: 'var(--shadow-sm)',
  },
  qrTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 4,
  },
  qrSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  detailCard: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  detailHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 20px',
    gap: 12,
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    background: 'var(--border-muted)',
    margin: '0 20px',
  },
  paymentTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    gap: 12,
  },
  totalLabel: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  totalValue: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
  },
  depositRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    gap: 12,
    background: 'rgba(22,163,74,0.04)',
  },
  depositLabel: {
    fontSize: '0.82rem',
    color: '#16a34a',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  depositValue: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#16a34a',
  },
  dueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    gap: 12,
  },
  dueLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  dueValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  cancelBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid rgba(220,38,38,0.2)',
    background: 'rgba(220,38,38,0.04)',
    color: '#b91c1c',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    marginTop: 4,
    transition: 'background 0.15s',
  },
  backBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    marginTop: 8,
    transition: 'background 0.15s',
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: 'var(--text-muted)',
  },
};

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;
    setCancelling(true);
    try {
      await clientAPI.post(`/booking/bookings/${bookingId}/cancel`);
      navigate('/my/bookings');
    } catch {
      alert('Cancellation failed. Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <div style={s.loading}>Loading booking details...</div>;
  if (!booking) return <div style={s.loading}>Booking not found.</div>;

  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="animate-up">
      {/* Success Banner */}
      <div style={s.successBanner}>
        <div style={s.checkCircle}>
          {isCancelled ? '✕' : '✓'}
        </div>
        <div style={s.successTitle}>
          {isCancelled ? 'Booking Cancelled' : 'Booking Confirmed!'}
        </div>
        <div style={s.successSub}>
          {isCancelled
            ? 'Your booking has been cancelled. Any deposit will be refunded.'
            : `Your appointment is set. Show the QR code when you arrive.`}
        </div>
        <div style={s.bookingChip}>
          <span>🎫</span>
          <span>{booking.booking_number || bookingId}</span>
        </div>
      </div>

      {/* QR Code */}
      {!isCancelled && (
        <div style={s.qrBlock}>
          <div style={s.qrBox}>⬛</div>
          <div style={s.qrTitle}>Show this at the shop</div>
          <div style={s.qrSub}>{booking.qr_code || booking.booking_number || bookingId}</div>
        </div>
      )}

      {/* Booking Details */}
      <div style={s.detailCard}>
        <div style={s.detailHeader}>Appointment Details</div>
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Service</span>
          <span style={s.detailValue}>{booking.service_name}</span>
        </div>
        <div style={s.separator} />
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Shop</span>
          <span style={s.detailValue}>{booking.shop_name}</span>
        </div>
        <div style={s.separator} />
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Address</span>
          <span style={s.detailValue}>{booking.shop_address}</span>
        </div>
        <div style={s.separator} />
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Date</span>
          <span style={s.detailValue}>{booking.date}</span>
        </div>
        <div style={s.separator} />
        <div style={s.detailRow}>
          <span style={s.detailLabel}>Time</span>
          <span style={s.detailValue}>{booking.time}</span>
        </div>
      </div>

      {/* Payment Summary */}
      <div style={s.detailCard}>
        <div style={s.detailHeader}>Payment Summary</div>
        <div style={s.paymentTotal}>
          <span style={s.totalLabel}>Total Price</span>
          <span style={s.totalValue}>€{booking.total_price}</span>
        </div>
        <div style={s.separator} />
        <div style={s.depositRow}>
          <span style={s.depositLabel}><span>✅</span> Deposit Paid</span>
          <span style={s.depositValue}>−€{booking.deposit_amount}</span>
        </div>
        <div style={s.dueRow}>
          <span style={s.dueLabel}>Due at Shop</span>
          <span style={s.dueValue}>€{booking.due_at_shop}</span>
        </div>
      </div>

      {/* Actions */}
      {!isCancelled && (
        <button
          style={{ ...s.cancelBtn, opacity: cancelling ? 0.6 : 1 }}
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling...' : 'Cancel Booking'}
        </button>
      )}
      <button style={s.backBtn} onClick={() => navigate('/my/bookings')}>
        Back to My Bookings
      </button>
    </div>
  );
}
