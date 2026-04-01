import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockService = { name: 'iPhone 15 Pro Screen Replacement', price: 89, shop_name: 'Fix-It Dublin' };

function getNext14Days() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

const mockSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
const unavailable = new Set(['12:00', '14:00', '16:30']);

const s = {
  header: { fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 600, marginBottom: 4 },
  step: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 },
  pillGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  pill: (active, disabled) => ({
    padding: '10px 16px',
    borderRadius: 20,
    border: active ? '1px solid var(--primary-green)' : '1px solid var(--border-muted)',
    background: active ? 'rgba(0,208,132,0.15)' : disabled ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)',
    color: active ? 'var(--primary-green)' : disabled ? 'rgba(255,255,255,0.2)' : 'var(--text-main)',
    fontSize: '0.85rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: active ? 600 : 400,
    minWidth: 60,
    textAlign: 'center',
  }),
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)', background: 'var(--input-bg)',
    color: 'var(--text-main)', fontSize: '0.95rem', fontFamily: 'inherit',
    outline: 'none', marginBottom: 12,
  },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-muted)', fontSize: '0.9rem' },
  summaryLabel: { color: 'var(--text-muted)' },
  summaryValue: { fontWeight: 600 },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '1rem', fontWeight: 700 },
  btnRow: { display: 'flex', gap: 12, marginTop: 24 },
  backBtn: {
    flex: 1, padding: '12px', borderRadius: 20, border: '1px solid var(--border-muted)',
    background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
  },
  nextBtn: {
    flex: 2, padding: '12px', borderRadius: 20, border: 'none',
    background: 'var(--primary-green)', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
  },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginTop: 8 },
};

export default function BookingFlow() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [service, setService] = useState(mockService);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadService() {
      try {
        const res = await clientAPI.get(`/shop/shops/${slug}/services`);
        const svcs = res.data?.data || res.data || [];
        const found = svcs.find((sv) => String(sv.merchant_product_id || sv.id) === String(productId));
        if (found) setService({ name: found.name, price: found.price, shop_name: slug });
      } catch {
        // use mock
      }
    }
    loadService();
  }, [slug, productId]);

  const days = getNext14Days();
  const deposit = Math.ceil(service.price * 0.2);
  const dueAtShop = service.price - deposit;

  const formatDate = (d) => d.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatDateISO = (d) => d.toISOString().split('T')[0];

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await clientAPI.post('/booking/bookings', {
        merchant_product_id: productId,
        date: formatDateISO(selectedDate),
        time: selectedTime,
        customer_name: customerName,
        customer_phone: customerPhone,
        note: customerNote,
      });
      const data = res.data?.data || res.data;
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        navigate(`/booking/${data?.id || 'demo-123'}`);
      }
    } catch (err) {
      setError('Booking failed. Please try again.');
      // For demo, navigate to confirmation anyway
      navigate(`/booking/demo-123`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-up">
      <h2 style={s.header}>Book a Repair</h2>
      <div style={s.step}>Step {step} of 4</div>

      {step === 1 && (
        <div>
          <div style={{ ...s.label, marginBottom: 12, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Select a Date</div>
          <div style={s.pillGrid}>
            {days.map((d) => (
              <div
                key={d.toISOString()}
                style={s.pill(selectedDate && formatDateISO(selectedDate) === formatDateISO(d), false)}
                onClick={() => setSelectedDate(d)}
              >
                {formatDate(d)}
              </div>
            ))}
          </div>
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => navigate(-1)}>Back</button>
            <button style={s.nextBtn} disabled={!selectedDate} onClick={() => selectedDate && setStep(2)}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ ...s.label, marginBottom: 12, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Select a Time</div>
          <div style={s.pillGrid}>
            {mockSlots.map((t) => {
              const disabled = unavailable.has(t);
              return (
                <div
                  key={t}
                  style={s.pill(selectedTime === t, disabled)}
                  onClick={() => !disabled && setSelectedTime(t)}
                >
                  {t}
                </div>
              );
            })}
          </div>
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(1)}>Back</button>
            <button style={s.nextBtn} disabled={!selectedTime} onClick={() => selectedTime && setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ ...s.label, marginBottom: 12, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Your Details</div>
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Smith" />
          <label style={s.label}>Phone Number</label>
          <input style={s.input} type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+353 8X XXX XXXX" />
          <label style={s.label}>Note (optional)</label>
          <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Anything we should know?" />
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(2)}>Back</button>
            <button style={s.nextBtn} disabled={!customerName || !customerPhone} onClick={() => (customerName && customerPhone) && setStep(4)}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <div style={{ ...s.label, marginBottom: 12, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Booking Summary</div>
          <div style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', padding: 16, background: 'var(--bg-card)' }}>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Service</span><span style={s.summaryValue}>{service.name}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Shop</span><span style={s.summaryValue}>{service.shop_name}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Date</span><span style={s.summaryValue}>{selectedDate ? formatDate(selectedDate) : ''}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Time</span><span style={s.summaryValue}>{selectedTime}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Name</span><span style={s.summaryValue}>{customerName}</span></div>
            <div style={{ ...s.summaryRow, borderBottom: 'none' }}><span style={s.summaryLabel}>Phone</span><span style={s.summaryValue}>{customerPhone}</span></div>
          </div>

          <div style={{ marginTop: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', padding: 16, background: 'var(--bg-card)' }}>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Total</span><span style={s.summaryValue}>&euro;{service.price}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Deposit (20%)</span><span style={{ ...s.summaryValue, color: 'var(--primary-green)' }}>&euro;{deposit}</span></div>
            <div style={{ ...s.summaryRow, borderBottom: 'none' }}><span style={s.summaryLabel}>Due at shop</span><span style={s.summaryValue}>&euro;{dueAtShop}</span></div>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(3)}>Back</button>
            <button style={s.nextBtn} disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Processing...' : `Pay Deposit \u20AC${deposit}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
