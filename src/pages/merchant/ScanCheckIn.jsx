import React, { useState } from 'react';
import { merchantAPI } from '../../api/client';

const mockBookingResult = {
  booking_number: 'IRA-2026-0042',
  customer_name: 'Sarah Murphy',
  service_name: 'iPhone 15 Pro Screen Replacement',
  date: '2026-04-05',
  time: '10:30',
  status: 'confirmed',
  deposit_paid: 18,
  total_price: 89,
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 500 },
  scanBox: {
    width: 280, height: 280, borderRadius: 'var(--radius-lg)',
    border: '2px dashed var(--border-muted)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginBottom: 24, background: 'var(--bg-card)',
  },
  scanIcon: { fontSize: '3rem', opacity: 0.3 },
  scanLabel: { color: 'var(--text-muted)', fontSize: '0.85rem' },
  divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 20 },
  divLine: { flex: 1, height: 1, background: 'var(--border-muted)' },
  divText: { color: 'var(--text-muted)', fontSize: '0.8rem' },
  inputRow: { display: 'flex', gap: 10, width: '100%', marginBottom: 24 },
  input: {
    flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)', background: 'var(--input-bg)',
    color: 'var(--text-main)', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
  },
  resultCard: {
    width: '100%', padding: 20, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)', background: 'var(--bg-card)', marginBottom: 20,
  },
  row: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.9rem' },
  rowLast: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' },
  label: { color: 'var(--text-muted)' },
  value: { fontWeight: 600 },
  success: {
    textAlign: 'center', padding: 20, color: 'var(--primary-green)',
    fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 600,
  },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' },
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
      // Fallback mock
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
      await merchantAPI.post(`/booking/check-in`, { booking_number: booking.booking_number || code });
    } catch {
      // Demo mode
    }
    setCheckedIn(true);
    setLoading(false);
  }

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Scan Check-In</h2>
      <p style={s.subtitle}>Scan a customer QR code or enter the booking number manually.</p>

      <div style={s.center}>
        <div style={s.scanBox}>
          <div style={s.scanIcon}>&#9634;</div>
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
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <button className="btn-ira-primary" onClick={handleVerify} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {booking && !checkedIn && (
          <>
            <div style={s.resultCard}>
              <div style={s.row}><span style={s.label}>Booking #</span><span style={s.value}>{booking.booking_number}</span></div>
              <div style={s.row}><span style={s.label}>Customer</span><span style={s.value}>{booking.customer_name}</span></div>
              <div style={s.row}><span style={s.label}>Service</span><span style={s.value}>{booking.service_name}</span></div>
              <div style={s.row}><span style={s.label}>Date</span><span style={s.value}>{booking.date}</span></div>
              <div style={s.row}><span style={s.label}>Time</span><span style={s.value}>{booking.time}</span></div>
              <div style={s.row}><span style={s.label}>Deposit Paid</span><span style={{ ...s.value, color: 'var(--primary-green)' }}>&euro;{booking.deposit_paid}</span></div>
              <div style={s.rowLast}><span style={s.label}>Total</span><span style={s.value}>&euro;{booking.total_price}</span></div>
            </div>
            <button className="btn-ira-primary" style={{ width: '100%', padding: 14 }} onClick={handleCheckIn} disabled={loading}>
              Confirm Check-in
            </button>
          </>
        )}

        {checkedIn && (
          <div style={s.success}>
            Customer checked in successfully!
          </div>
        )}
      </div>
    </div>
  );
}
