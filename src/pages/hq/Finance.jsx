import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockDeposits = [
  { id: '1', date: '2026-03-31', booking_number: 'IRA-20260331-A1B2', customer_name: 'Sarah Murphy', amount: 59.80, status: 'paid' },
  { id: '2', date: '2026-03-30', booking_number: 'IRA-20260330-C3D4', customer_name: 'James Kelly', amount: 15.80, status: 'paid' },
  { id: '3', date: '2026-03-29', booking_number: 'IRA-20260329-E5F6', customer_name: 'Emma Lynch', amount: 17.80, status: 'refunded' },
  { id: '4', date: '2026-03-28', booking_number: 'IRA-20260328-G7H8', customer_name: 'Liam O\'Brien', amount: 49.80, status: 'forfeited' },
  { id: '5', date: '2026-03-27', booking_number: 'IRA-20260327-I9J0', customer_name: 'Aoife Ryan', amount: 25.80, status: 'paid' },
];

const mockCommissions = [
  { id: '1', date: '2026-03-31', booking_number: 'IRA-20260331-A1B2', merchant_name: "O'Neill's Repairs", service_price: 299, rate: 10, commission_amount: 29.90 },
  { id: '2', date: '2026-03-30', booking_number: 'IRA-20260330-C3D4', merchant_name: 'CorkFix Mobile', service_price: 79, rate: 5, commission_amount: 3.95 },
  { id: '3', date: '2026-03-29', booking_number: 'IRA-20260329-K1L2', merchant_name: "O'Neill's Repairs", service_price: 89, rate: 10, commission_amount: 8.90 },
  { id: '4', date: '2026-03-28', booking_number: 'IRA-20260328-M3N4', merchant_name: 'Galway Phone Clinic', service_price: 249, rate: 0, commission_amount: 0 },
];

const mockSettlements = [
  { id: '1', date: '2026-03-30', claim_number: 'CLM-001', original_shop: "O'Neill's Repairs", servicing_shop: 'CorkFix Mobile', amount: 315, status: 'settled' },
  { id: '2', date: '2026-03-28', claim_number: 'CLM-002', original_shop: 'CorkFix Mobile', servicing_shop: 'Galway Phone Clinic', amount: 95, status: 'approved' },
  { id: '3', date: '2026-03-25', claim_number: 'CLM-003', original_shop: "O'Neill's Repairs", servicing_shop: 'CorkFix Mobile', amount: 119, status: 'pending' },
];

const TABS = ['deposits', 'commissions', 'settlements'];

