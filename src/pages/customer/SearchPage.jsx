import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockShops = [
  { id: 1, slug: 'fix-it-dublin',  name: 'Fix-It Dublin',  rating: 4.8, review_count: 124, distance_km: 0.8, min_price: 49, address: '12 Grafton St, Dublin 2',    tags: ['Screen', 'Battery', 'Water'] },
  { id: 2, slug: 'iphone-clinic',  name: 'iPhone Clinic',  rating: 4.6, review_count: 89,  distance_km: 1.2, min_price: 39, address: '45 Henry St, Dublin 1',       tags: ['Screen', 'Battery'] },
  { id: 3, slug: 'phone-rescue',   name: 'Phone Rescue',   rating: 4.9, review_count: 201, distance_km: 2.1, min_price: 55, address: '8 Camden St, Dublin 2',        tags: ['Screen', 'Battery', 'Port'] },
  { id: 4, slug: 'screen-fix-pro', name: 'Screen Fix Pro', rating: 4.4, review_count: 67,  distance_km: 3.5, min_price: 35, address: '22 Parnell St, Dublin 1',      tags: ['Screen'] },
];

const sortOptions = [
  { key: 'distance', label: 'Nearest' },
  { key: 'rating',   label: 'Top Rated' },
  { key: 'price',    label: 'Lowest Price' },
];

const s = {
  toolbar: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: 200,
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 14px 9px 36px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  sortGroup: {
    display: 'flex',
    gap: 4,
    background: 'var(--bg-surface)',
    padding: 4,
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)',
  },
  sortBtn: (active) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    background: active ? '#ffffff' : 'transparent',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: active ? 'var(--shadow-sm)' : 'none',
    transition: 'all 0.12s',
  }),
  resultCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: 14,
    fontWeight: 500,
  },
  card: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    marginBottom: 14,
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  shopAvatar: {
    width: 48,
    height: 48,
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  shopName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    letterSpacing: '-0.01em',
  },
  priceTag: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    white_space: 'nowrap',
    flexShrink: 0,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    fontSize: '0.82rem',
  },
  starsWrap: {
    color: '#f59e0b',
    letterSpacing: '-1px',
    fontSize: '0.85rem',
  },
  ratingNum: {
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  ratingCount: {
    color: 'var(--text-muted)',
  },
  distChip: {
    marginLeft: 2,
    padding: '1px 7px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  address: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tags: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    padding: '2px 9px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(34,42,53,0.05)',
    color: 'var(--text-muted)',
    fontSize: '0.72rem',
    fontWeight: 500,
  },
};

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let out = '★'.repeat(full);
  if (half) out += '⭐';
  return out;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('distance');
  const [filterText, setFilterText] = useState(searchParams.get('q') || '');

  useEffect(() => {
    let cancelled = false;
    async function fetchShops() {
      setLoading(true);
      try {
        const params = {};
        if (searchParams.get('q')) params.q = searchParams.get('q');
        if (searchParams.get('brand_id')) params.brand_id = searchParams.get('brand_id');
        const res = await clientAPI.get('/browse/search', { params });
        if (!cancelled) setShops(res.data?.data || res.data || []);
      } catch {
        if (!cancelled) setShops(mockShops);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchShops();
    return () => { cancelled = true; };
  }, [searchParams]);

  const sorted = [...shops].sort((a, b) => {
    if (sort === 'price')  return (a.min_price || 0) - (b.min_price || 0);
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.distance_km || 0) - (b.distance_km || 0);
  });

  const filtered = filterText
    ? sorted.filter((sh) => sh.name.toLowerCase().includes(filterText.toLowerCase()))
    : sorted;

  return (
    <div className="animate-up">
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search shops or services..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filterText.trim()) {
                setSearchParams({ q: filterText.trim() });
              }
            }}
          />
        </div>
        <div style={s.sortGroup}>
          {sortOptions.map((opt) => (
            <button key={opt.key} style={s.sortBtn(sort === opt.key)} onClick={() => setSort(opt.key)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <div style={s.resultCount}>
          {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
          {searchParams.get('q') ? ` for "${searchParams.get('q')}"` : ''}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon">⏳</div>
          <div className="empty-state-title">Finding nearby shops...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No shops found</div>
          <div className="empty-state-desc">Try a different search or browse by brand on the home page.</div>
        </div>
      ) : (
        filtered.map((shop) => (
          <div
            key={shop.id || shop.slug}
            style={s.card}
            onClick={() => navigate(`/shop/${shop.slug}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={s.shopAvatar}>🏪</div>
            <div style={s.cardBody}>
              <div style={s.cardTop}>
                <div style={s.shopName}>{shop.name}</div>
                <div style={s.priceTag}>from €{shop.min_price || '--'}</div>
              </div>
              <div style={s.ratingRow}>
                <span style={s.starsWrap}>{'★'.repeat(Math.round(shop.rating || 0))}</span>
                <span style={s.ratingNum}>{shop.rating || 'N/A'}</span>
                <span style={s.ratingCount}>({shop.review_count || 0})</span>
                {shop.distance_km && (
                  <span style={s.distChip}>📍 {shop.distance_km} km</span>
                )}
              </div>
              <div style={s.address}>
                <span>📍</span>
                <span>{shop.address}</span>
              </div>
              {shop.tags && (
                <div style={s.tags}>
                  {shop.tags.map((tag) => (
                    <span key={tag} style={s.tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
