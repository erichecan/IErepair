import React, { useState, useEffect } from 'react';
import { clientAPI } from '../../api/client';

const mockWarranties = [
  { id: 'w1', warranty_number: 'WRN-2026-0088', device: 'iPhone 15 Pro', service_name: 'Screen Replacement', shop_name: 'Fix-It Dublin', valid_until: '2026-09-20', status: 'active' },
  { id: 'w2', warranty_number: 'WRN-2026-0065', device: 'Samsung S24', service_name: 'Battery Replacement', shop_name: 'Phone Rescue', valid_until: '2026-08-12', status: 'active' },
  { id: 'w3', warranty_number: 'WRN-2025-0041', device: 'iPhone 13', service_name: 'Screen Replacement', shop_name: 'iPhone Clinic', valid_until: '2025-11-01', status: 'expired' },
  { id: 'w4', warranty_number: 'WRN-2025-0022', device: 'Google Pixel 8', service_name: 'Charging Port', shop_name: 'Screen Fix Pro', valid_until: '2025-12-15', status: 'claimed' },
];

const STATUS_MAP = {
  active:  { cls: 'badge-green',  accent: '#16a34a',  label: 'Active',  icon: '🛡️' },
  expired: { cls: 'badge-gray',   accent: '#9ca3af',  label: 'Expired', icon: '⏰' },
  claimed: { cls: 'badge-yellow', accent: '#d97706',  label: 'Claimed', icon: '✅' },
};

const s = {
  header: {
    marginBottom: 24,
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
  summaryBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-sm)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    textAlign: 'center',
  },
  summaryNum: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  card: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 12,
    overflow: 'hidden',
    display: 'flex',
  },
  cardAccent: (color) => ({
    width: 4,
    background: color,
    flexShrink: 0,
  }),
  cardInner: {
    flex: 1,
    padding: '18px 20px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  warrantyNum: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.02em',
    fontFamily: 'monospace',
  },
  deviceName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    background: 'var(--border-muted)',
    marginBottom: 12,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  infoLabel: {
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  infoValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  validityNote: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

  const activeCount = warranties.filter((w) => w.status === 'active').length;
  const expiredCount = warranties.filter((w) => w.status === 'expired').length;
  const claimedCount = warranties.filter((w) => w.status === 'claimed').length;

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div style={s.title}>Warranty Wallet</div>
        <div style={s.subtitle}>Your IRA 180-day repair warranties, all in one place</div>
      </div>

      {!loading && warranties.length > 0 && (
        <div style={s.summaryBar}>
          <div style={s.summaryItem}>
            <div style={{ ...s.summaryNum, color: '#16a34a' }}>{activeCount}</div>
            <div style={s.summaryLabel}>Active</div>
          </div>
          <div style={s.summaryItem}>
            <div style={{ ...s.summaryNum, color: '#d97706' }}>{claimedCount}</div>
            <div style={s.summaryLabel}>Claimed</div>
          </div>
          <div style={s.summaryItem}>
            <div style={{ ...s.summaryNum, color: 'var(--text-muted)' }}>{expiredCount}</div>
            <div style={s.summaryLabel}>Expired</div>
          </div>
        </div>
      )}

      {loading ? (
        <div>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...s.card, cursor: 'default' }}>
              <div style={{ width: 4, background: 'var(--bg-surface)', flexShrink: 0 }} />
              <div style={{ ...s.cardInner }}>
                <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '50%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : warranties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <div className="empty-state-title">No warranties yet</div>
          <div className="empty-state-desc">Complete a repair at any IRA member shop to receive your digital warranty.</div>
        </div>
      ) : (
        warranties.map((w) => {
          const st = STATUS_MAP[w.status] || STATUS_MAP.active;
          const days = daysUntil(w.valid_until);
          return (
            <div key={w.id || w.warranty_number} style={s.card}>
              <div style={s.cardAccent(st.accent)} />
              <div style={s.cardInner}>
                <div style={s.cardTop}>
                  <span style={s.warrantyNum}>{w.warranty_number}</span>
                  <span className={`badge ${st.cls}`}>{st.icon} {st.label}</span>
                </div>
                <div style={s.deviceName}>{w.device}</div>
                <div style={s.serviceName}>{w.service_name}</div>
                <div style={s.divider} />
                <div style={s.infoRow}>
                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>Repaired At</span>
                    <span style={s.infoValue}>{w.shop_name}</span>
                  </div>
                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>Valid Until</span>
                    <span style={{ ...s.infoValue, color: w.status === 'expired' ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {w.valid_until}
                    </span>
                  </div>
                </div>
                {w.status === 'active' && days > 0 && (
                  <div style={s.validityNote}>
                    <span>⏱️</span>
                    <span>{days} day{days !== 1 ? 's' : ''} remaining · Valid at any IRA member shop</span>
                  </div>
                )}
                {w.status === 'expired' && (
                  <div style={s.validityNote}>
                    <span>⚠️</span>
                    <span>This warranty has expired</span>
                  </div>
                )}
                {w.status === 'claimed' && (
                  <div style={s.validityNote}>
                    <span>✅</span>
                    <span>Warranty claim has been processed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
