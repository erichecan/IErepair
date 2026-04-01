import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockShops = [
  { id: 1, slug: 'fix-it-dublin', name: 'Fix-It Dublin', rating: 4.8, review_count: 124, distance_km: 0.8, min_price: 49, address: '12 Grafton St, Dublin 2' },
  { id: 2, slug: 'iphone-clinic', name: 'iPhone Clinic', rating: 4.6, review_count: 89, distance_km: 1.2, min_price: 39, address: '45 Henry St, Dublin 1' },
  { id: 3, slug: 'phone-rescue', name: 'Phone Rescue', rating: 4.9, review_count: 201, distance_km: 2.1, min_price: 55, address: '8 Camden St, Dublin 2' },
  { id: 4, slug: 'screen-fix-pro', name: 'Screen Fix Pro', rating: 4.4, review_count: 67, distance_km: 3.5, min_price: 35, address: '22 Parnell St, Dublin 1' },
];

const s = {
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: 12,
  },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' },
  sortBtn: (active) => ({
    padding: '8px 16px',
    borderRadius: 20,
    border: active ? '1px solid var(--primary-green)' : '1px solid var(--border-muted)',
    background: active ? 'rgba(0,208,132,0.12)' : 'transparent',
    color: active ? 'var(--primary-green)' : 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }),
  card: {
    padding: 16,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)',
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  shopName: { fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' },
  priceTag: { fontSize: '1rem', fontWeight: 700, color: 'var(--primary-green)' },
  meta: { display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 },
  address: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 },
  bookBtn: { padding: '8px 20px', borderRadius: 20, border: 'none', background: 'var(--primary-green)', color: '#000', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
};

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let out = '';
  for (let i = 0; i < full; i++) out += '\u2605';
  if (half) out += '\u2606';
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
    if (sort === 'price') return (a.min_price || 0) - (b.min_price || 0);
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.distance_km || 0) - (b.distance_km || 0);
  });

  const filtered = filterText
    ? sorted.filter((sh) => sh.name.toLowerCase().includes(filterText.toLowerCase()))
    : sorted;

  return (
    <div className="animate-up">
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
      <div style={s.filterBar}>
        {['distance', 'price', 'rating'].map((key) => (
          <button key={key} style={s.sortBtn(sort === key)} onClick={() => setSort(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={s.empty}>Loading shops...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>No shops found. Try a different search.</div>
      ) : (
        filtered.map((shop) => (
          <div
            key={shop.id || shop.slug}
            style={s.card}
            onClick={() => navigate(`/shop/${shop.slug}`)}
          >
            <div style={s.cardTop}>
              <div style={s.shopName}>{shop.name}</div>
              <div style={s.priceTag}>from &euro;{shop.min_price || '--'}</div>
            </div>
            <div style={s.meta}>
              <span style={{ color: '#FFD700' }}>{renderStars(shop.rating || 0)}</span>
              <span>{shop.rating || 'N/A'} ({shop.review_count || 0})</span>
              <span>{shop.distance_km ? `${shop.distance_km} km` : ''}</span>
            </div>
            <div style={s.address}>{shop.address}</div>
            <button
              className="btn-ira-primary"
              onClick={(e) => { e.stopPropagation(); navigate(`/shop/${shop.slug}`); }}
            >
              Book Now
            </button>
          </div>
        ))
      )}
    </div>
  );
}
