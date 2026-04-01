import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const mockClaims = [
  { id: '1', created_at: '2026-03-28', warranty_number: 'IRA-W-20260215-A1B2', customer_name: 'Sarah Murphy', device_name: 'iPhone 15 Pro', service_name: 'Screen Replacement', original_merchant: "O'Neill's Repairs", status: 'approved', total_compensation: 315 },
  { id: '2', created_at: '2026-03-30', warranty_number: 'IRA-W-20260301-C3D4', customer_name: 'James Kelly', device_name: 'Samsung S24 Ultra', service_name: 'Battery Replacement', original_merchant: 'CorkFix Mobile', status: 'pending', total_compensation: 95 },
  { id: '3', created_at: '2026-03-25', warranty_number: 'IRA-W-20260110-E5F6', customer_name: 'Emma Lynch', device_name: 'iPhone 14', service_name: 'Charging Port', original_merchant: 'Galway Phone Clinic', status: 'settled', total_compensation: 119 },
];

const statusColors = {
  pending:  { bg: 'rgba(234,179,8,0.15)',  color: '#EAB308' },
  approved: { bg: 'rgba(0,208,132,0.15)',  color: '#00D084' },
  settled:  { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  rejected: { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' },
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  primaryBtn: { background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none', padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem' },
  ghostBtn: { padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  tableWrap: { borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', overflow: 'hidden' },
  tableHeader: { display: 'grid', gridTemplateColumns: '90px 1.3fr 1.2fr 1.2fr 1fr 80px 90px', padding: '14px 20px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, gap: 10 },
  tableRow: { display: 'grid', gridTemplateColumns: '90px 1.3fr 1.2fr 1.2fr 1fr 80px 90px', padding: '14px 20px', borderTop: '1px solid var(--border-muted)', alignItems: 'center', fontSize: '0.88rem', gap: 10 },
  badge: (status) => {
    const c = statusColors[status] || statusColors.pending;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600 };
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'var(--bg-sidebar)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 500 },
  modalTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 },
  input: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' },
  textarea: { background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 70, fontSize: '0.9rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  lookupResult: { padding: 16, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)', background: 'var(--bg-card)', marginBottom: 16 },
  lookupField: { fontSize: '0.85rem', marginBottom: 6 },
  lookupLabel: { color: 'var(--text-muted)', marginRight: 8 },
};

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [warrantyNum, setWarrantyNum] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await merchantAPI.get('/warranty-claims');
        setClaims(res.data?.data || res.data || []);
      } catch {
        setClaims(mockClaims);
      }
    };
    load();
  }, []);

  const lookupWarranty = async () => {
    setLookupError('');
    setLookupResult(null);
    if (!warrantyNum.trim()) { setLookupError('Please enter a warranty number'); return; }
    if (warrantyNum.startsWith('IRA-W-')) {
      setLookupResult({
        warranty_number: warrantyNum, device_name: 'iPhone 15 Pro', service_name: 'Screen Replacement',
        original_merchant: "O'Neill's Repairs", start_date: '2026-02-15', end_date: '2026-08-14',
        status: 'active', base_cost: 285, labor_subsidy: 30, total_compensation: 315,
      });
    } else {
      setLookupError('Warranty not found or expired');
    }
  };

  const submitClaim = async () => {
    try { await merchantAPI.post('/warranty-claims', { warranty_number: warrantyNum, customer_note: customerNote }); } catch { /* demo */ }
    setClaims(prev => [{ id: Date.now().toString(), created_at: new Date().toISOString().slice(0, 10), warranty_number: warrantyNum, customer_name: 'Customer', device_name: lookupResult.device_name, service_name: lookupResult.service_name, original_merchant: lookupResult.original_merchant, status: 'pending', total_compensation: lookupResult.total_compensation }, ...prev]);
    setShowModal(false); setWarrantyNum(''); setLookupResult(null); setCustomerNote('');
  };

  return (
    <div className="animate-up">
      <div style={s.topBar}>
        <h2 style={s.heading}>Warranty Claims</h2>
        <button style={s.primaryBtn} onClick={() => setShowModal(true)}>+ New Claim</button>
      </div>

      <div style={s.tableWrap}>
        <div style={s.tableHeader}>
          <span>Date</span><span>Warranty #</span><span>Device / Service</span>
          <span>Original Shop</span><span>Customer</span><span>Status</span><span>Amount</span>
        </div>
        {claims.map(c => (
          <div key={c.id} style={s.tableRow}>
            <span>{c.created_at?.slice(0, 10)}</span>
            <span style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{c.warranty_number}</span>
            <span>{c.device_name}<br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.service_name}</span></span>
            <span>{c.original_merchant}</span>
            <span>{c.customer_name}</span>
            <span style={s.badge(c.status)}>{c.status}</span>
            <span style={{ fontWeight: 600 }}>&euro;{c.total_compensation?.toFixed(2)}</span>
          </div>
        ))}
        {claims.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No warranty claims yet</div>}
      </div>

      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>New Warranty Claim</h3>
            <div style={s.field}>
              <label style={s.label}>Warranty Number</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input style={{ ...s.input, flex: 1 }} placeholder="IRA-W-20260215-XXXX" value={warrantyNum} onChange={e => setWarrantyNum(e.target.value)} />
                <button style={s.ghostBtn} onClick={lookupWarranty}>Look Up</button>
              </div>
              {lookupError && <span style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: 4 }}>{lookupError}</span>}
            </div>

            {lookupResult && (
              <>
                <div style={s.lookupResult}>
                  <div style={s.lookupField}><span style={s.lookupLabel}>Device:</span>{lookupResult.device_name}</div>
                  <div style={s.lookupField}><span style={s.lookupLabel}>Service:</span>{lookupResult.service_name}</div>
                  <div style={s.lookupField}><span style={s.lookupLabel}>Original Shop:</span>{lookupResult.original_merchant}</div>
                  <div style={s.lookupField}><span style={s.lookupLabel}>Valid:</span>{lookupResult.start_date} to {lookupResult.end_date}</div>
                  <div style={s.lookupField}><span style={s.lookupLabel}>Status:</span><span style={s.badge(lookupResult.status)}>{lookupResult.status}</span></div>
                  <div style={{ ...s.lookupField, marginTop: 10, fontWeight: 600 }}>
                    <span style={s.lookupLabel}>Compensation:</span>&euro;{lookupResult.base_cost} (parts) + &euro;{lookupResult.labor_subsidy} (labor) = &euro;{lookupResult.total_compensation}
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Customer Description</label>
                  <textarea style={s.textarea} placeholder="Describe the issue..." value={customerNote} onChange={e => setCustomerNote(e.target.value)} />
                </div>
                <div style={s.modalActions}>
                  <button style={s.ghostBtn} onClick={() => setShowModal(false)}>Cancel</button>
                  <button style={s.primaryBtn} onClick={submitClaim}>Submit Claim</button>
                </div>
              </>
            )}
            {!lookupResult && <div style={s.modalActions}><button style={s.ghostBtn} onClick={() => setShowModal(false)}>Cancel</button></div>}
          </div>
        </div>
      )}
    </div>
  );
}
