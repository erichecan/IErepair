import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const brands = [
  { id: 'apple',   name: 'Apple',   emoji: '🍎' },
  { id: 'samsung', name: 'Samsung', emoji: '📱' },
  { id: 'google',  name: 'Google',  emoji: '🔍' },
  { id: 'huawei',  name: 'Huawei',  emoji: '📡' },
  { id: 'xiaomi',  name: 'Xiaomi',  emoji: '⚡' },
  { id: 'other',   name: 'Other',   emoji: '📲' },
];

const services = [
  { label: 'Screen Repair',    icon: '🖥️', q: 'screen repair' },
  { label: 'Battery Replace',  icon: '🔋', q: 'battery' },
  { label: 'Water Damage',     icon: '💧', q: 'water damage' },
  { label: 'Charging Port',    icon: '🔌', q: 'charging port' },
];

const trust = [
  { icon: '🛡️', label: '180-Day Warranty', sub: 'On every repair' },
  { icon: '💰', label: 'Transparent Pricing', sub: 'No hidden fees' },
  { icon: '⚡', label: 'Same-Day Repairs', sub: 'Most jobs under 1 hour' },
  { icon: '🏪', label: '3,000+ Shops', sub: 'Across Ireland' },
];

const s = {
  hero: {
    textAlign: 'center',
    padding: '56px 0 48px',
    maxWidth: 600,
    margin: '0 auto',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 16,
    padding: '4px 12px',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-sm)',
  },
  headline: {
    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.04em',
    lineHeight: 1.15,
    marginBottom: 16,
  },
  sub: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: 36,
    maxWidth: 420,
    margin: '0 auto 36px',
  },
  searchWrap: {
    position: 'relative',
    maxWidth: 520,
    margin: '0 auto',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '15px 52px 15px 44px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxShadow: 'var(--shadow-card)',
  },
  searchBtn: {
    position: 'absolute',
    right: 6,
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#242424',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    padding: '8px 20px',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  section: {
    marginBottom: 48,
  },
  sectionLabel: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 16,
  },
  brandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 12,
  },
  brandCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '18px 8px',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  brandEmoji: {
    fontSize: '1.6rem',
  },
  brandName: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  serviceCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  serviceLabel: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    padding: '32px 0',
    borderTop: '1px solid var(--border-muted)',
  },
  trustItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  },
  trustIcon: {
    fontSize: '1.4rem',
  },
  trustLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  trustSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="animate-up">
      {/* Hero */}
      <div style={s.hero}>
        <span style={s.eyebrow}>Ireland's Repair Marketplace</span>
        <h1 style={s.headline}>Find expert device<br />repair near you</h1>
        <p style={s.sub}>Compare shops, read reviews, and book certified technicians — all in one place.</p>

        <form onSubmit={handleSearch} style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            type="text"
            placeholder="What needs fixing? e.g. iPhone screen..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" style={s.searchBtn}>Search</button>
        </form>
      </div>

      {/* Brand Quick-Select */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Shop by Brand</div>
        <div style={s.brandGrid}>
          {brands.map((b) => (
            <div
              key={b.id}
              style={s.brandCard}
              onClick={() => navigate(`/search?brand_id=${b.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={s.brandEmoji}>{b.emoji}</div>
              <span style={s.brandName}>{b.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Services */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Popular Repairs</div>
        <div style={s.serviceGrid}>
          {services.map((svc) => (
            <div
              key={svc.label}
              style={s.serviceCard}
              onClick={() => navigate(`/search?q=${encodeURIComponent(svc.q)}`)}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={s.serviceIcon}>{svc.icon}</div>
              <span style={s.serviceLabel}>{svc.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div style={s.trustGrid}>
        {trust.map((t) => (
          <div key={t.label} style={s.trustItem}>
            <div style={s.trustIcon}>{t.icon}</div>
            <div style={s.trustLabel}>{t.label}</div>
            <div style={s.trustSub}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
