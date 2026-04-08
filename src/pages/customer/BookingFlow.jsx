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

const STEPS = ['Date', 'Time', 'Details', 'Confirm'];

const s = {
  stepWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    marginBottom: 32,
  },
  stepCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  stepColLast: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 0,
  },
  stepCircleRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: (state) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.2s',
    background: state === 'active' ? '#242424' : state === 'done' ? 'rgba(22,163,74,0.12)' : 'var(--bg-surface)',
    color: state === 'active' ? '#ffffff' : state === 'done' ? '#16a34a' : 'var(--text-muted)',
    boxShadow: state === 'active' ? '0 2px 8px rgba(34,42,53,0.25)' : 'var(--shadow-sm)',
  }),
  stepLine: (done) => ({
    flex: 1,
    height: 1,
    background: done ? 'rgba(22,163,74,0.3)' : 'var(--border-muted)',
    margin: '0 4px',
  }),
  stepLabel: (active) => ({
    fontSize: '0.72rem',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    marginTop: 6,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  }),
  serviceCard: {
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 14,
  },
  dateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 6,
    marginBottom: 24,
  },
  datePill: (active, isToday) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '10px 4px',
    borderRadius: 'var(--radius-md)',
    border: active ? '1.5px solid #242424' : '1px solid var(--border-muted)',
    background: active ? '#242424' : 'var(--bg-card)',
    cursor: 'pointer',
    transition: 'all 0.12s',
    boxShadow: active ? '0 2px 8px rgba(34,42,53,0.15)' : 'var(--shadow-sm)',
  }),
  dateDow: (active) => ({
    fontSize: '0.65rem',
    fontWeight: 600,
    color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),
  dateNum: (active) => ({
    fontSize: '0.95rem',
    fontWeight: 700,
    color: active ? '#ffffff' : 'var(--text-main)',
  }),
  timeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginBottom: 24,
  },
  timePill: (active, disabled) => ({
    padding: '11px 8px',
    borderRadius: 'var(--radius-md)',
    border: active ? '1.5px solid #242424' : disabled ? '1px solid var(--border-muted)' : '1px solid var(--border-muted)',
    background: active ? '#242424' : disabled ? 'var(--bg-surface)' : 'var(--bg-card)',
    color: active ? '#ffffff' : disabled ? 'var(--text-subtle)' : 'var(--text-main)',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'center',
    boxShadow: active ? '0 2px 8px rgba(34,42,53,0.15)' : disabled ? 'none' : 'var(--shadow-sm)',
    transition: 'all 0.12s',
    textDecoration: disabled ? 'line-through' : 'none',
  }),
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  formInput: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  summaryCard: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 18px',
    fontSize: '0.875rem',
    borderBottom: '1px solid var(--border-muted)',
  },
  summaryRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 18px',
    fontSize: '0.875rem',
  },
  summaryLabel: { color: 'var(--text-muted)' },
  summaryValue: { fontWeight: 600 },
  btnRow: {
    display: 'flex',
    gap: 10,
    marginTop: 24,
  },
  backBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  nextBtn: (disabled) => ({
    flex: 2,
    padding: '11px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: disabled ? 'rgba(34,42,53,0.1)' : '#242424',
    color: disabled ? 'var(--text-muted)' : '#ffffff',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  }),
  error: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(220,38,38,0.07)',
    color: '#b91c1c',
    fontSize: '0.85rem',
    marginTop: 10,
    border: '1px solid rgba(220,38,38,0.12)',
  },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      } catch { /* use mock */ }
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
    } catch {
      setError('Booking failed. Please try again.');
      navigate(`/booking/demo-123`);
    } finally {
      setSubmitting(false);
    }
  }

  const stepState = (n) => n < step ? 'done' : n === step ? 'active' : 'idle';

  return (
    <div className="animate-up">
      {/* Step Indicator */}
      <div style={s.stepWrap}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const isLast = i === STEPS.length - 1;
          return (
            <React.Fragment key={label}>
              <div style={isLast ? s.stepColLast : s.stepCol}>
                <div style={s.stepCircleRow}>
                  <div style={s.stepCircle(stepState(n))}>
                    {stepState(n) === 'done' ? '✓' : n}
                  </div>
                  {!isLast && <div style={s.stepLine(n < step)} />}
                </div>
                <div style={s.stepLabel(n === step)}>{label}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Service Summary */}
      <div style={s.serviceCard}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{service.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{service.shop_name}</div>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>€{service.price}</div>
      </div>

      {/* Step 1 — Date */}
      {step === 1 && (
        <div>
          <div style={s.sectionLabel}>Select a Date</div>
          <div style={s.dateGrid}>
            {days.map((d) => {
              const iso = formatDateISO(d);
              const active = selectedDate && formatDateISO(selectedDate) === iso;
              return (
                <div key={iso} style={s.datePill(active, false)} onClick={() => setSelectedDate(d)}>
                  <div style={s.dateDow(active)}>{DAYS[d.getDay()]}</div>
                  <div style={s.dateNum(active)}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => navigate(-1)}>Back</button>
            <button style={s.nextBtn(!selectedDate)} disabled={!selectedDate} onClick={() => selectedDate && setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Time */}
      {step === 2 && (
        <div>
          <div style={s.sectionLabel}>Select a Time</div>
          {selectedDate && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              {formatDate(selectedDate)}
            </div>
          )}
          <div style={s.timeGrid}>
            {mockSlots.map((t) => {
              const disabled = unavailable.has(t);
              return (
                <div key={t} style={s.timePill(selectedTime === t, disabled)} onClick={() => !disabled && setSelectedTime(t)}>
                  {t}
                </div>
              );
            })}
          </div>
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(1)}>Back</button>
            <button style={s.nextBtn(!selectedTime)} disabled={!selectedTime} onClick={() => selectedTime && setStep(3)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Details */}
      {step === 3 && (
        <div>
          <div style={s.sectionLabel}>Your Details</div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Full Name</label>
            <input
              style={s.formInput}
              type="text"
              placeholder="John Smith"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(34,42,53,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,42,53,0.06), var(--shadow-sm)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-muted)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Phone Number</label>
            <input
              style={s.formInput}
              type="tel"
              placeholder="+353 8X XXX XXXX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(34,42,53,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,42,53,0.06), var(--shadow-sm)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-muted)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
            />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>Note <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              style={{ ...s.formInput, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="Anything we should know about your device?"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </div>
          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(2)}>Back</button>
            <button style={s.nextBtn(!customerName || !customerPhone)} disabled={!customerName || !customerPhone} onClick={() => (customerName && customerPhone) && setStep(4)}>
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Confirm */}
      {step === 4 && (
        <div>
          <div style={s.sectionLabel}>Review & Pay</div>

          <div style={s.summaryCard}>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Service</span><span style={s.summaryValue}>{service.name}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Shop</span><span style={s.summaryValue}>{service.shop_name}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Date</span><span style={s.summaryValue}>{selectedDate ? formatDate(selectedDate) : ''}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Time</span><span style={s.summaryValue}>{selectedTime}</span></div>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Name</span><span style={s.summaryValue}>{customerName}</span></div>
            <div style={s.summaryRowLast}><span style={s.summaryLabel}>Phone</span><span style={s.summaryValue}>{customerPhone}</span></div>
          </div>

          <div style={s.summaryCard}>
            <div style={s.summaryRow}><span style={s.summaryLabel}>Service Total</span><span style={s.summaryValue}>€{service.price}</span></div>
            <div style={s.summaryRow}>
              <span style={s.summaryLabel}>Deposit (20%) — Pay Now</span>
              <span style={{ ...s.summaryValue, color: '#16a34a' }}>€{deposit}</span>
            </div>
            <div style={s.summaryRowLast}>
              <span style={s.summaryLabel}>Remaining at Shop</span>
              <span style={s.summaryValue}>€{dueAtShop}</span>
            </div>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <div style={s.btnRow}>
            <button style={s.backBtn} onClick={() => setStep(3)}>Back</button>
            <button style={s.nextBtn(submitting)} disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Processing...' : `Pay Deposit €${deposit}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
