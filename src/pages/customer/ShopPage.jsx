import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockShop = {
  name: 'Fix-It Dublin',
  slug: 'fix-it-dublin',
  address: '12 Grafton St, Dublin 2',
  city: 'Dublin',
  phone: '+353 1 234 5678',
  description: 'Professional device repair services with certified technicians. We specialise in screen replacements, battery swaps, and water damage recovery.',
  rating_avg: 4.8,
  review_count: 124,
  business_hours: [
    { day: 'Monday', open: '09:00', close: '18:00' },
    { day: 'Tuesday', open: '09:00', close: '18:00' },
    { day: 'Wednesday', open: '09:00', close: '18:00' },
    { day: 'Thursday', open: '09:00', close: '19:00' },
    { day: 'Friday', open: '09:00', close: '18:00' },
    { day: 'Saturday', open: '10:00', close: '16:00' },
    { day: 'Sunday', open: null, close: null },
  ],
};

const mockServices = [
  { id: 1, category: 'Screen Repair', name: 'iPhone 15 Pro Screen', price: 89, merchant_product_id: 'mp-1' },
  { id: 2, category: 'Screen Repair', name: 'iPhone 14 Screen', price: 69, merchant_product_id: 'mp-2' },
  { id: 3, category: 'Screen Repair', name: 'Samsung S24 Screen', price: 79, merchant_product_id: 'mp-3' },
  { id: 4, category: 'Battery', name: 'iPhone 15 Battery', price: 49, merchant_product_id: 'mp-4' },
  { id: 5, category: 'Battery', name: 'Samsung S24 Battery', price: 45, merchant_product_id: 'mp-5' },
  { id: 6, category: 'Other', name: 'Water Damage Assessment', price: 30, merchant_product_id: 'mp-6' },
];

const mockReviews = [
  { id: 1, author: 'Sarah M.', rating: 5, text: 'Brilliant service! Screen replaced in 30 minutes.', date: '2025-12-10' },
  { id: 2, author: 'James K.', rating: 4, text: 'Good quality repair, slightly pricey but worth it.', date: '2025-11-22' },
  { id: 3, author: 'Emma L.', rating: 5, text: 'Very professional. Would recommend to anyone.', date: '2025-11-15' },
];

const s = {
  hero: {
    padding: '20px 0',
    borderBottom: '1px solid var(--border-muted)',
    marginBottom: 16,
  },
  shopName: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 },
  shopMeta: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginTop: 8 },
  stars: { color: '#FFD700' },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border-muted)', marginBottom: 16 },
  tab: (active) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: active ? 'var(--primary-green)' : 'var(--text-muted)',
    borderBottom: active ? '2px solid var(--primary-green)' : '2px solid transparent',
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: active ? 'var(--primary-green)' : 'transparent',
  }),
  catLabel: { fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 600, margin: '16px 0 8px', color: 'var(--text-muted)' },
  serviceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid var(--border-muted)',
  },
  serviceName: { fontSize: '0.95rem', color: 'var(--text-main)' },
  servicePrice: { color: 'var(--primary-green)', fontWeight: 700, marginRight: 12 },
  hoursTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  hoursTd: { padding: '10px 0', borderBottom: '1px solid var(--border-muted)', color: 'var(--text-main)' },
  hoursTdMuted: { padding: '10px 0', borderBottom: '1px solid var(--border-muted)', color: 'var(--text-muted)' },
  reviewCard: {
    padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)', marginBottom: 10,
  },
  reviewAuthor: { fontWeight: 600, marginBottom: 4 },
  reviewDate: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  reviewText: { fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6 },
  starBreak: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  starBar: (pct) => ({
    display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)', width: '100%',
  }),
  barTrack: { flex: 1, height: 6, background: 'var(--border-muted)', borderRadius: 3 },
  barFill: (pct) => ({ width: `${pct}%`, height: '100%', background: 'var(--primary-green)', borderRadius: 3 }),
  loading: { textAlign: 'center', padding: 40, color: 'var(--text-muted)' },
  desc: { fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 },
};

function renderStars(n) {
  let out = '';
  for (let i = 0; i < Math.round(n); i++) out += '\u2605';
  return out;
}

export default function ShopPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [shopRes, svcRes] = await Promise.all([
          clientAPI.get(`/shop/shops/${slug}`),
          clientAPI.get(`/shop/shops/${slug}/services`),
        ]);
        if (!cancelled) {
          setShop(shopRes.data?.data || shopRes.data);
          setServices(svcRes.data?.data || svcRes.data || []);
        }
      } catch {
        if (!cancelled) {
          setShop(mockShop);
          setServices(mockServices);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <div style={s.loading}>Loading shop...</div>;
  if (!shop) return <div style={s.loading}>Shop not found.</div>;

  const grouped = services.reduce((acc, svc) => {
    const cat = svc.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  return (
    <div className="animate-up">
      <div style={s.hero}>
        <h1 style={s.shopName}>{shop.name}</h1>
        <div style={s.shopMeta}>{shop.address}</div>
        <div style={s.ratingRow}>
          <span style={s.stars}>{renderStars(shop.rating_avg || 0)}</span>
          <span>{shop.rating_avg || 'N/A'}</span>
          <span style={{ color: 'var(--text-muted)' }}>({shop.review_count || 0} reviews)</span>
        </div>
      </div>

      <div style={s.tabs}>
        {['services', 'about', 'reviews'].map((t) => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <div>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div style={s.catLabel}>{cat}</div>
              {items.map((svc) => (
                <div key={svc.id || svc.name} style={s.serviceRow}>
                  <span style={s.serviceName}>{svc.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={s.servicePrice}>&euro;{svc.price}</span>
                    <button
                      className="btn-ira-primary"
                      style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                      onClick={() => navigate(`/shop/${slug}/book/${svc.merchant_product_id || svc.id}`)}
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === 'about' && (
        <div>
          <p style={s.desc}>{shop.description}</p>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', marginBottom: 12 }}>Business Hours</h3>
          <table style={s.hoursTable}>
            <tbody>
              {(shop.business_hours || mockShop.business_hours).map((h) => (
                <tr key={h.day}>
                  <td style={s.hoursTd}>{h.day}</td>
                  <td style={h.open ? s.hoursTd : s.hoursTdMuted}>
                    {h.open ? `${h.open} - ${h.close}` : 'Closed'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = mockReviews.filter((r) => r.rating === star).length;
              const pct = mockReviews.length ? (count / mockReviews.length) * 100 : 0;
              return (
                <div key={star} style={s.starBar(pct)}>
                  <span>{star}\u2605</span>
                  <div style={s.barTrack}><div style={s.barFill(pct)} /></div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
          {mockReviews.map((r) => (
            <div key={r.id} style={s.reviewCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={s.reviewAuthor}>{r.author}</span>
                <span style={s.reviewDate}>{r.date}</span>
              </div>
              <div style={{ color: '#FFD700', fontSize: '0.85rem' }}>{renderStars(r.rating)}</div>
              <p style={s.reviewText}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