const statusColors = {
  paid:      { bg: 'rgba(0,208,132,0.15)',  color: '#00D084' },
  refunded:  { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  forfeited: { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
  pending:   { bg: 'rgba(234,179,8,0.15)',  color: '#EAB308' },
  approved:  { bg: 'rgba(0,208,132,0.15)',  color: '#00D084' },
  settled:   { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  rejected:  { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 20 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  summaryCard: (color) => ({ padding: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', background: 'var(--bg-card)', borderLeft: `3px solid ${color}` }),
  cardValue: { fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 },
  cardLabel: { fontSize: '0.85rem', color: 'var(--text-muted)' },
  filterBar: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  dateInput: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '8px 12px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem' },
  filterBtn: { padding: '8px 18px', borderRadius: 8, background: 'var(--primary-green)', color: '#000', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' },
  tabs: { display: 'flex', gap: 8, marginBottom: 20 },
  tab: (active) => ({ padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', border: active ? '1px solid var(--primary-green)' : '1px solid var(--border-muted)', background: active ? 'rgba(0,208,132,0.1)' : 'transparent', color: active ? 'var(--primary-green)' : 'var(--text-muted)' }),
  tableWrap: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', overflow: 'hidden' },
  badge: (status) => {
    const c = statusColors[status] || statusColors.pending;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600 };
  },
  actionBtn: (color) => ({ padding: '5px 12px', borderRadius: 8, background: `${color}22`, color, border: `1px solid ${color}44`, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }),
  muted: { color: 'var(--text-muted)', fontSize: '0.82rem' },
};

const depHeader = { display: 'grid', gridTemplateColumns: '90px 1.2fr 1fr 90px 80px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 };
const depRow = { display: 'grid', gridTemplateColumns: '90px 1.2fr 1fr 90px 80px', padding: '12px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 };
const comHeader = { display: 'grid', gridTemplateColumns: '90px 1.2fr 1.2fr 90px 60px 100px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 };
const comRow = { display: 'grid', gridTemplateColumns: '90px 1.2fr 1.2fr 90px 60px 100px', padding: '12px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 };
const setHeader = { display: 'grid', gridTemplateColumns: '90px 90px 1.2fr 1.2fr 90px 80px 140px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 };
const setRow = { display: 'grid', gridTemplateColumns: '90px 90px 1.2fr 1.2fr 90px 80px 140px', padding: '12px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 };

export default function Finance() {
  const [activeTab, setActiveTab] = useState('deposits');
  const [deposits, setDeposits] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [d, c, st] = await Promise.all([
          hqAPI.get('/finance/deposits'),
          hqAPI.get('/finance/commissions'),
          hqAPI.get('/finance/settlements'),
        ]);
        setDeposits(d.data?.data || d.data || []);
        setCommissions(c.data?.data || c.data || []);
        setSettlements(st.data?.data || st.data || []);
      } catch {
        setDeposits(mockDeposits);
        setCommissions(mockCommissions);
        setSettlements(mockSettlements);
      }
    };
    load();
  }, []);

  const totalDeposits = deposits.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const outstandingSettlements = settlements.filter(st => st.status === 'pending' || st.status === 'approved').reduce((sum, st) => sum + st.amount, 0);

  const handleSettlementAction = async (id, action) => {
    try { await hqAPI.post(`/warranty-claims/${id}/${action}`); } catch { /* demo */ }
    const newStatus = action === 'approve' ? 'approved' : action === 'settle' ? 'settled' : 'rejected';
    setSettlements(prev => prev.map(st => st.id === id ? { ...st, status: newStatus } : st));
  };

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Finance</h2>

      <div style={s.summaryGrid}>
        <div style={s.summaryCard('var(--primary-green)')}>
          <div style={s.cardValue}>&euro;{totalDeposits.toFixed(2)}</div>
          <div style={s.cardLabel}>Total Deposits (Paid)</div>
        </div>
        <div style={s.summaryCard('#3B82F6')}>
          <div style={s.cardValue}>&euro;{totalCommission.toFixed(2)}</div>
          <div style={s.cardLabel}>Commission Earned</div>
        </div>
        <div style={s.summaryCard('#EAB308')}>
          <div style={s.cardValue}>&euro;{outstandingSettlements.toFixed(2)}</div>
          <div style={s.cardLabel}>Outstanding Settlements</div>
        </div>
      </div>

      <div style={s.filterBar}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter:</span>
        <input type="date" style={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span style={{ color: 'var(--text-muted)' }}>to</span>
        <input type="date" style={s.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button style={s.filterBtn}>Apply</button>
      </div>

      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t} style={s.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        {activeTab === 'deposits' && (
          <>
            <div style={depHeader}><span>Date</span><span>Booking #</span><span>Customer</span><span>Amount</span><span>Status</span></div>
            {deposits.map(d => (
              <div key={d.id} style={depRow}>
                <span>{d.date}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{d.booking_number}</span>
                <span>{d.customer_name}</span>
                <span style={{ fontWeight: 600 }}>&euro;{d.amount.toFixed(2)}</span>
                <span style={s.badge(d.status)}>{d.status}</span>
              </div>
            ))}
            {deposits.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No deposit records</div>}
          </>
        )}

        {activeTab === 'commissions' && (
          <>
            <div style={comHeader}><span>Date</span><span>Booking #</span><span>Merchant</span><span>Svc Price</span><span>Rate</span><span>Commission</span></div>
            {commissions.map(c => (
              <div key={c.id} style={comRow}>
                <span>{c.date}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{c.booking_number}</span>
                <span>{c.merchant_name}</span>
                <span>&euro;{c.service_price.toFixed(2)}</span>
                <span>{c.rate}%</span>
                <span style={{ fontWeight: 600 }}>&euro;{c.commission_amount.toFixed(2)}</span>
              </div>
            ))}
            {commissions.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No commission records</div>}
          </>
        )}

        {activeTab === 'settlements' && (
          <>
            <div style={setHeader}><span>Date</span><span>Claim #</span><span>Original Shop</span><span>Servicing Shop</span><span>Amount</span><span>Status</span><span>Actions</span></div>
            {settlements.map(st => (
              <div key={st.id} style={setRow}>
                <span>{st.date}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{st.claim_number}</span>
                <span>{st.original_shop}</span>
                <span>{st.servicing_shop}</span>
                <span style={{ fontWeight: 600 }}>&euro;{st.amount.toFixed(2)}</span>
                <span style={s.badge(st.status)}>{st.status}</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {st.status === 'pending' && (
                    <>
                      <button style={s.actionBtn('#00D084')} onClick={() => handleSettlementAction(st.id, 'approve')}>Approve</button>
                      <button style={s.actionBtn('#EF4444')} onClick={() => handleSettlementAction(st.id, 'reject')}>Reject</button>
                    </>
                  )}
                  {st.status === 'approved' && <button style={s.actionBtn('#3B82F6')} onClick={() => handleSettlementAction(st.id, 'settle')}>Settle</button>}
                </span>
              </div>
            ))}
            {settlements.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No settlement records</div>}
          </>
        )}
      </div>
    </div>
  );
}
