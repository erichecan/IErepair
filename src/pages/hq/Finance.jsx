import React, { useState, useEffect } from 'react';
import { hqAPI } from '../../api/client';

const mockDeposits = [
  { id: '1', date: '2026-03-31', booking_number: 'IRA-20260331-A1B2', customer_name: 'Sarah Murphy', amount: 59.80, status: 'paid' },
  { id: '2', date: '2026-03-30', booking_number: 'IRA-20260330-C3D4', customer_name: 'James Kelly', amount: 15.80, status: 'paid' },
  { id: '3', date: '2026-03-29', booking_number: 'IRA-20260329-E5F6', customer_name: 'Emma Lynch', amount: 17.80, status: 'refunded' },
  { id: '4', date: '2026-03-28', booking_number: 'IRA-20260328-G7H8', customer_name: "Liam O'Brien", amount: 49.80, status: 'forfeited' },
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

const DEP_STATUS_MAP = {
  paid:      { cls: 'badge-green',  label: 'Paid'      },
  refunded:  { cls: 'badge-blue',   label: 'Refunded'  },
  forfeited: { cls: 'badge-red',    label: 'Forfeited' },
};

const SET_STATUS_MAP = {
  pending:  { cls: 'badge-yellow', label: 'Pending'  },
  approved: { cls: 'badge-green',  label: 'Approved' },
  settled:  { cls: 'badge-blue',   label: 'Settled'  },
  rejected: { cls: 'badge-red',    label: 'Rejected' },
};

const s = {
  header: {
    marginBottom: 28,
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: (accent) => ({
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '20px 24px',
    borderLeft: `3px solid ${accent}`,
  }),
  kpiValue: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.04em',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  filterBar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  dateInput: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: (cols) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    gap: 10,
  }),
  tableRow: (cols) => ({
    display: 'grid',
    gridTemplateColumns: cols,
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.1s',
  }),
  dateCell: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  monoCell: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  amountCell: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  rateCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
  },
};

const DEP_COLS = '90px 1.2fr 1fr 90px 80px';
const COM_COLS = '90px 1.2fr 1.2fr 90px 60px 100px';
const SET_COLS = '90px 90px 1.2fr 1.2fr 90px 80px 140px';

