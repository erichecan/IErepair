import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockClaims = [
  { id: '1', created_at: '2026-03-28', warranty_number: 'IRA-W-20260215-A1B2', customer_name: 'Sarah Murphy',  device_name: 'iPhone 15 Pro',      service_name: 'Screen Replacement', original_merchant: "O'Neill's Repairs",  status: 'approved', total_compensation: 315 },
  { id: '2', created_at: '2026-03-30', warranty_number: 'IRA-W-20260301-C3D4', customer_name: 'James Kelly',   device_name: 'Samsung S24 Ultra',   service_name: 'Battery Replacement', original_merchant: 'CorkFix Mobile',     status: 'pending',  total_compensation: 95  },
  { id: '3', created_at: '2026-03-25', warranty_number: 'IRA-W-20260110-E5F6', customer_name: 'Emma Lynch',    device_name: 'iPhone 14',           service_name: 'Charging Port',       original_merchant: 'Galway Phone Clinic',status: 'settled',  total_compensation: 119 },
];

const STATUS_MAP = {
  pending:  { cls: 'badge-yellow', label: 'Pending'  },
  approved: { cls: 'badge-green',  label: 'Approved' },
  settled:  { cls: 'badge-blue',   label: 'Settled'  },
  rejected: { cls: 'badge-red',    label: 'Rejected' },
};

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
  tableWrap: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  tableHead: {
    display: 'grid',
    gridTemplateColumns: '90px 160px 1fr 1fr 1fr 90px 90px',
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    gap: 10,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '90px 160px 1fr 1fr 1fr 90px 90px',
    padding: '13px 20px',
    borderBottom: '1px solid var(--border-muted)',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.1s',
  },
  dateCell: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
  },
  warrantyNum: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  deviceCell: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  deviceSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  shopCell: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  customerCell: {
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'var(--text-main)',
  },
  amountCell: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-muted)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 24px',
    width: '100%',
    maxWidth: 480,
    boxShadow: 'var(--shadow-pop)',
  },
  modalTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 6,
    display: 'block',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    fontWeight: 600,
    outline: 'none',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
  },
  lookupResult: {
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--bg-surface)',
    marginBottom: 16,
  },
  lookupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    fontSize: '0.82rem',
    gap: 8,
  },
  lookupLabel: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  lookupValue: {
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'right',
  },
  compensationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0 0',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    borderTop: '1px solid var(--border-muted)',
    marginTop: 8,
  },
  lookupError: {
    fontSize: '0.78rem',
    color: '#b91c1c',
    marginTop: 6,
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    justifyContent: 'flex-end',
  },
};

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [warrantyNum, setWarrantyNum] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await merchantAPI.get('/warranty-claims');
        if (!cancelled) setClaims(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setClaims(mockClaims);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function lookupWarranty() {
    setLookupError('');
    setLookupResult(null);
    if (!warrantyNum.trim()) { setLookupError('Please enter a warranty number'); return; }
    setLookingUp(true);
    try {
      const res = await merchantAPI.get(`/warranty/${warrantyNum.trim()}`);
      setLookupResult(res.data?.data || res.data);
    } catch {
      if (warrantyNum.startsWith('IRA-W-')) {
        setLookupResult({
          warranty_number: warrantyNum, device_name: 'iPhone 15 Pro', service_name: 'Screen Replacement',
          original_merchant: "O'Neill's Repairs", start_date: '2026-02-15', end_date: '2026-08-14',
          status: 'active', base_cost: 285, labor_subsidy: 30, total_compensation: 315,
        });
      } else {
        setLookupError('Warranty not found or expired');
      }
    } finally {
      setLookingUp(false);
    }
  }

  async function submitClaim() {
    setSubmitting(true);
    try {
      await merchantAPI.post('/warranty-claims', { warranty_number: warrantyNum, customer_note: customerNote });
    } catch { /* demo */ }
    setClaims((prev) => [{
      id: Date.now().toString(),
      created_at: new Date().toISOString().slice(0, 10),
      warranty_number: warrantyNum,
      customer_name: 'New Customer',
      device_name: lookupResult.device_name,
      service_name: lookupResult.service_name,
      original_merchant: lookupResult.original_merchant,
      status: 'pending',
      total_compensation: lookupResult.total_compensation,
    }, ...prev]);
    setSubmitting(false);
    setShowModal(false);
    setWarrantyNum('');
    setLookupResult(null);
    setCustomerNote('');
  }

  const pendingCount = claims.filter((c) => c.status === 'pending').length;

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div>
          <div style={s.title}>Warranty Claims</div>
          <div style={s.subtitle}>
            {pendingCount > 0 ? `${pendingCount} pending claim${pendingCount !== 1 ? 's' : ''} · ` : ''}{claims.length} total
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Claim</button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Loading claims...</div>
        </div>
      ) : claims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <div className="empty-state-title">No warranty claims yet</div>
          <div className="empty-state-desc">When customers bring in devices for warranty repair, create a claim here.</div>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <div style={s.tableHead}>
            <span>Date</span>
            <span>Warranty #</span>
            <span>Device / Service</span>
            <span>Original Shop</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Amount</span>
          </div>
          {claims.map((c, idx) => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.pending;
            return (
              <div
                key={c.id}
                style={{ ...s.tableRow, borderBottom: idx < claims.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={s.dateCell}>{c.created_at?.slice(0, 10)}</span>
                <span style={s.warrantyNum}>{c.warranty_number}</span>
                <div>
                  <div style={s.deviceCell}>{c.device_name}</div>
                  <div style={s.deviceSub}>{c.service_name}</div>
                </div>
                <span style={s.shopCell}>{c.original_merchant}</span>
                <span style={s.customerCell}>{c.customer_name}</span>
                <span><span className={`badge ${st.cls}`}>{st.label}</span></span>
                <span style={s.amountCell}>€{c.total_compensation?.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTitle}>New Warranty Claim</div>

            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Warranty Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...s.modalInput, flex: 1 }}
                  placeholder="IRA-W-20260215-XXXX"
                  value={warrantyNum}
                  onChange={(e) => setWarrantyNum(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupWarranty()}
                />
                <button className="btn btn-secondary" onClick={lookupWarranty} disabled={lookingUp}>
                  {lookingUp ? '...' : 'Look Up'}
                </button>
              </div>
              {lookupError && <div style={s.lookupError}>{lookupError}</div>}
            </div>

            {lookupResult && (
              <>
                <div style={s.lookupResult}>
                  <div style={s.lookupRow}><span style={s.lookupLabel}>Device</span><span style={s.lookupValue}>{lookupResult.device_name}</span></div>
                  <div style={s.lookupRow}><span style={s.lookupLabel}>Service</span><span style={s.lookupValue}>{lookupResult.service_name}</span></div>
                  <div style={s.lookupRow}><span style={s.lookupLabel}>Original Shop</span><span style={s.lookupValue}>{lookupResult.original_merchant}</span></div>
                  <div style={s.lookupRow}><span style={s.lookupLabel}>Valid Period</span><span style={s.lookupValue}>{lookupResult.start_date} → {lookupResult.end_date}</span></div>
                  <div style={s.lookupRow}>
                    <span style={s.lookupLabel}>Status</span>
                    <span className="badge badge-green">{lookupResult.status}</span>
                  </div>
                  <div style={s.compensationRow}>
                    <span>Total Compensation</span>
                    <span style={{ color: '#16a34a' }}>€{lookupResult.total_compensation}</span>
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Customer Description</label>
                  <textarea
                    style={s.modalTextarea}
                    placeholder="Describe the issue the customer is experiencing..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                  />
                </div>

                <div style={s.modalActions}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={submitClaim} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </>
            )}

            {!lookupResult && (
              <div style={s.modalActions}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
