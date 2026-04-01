import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../api/client';

const mockWarranties = [
  { id: 'w1', warranty_number: 'WRN-2026-0088', device: 'iPhone 15 Pro', service_name: 'Screen Replacement', shop_name: 'Fix-It Dublin', valid_until: '2026-09-20', status: 'active' },
  { id: 'w2', warranty_number: 'WRN-2026-0065', device: 'Samsung S24', service_name: 'Battery Replacement', shop_name: 'Phone Rescue', valid_until: '2026-08-12', status: 'active' },
  { id: 'w3', warranty_number: 'WRN-2025-0041', device: 'iPhone 13', service_name: 'Screen Replacement', shop_name: 'iPhone Clinic', valid_until: '2025-11-01', status: 'expired' },
  { id: 'w4', warranty_number: 'WRN-2025-0022', device: 'Google Pixel 8', service_name: 'Charging Port', shop_name: 'Screen Fix Pro', valid_until: '2025-12-15', status: 'claimed' },
];

const statusStyle = {
  active: { bg: 'rgba(0,208,132,0.15)', color: '#00D084' },
  expired: { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
  claimed: { bg: 'rgba(234,179,8,0.15)', color: '#EAB308' },
};

const s = {
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 },
  card: {
    padding: 16, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)', background: 'var(--bg-card)',
    marginBottom: 14, position: 'relative', overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  warrantyNum: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '0.95rem' },
  badge: (status) => {
    const c = statusStyle[status] || statusStyle.active;
    return { display: 'inline-block', padding: '3px 10px', borderRadius: 12, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' };
  },
  device: { fontSize: '0.95rem', fontWeight: 500, marginBottom: 4 },
  meta: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 },
  note: {
    fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic',
    marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-muted)',
  },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
};

export default function WarrantyWallet() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await clientAPI.get('/warranty/warranties');
        if (!cancelled) setWarranties(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setWarranties(mockWarranties);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Warranty Wallet</h2>

      {loading ? (
        <div style={s.empty}>Loading warranties...</div>
      ) : warranties.length === 0 ? (
        <div style={s.empty}>No warranties yet. Complete a repair to get your digital warranty.</div>
      ) : (
        warranties.map((w) => {
          const accentColor = statusStyle[w.status]?.color || '#00D084';
          return (
            <div key={w.id || w.warranty_number} style={s.card}>
              <div style={{ ...s.cardAccent, background: accentColor }} />
              <div style={{ paddingLeft: 8 }}>
                <div style={s.top}>
                  <span style={s.warrantyNum}>{w.warranty_number}</span>
                  <span style={s.badge(w.status)}>{w.status}</span>
                </div>
                <div style={s.device}>{w.device} - {w.service_name}</div>
                <div style={s.meta}>Repaired at: {w.shop_name}</div>
                <div style={s.meta}>Valid until: {w.valid_until}</div>
                <div style={s.note}>Valid at any IRA member shop</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