export default function Finance() {
  const [activeTab, setActiveTab] = useState('deposits');
  const [deposits, setDeposits] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [d, c, st] = await Promise.all([
          hqAPI.get('/finance/deposits'),
          hqAPI.get('/finance/commissions'),
          hqAPI.get('/finance/settlements'),
        ]);
        if (!cancelled) {
          setDeposits(d.data?.data || d.data || []);
          setCommissions(c.data?.data || c.data || []);
          setSettlements(st.data?.data || st.data || []);
        }
      } catch {
        if (!cancelled) {
          setDeposits(mockDeposits);
          setCommissions(mockCommissions);
          setSettlements(mockSettlements);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const totalDeposits = deposits.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const outstanding = settlements.filter((st) => st.status === 'pending' || st.status === 'approved').reduce((sum, st) => sum + st.amount, 0);

  const handleSettlementAction = async (id, action) => {
    try { await hqAPI.post(`/warranty-claims/${id}/${action}`); } catch { /* demo */ }
    const newStatus = action === 'approve' ? 'approved' : action === 'settle' ? 'settled' : 'rejected';
    setSettlements((prev) => prev.map((st) => st.id === id ? { ...st, status: newStatus } : st));
  };

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div style={s.title}>Finance</div>
        <div style={s.subtitle}>Deposits, commissions, and warranty settlements</div>
      </div>

      <div style={s.kpiGrid}>
        <div style={s.kpiCard('#16a34a')}>
          <div style={s.kpiValue}>€{totalDeposits.toFixed(2)}</div>
          <div style={s.kpiLabel}>Total Deposits Paid</div>
        </div>
        <div style={s.kpiCard('#2563eb')}>
          <div style={s.kpiValue}>€{totalCommission.toFixed(2)}</div>
          <div style={s.kpiLabel}>Commission Earned</div>
        </div>
        <div style={s.kpiCard('#d97706')}>
          <div style={s.kpiValue}>€{outstanding.toFixed(2)}</div>
          <div style={s.kpiLabel}>Outstanding Settlements</div>
        </div>
      </div>

      <div style={s.filterBar}>
        <span style={s.filterLabel}>Filter:</span>
        <input type="date" style={s.dateInput} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <span style={s.filterLabel}>to</span>
        <input type="date" style={s.dateInput} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Apply</button>
      </div>

      <div className="tab-bar" style={{ marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-item${activeTab === t ? ' active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        {activeTab === 'deposits' && (
          <>
            <div style={s.tableHead(DEP_COLS)}>
              <span>Date</span><span>Booking #</span><span>Customer</span><span>Amount</span><span>Status</span>
            </div>
            {deposits.map((d, idx) => {
              const st = DEP_STATUS_MAP[d.status] || DEP_STATUS_MAP.paid;
              return (
                <div
                  key={d.id}
                  style={{ ...s.tableRow(DEP_COLS), borderBottom: idx < deposits.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={s.dateCell}>{d.date}</span>
                  <span style={s.monoCell}>{d.booking_number}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{d.customer_name}</span>
                  <span style={s.amountCell}>€{d.amount.toFixed(2)}</span>
                  <span><span className={`badge ${st.cls}`}>{st.label}</span></span>
                </div>
              );
            })}
            {deposits.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No deposit records</div>}
          </>
        )}

        {activeTab === 'commissions' && (
          <>
            <div style={s.tableHead(COM_COLS)}>
              <span>Date</span><span>Booking #</span><span>Merchant</span><span>Svc Price</span><span>Rate</span><span>Commission</span>
            </div>
            {commissions.map((c, idx) => (
              <div
                key={c.id}
                style={{ ...s.tableRow(COM_COLS), borderBottom: idx < commissions.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={s.dateCell}>{c.date}</span>
                <span style={s.monoCell}>{c.booking_number}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{c.merchant_name}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>€{c.service_price.toFixed(2)}</span>
                <span style={s.rateCell}>{c.rate}%</span>
                <span style={s.amountCell}>€{c.commission_amount.toFixed(2)}</span>
              </div>
            ))}
            {commissions.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No commission records</div>}
          </>
        )}

        {activeTab === 'settlements' && (
          <>
            <div style={s.tableHead(SET_COLS)}>
              <span>Date</span><span>Claim #</span><span>Original Shop</span><span>Servicing Shop</span><span>Amount</span><span>Status</span><span>Actions</span>
            </div>
            {settlements.map((st, idx) => {
              const smap = SET_STATUS_MAP[st.status] || SET_STATUS_MAP.pending;
              return (
                <div
                  key={st.id}
                  style={{ ...s.tableRow(SET_COLS), borderBottom: idx < settlements.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={s.dateCell}>{st.date}</span>
                  <span style={s.monoCell}>{st.claim_number}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.original_shop}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.servicing_shop}</span>
                  <span style={s.amountCell}>€{st.amount.toFixed(2)}</span>
                  <span><span className={`badge ${smap.cls}`}>{smap.label}</span></span>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {st.status === 'pending' && (
                      <>
                        <button
                          style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(22,163,74,0.2)', background: 'rgba(22,163,74,0.05)', color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                          onClick={() => handleSettlementAction(st.id, 'approve')}
                        >Approve</button>
                        <button
                          style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                          onClick={() => handleSettlementAction(st.id, 'reject')}
                        >Reject</button>
                      </>
                    )}
                    {st.status === 'approved' && (
                      <button
                        style={{ padding: '4px 9px', fontSize: '0.72rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)', color: '#2563eb', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                        onClick={() => handleSettlementAction(st.id, 'settle')}
                      >Settle</button>
                    )}
                  </div>
                </div>
              );
            })}
            {settlements.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No settlement records</div>}
          </>
        )}
      </div>
    </div>
  );
}
