import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const brands = [
  { id: 'apple', name: 'Apple', icon: '\uF8FF' },
  { id: 'samsung', name: 'Samsung', icon: 'S' },
  { id: 'google', name: 'Google', icon: 'G' },
  { id: 'huawei', name: 'Huawei', icon: 'H' },
  { id: 'xiaomi', name: 'Xiaomi', icon: 'X' },
  { id: 'other', name: 'Other', icon: '...' },
];

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
    paddingTop: 16,
  },
  logo: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2.4rem',
    fontWeight: 700,
    color: 'var(--primary-green)',
    letterSpacing: '-1px',
  },
  headline: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  searchWrap: {
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    width: '100%',
  },
  brandCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '20px 8px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--primary-green)',
    fontFamily: "'Outfit', sans-serif",
  },
  brandName: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  trustBar: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginTop: 8,
    paddingTop: 16,
    borderTop: '1px solid var(--border-muted)',
    width: '100%',
  },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="animate-up" style={s.container}>
      <div style={s.logo}>IRA</div>
      <h1 style={s.headline}>Find the best repair near you</h1>

      <form style={s.searchWrap} onSubmit={handleSearch}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="What needs fixing?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div style={s.grid}>
        {brands.map((b) => (
          <div
            key={b.id}
            style={s.brandCard}
            onClick={() => navigate(`/search?brand_id=${b.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-green)';
              e.currentTarget.style.background = 'rgba(0,208,132,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.background = 'var(--bg-card)';
            }}
          >
            <div style={s.brandIcon}>{b.icon}</div>
            <span style={s.brandName}>{b.name}</span>
          </div>
        ))}
      </div>

      <div style={s.trustBar}>
        3000+ Shops &bull; 180-Day Warranty &bull; Transparent Pricing
      </div>
    </div>
  );
}
