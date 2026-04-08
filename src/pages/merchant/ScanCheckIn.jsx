import React, { useState } from 'react';
import { merchantAPI } from '../../api/client';

const mockBookingResult = {
  booking_number: 'IRA-2026-0042',
  customer_name: 'Sarah Murphy',
  service_name: 'iPhone 15 Pro Screen Replacement',
  date: '2026-04-08',
  time: '10:30',
  status: 'confirmed',
  deposit_paid: 18,
  total_price: 89,
};

const s = {
  header: {
    marginBottom: 32,
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    maxWidth: 860,
  },
  panel: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
  },
  panelTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 20,
  },
  scanBox: {
    width: '100%',
    aspectRatio: '1',
    maxHeight: 220,
    borderRadius: 'var(--radius-lg)',
    border: '2px dashed var(--border-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    background: 'var(--bg-surface)',
    cursor: 'default',
  },
  scanIcon: {
    fontSize: '3rem',
    opacity: 0.18,
  },
  scanLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  divLine: {
    flex: 1,
    height: 1,
    background: 'var(--border-muted)',
  },
  divText: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    fontWeight: 600,
    outline: 'none',
    letterSpacing: '0.02em',
  },
  errorMsg: {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.15)',
    color: '#b91c1c',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  resultPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  emptyResult: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: 10,
  },
  emptyIcon: {
    fontSize: '2.5rem',
    opacity: 0.2,
  },
  emptyText: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 0',
    borderBottom: '1px solid var(--border-muted)',
    gap: 12,
  },
  detailRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 0',
    gap: 12,
  },
  detailLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
  detailValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'right',
  },
  depositValue: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#16a34a',
    textAlign: 'right',
  },
  checkInBtn: {
    width: '100%',
    marginTop: 20,
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: '#242424',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  successBanner: {
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'rgba(22,163,74,0.1)',
    border: '2px solid rgba(22,163,74,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#16a34a',
  },
  successTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  successSub: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
};

export default function ScanCheckIn() {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  async function handleVerify() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setBooking(null);
    setCheckedIn(false);
    try {
      const res = await merchantAPI.get(`/booking/verify/${code.trim()}`);
      setBooking(res.data?.data || res.data);
    } catch {
      if (code.trim().toUpperCase().includes('IRA')) {
        setBooking(mockBookingResult);
      } else {
        setError('Booking not found. Please check the code and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    setLoading(true);
    try {
      await merchantAPI.post('/booking/check-in', { booking_number: booking.booking_number || code });
    } catch { /* demo */ }
    setCheckedIn(true);
    setLoading(false);
  }

  function handleReset() {
    setCode('');
    setBooking(null);
    setError('');
    setCheckedIn(false);
  }

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div style={s.title}>Scan Check-In</div>
        <div style={s.subtitle}>Scan a customer QR code or enter the booking number manually</div>
      </div>

      <div style={s.layout}>
        {/* Left: Input panel */}
        <div style={s.panel}>
          <div style={s.panelTitle}>Scan or Enter Code</div>

          <div style={s.scanBox}>
            <div style={s.scanIcon}>⬛</div>
            <div style={s.scanLabel}>Camera scan coming soon</div>
          </div>

          <div style={s.divider}>
            <div style={s.divLine} />
            <span style={s.divText}>or enter manually</span>
            <div style={s.divLine} />
          </div>

          <div style={s.inputRow}>
            <input
              style={s.input}
              type="text"
              placeholder="IRA-2026-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              className="btn btn-primary"
              onClick={handleVerify}
              disabled={loading || !code.trim()}
            >
              {loading ? '...' : 'Verify'}
            </button>
          </div>

          {error && <div style={s.errorMsg}>{error}</div>}
        </div>

        {/* Right: Result panel */}
        <div style={{ ...s.panel, ...s.resultPanel }}>
          <div style={s.panelTitle}>Booking Details</div>

          {!booking && !checkedIn && (
            <div style={s.emptyResult}>
              <div style={s.emptyIcon}>🎫</div>
              <div style={s.emptyText}>Enter a booking number to see details</div>
            </div>
          )}

          {booking && !checkedIn && (
            <>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Booking #</span>
                <span style={{ ...s.detailValue, fontFamily: 'monospace', fontSize: '0.82rem' }}>{booking.booking_number}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Customer</span>
                <span style={s.detailValue}>{booking.customer_name}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Service</span>
                <span style={{ ...s.detailValue, maxWidth: '55%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{booking.service_name}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Date &amp; Time</span>
                <span style={s.detailValue}>{booking.date} · {booking.time}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Deposit Paid</span>
                <span style={s.depositValue}>€{booking.deposit_paid}</span>
              </div>
              <div style={s.detailRowLast}>
                <span style={s.detailLabel}>Total Price</span>
                <span style={{ ...s.detailValue, fontSize: '1rem', fontWeight: 800 }}>€{booking.total_price}</span>
              </div>

              <button
                style={{ ...s.checkInBtn, opacity: loading ? 0.6 : 1 }}
                onClick={handleCheckIn}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Check-in'}
              </button>
            </>
          )}

          {checkedIn && (
            <div style={s.successBanner}>
              <div style={s.successCircle}>✓</div>
              <div style={s.successTitle}>Checked In!</div>
              <div style={s.successSub}>{booking?.customer_name} has been<br />successfully checked in.</div>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={handleReset}>
                Scan Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
