import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientAPI } from '../../api/client';

const mockShop = {
  name: 'Fix-It Dublin',
  slug: 'fix-it-dublin',
  address: '12 Grafton St, Dublin 2',
  city: 'Dublin',
  phone: '+353 1 234 5678',
  description: 'Professional device repair services with certified technicians. We specialise in screen replacements, battery swaps, and water damage recovery. All repairs come with our 180-day IRA warranty.',
  rating_avg: 4.8,
  review_count: 124,
  business_hours: [
    { day: 'Monday',    open: '09:00', close: '18:00' },
    { day: 'Tuesday',   open: '09:00', close: '18:00' },
    { day: 'Wednesday', open: '09:00', close: '18:00' },
    { day: 'Thursday',  open: '09:00', close: '19:00' },
    { day: 'Friday',    open: '09:00', close: '18:00' },
    { day: 'Saturday',  open: '10:00', close: '16:00' },
    { day: 'Sunday',    open: null,    close: null     },
  ],
};

const mockServices = [
  { id: 1, category: 'Screen Repair', name: 'iPhone 15 Pro Screen',    price: 89, merchant_product_id: 'mp-1' },
  { id: 2, category: 'Screen Repair', name: 'iPhone 14 Screen',        price: 69, merchant_product_id: 'mp-2' },
  { id: 3, category: 'Screen Repair', name: 'Samsung S24 Screen',      price: 79, merchant_product_id: 'mp-3' },
  { id: 4, category: 'Battery',       name: 'iPhone 15 Battery',       price: 49, merchant_product_id: 'mp-4' },
  { id: 5, category: 'Battery',       name: 'Samsung S24 Battery',     price: 45, merchant_product_id: 'mp-5' },
  { id: 6, category: 'Other',         name: 'Water Damage Assessment', price: 30, merchant_product_id: 'mp-6' },
];

const mockReviews = [
  { id: 1, author: 'Sarah M.', rating: 5, text: 'Brilliant service! Screen replaced in 30 minutes.', date: '2025-12-10' },
  { id: 2, author: 'James K.', rating: 4, text: 'Good quality repair, slightly pricey but worth it.', date: '2025-11-22' },
  { id: 3, author: 'Emma L.', rating: 5, text: 'Very professional. Would recommend to anyone.', date: '2025-11-15' },
];

const catIcons = { 'Screen Repair': '🖥️', 'Battery': '🔋', 'Other': '🔧' };

const s = {
  hero: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    padding: '28px 28px 24px',
    marginBottom: 24,
  },
  heroTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  shopLogo: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
  },
  heroInfo: {
    flex: 1,
    minWidth: 0,
  },
  shopName: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.025em',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  stars: {
    color: '#f59e0b',
    fontSize: '1.1rem',
    letterSpacing: '-1px',
  },
  ratingNum: {
    fontWeight: 700,
    fontSize: '0.95rem',
  },
  ratingCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(22,163,74,0.1)',
    color: '#16a34a',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  heroActions: {
    display: 'flex',
    gap: 10,
  },
  serviceSection: {
    marginBottom: 20,
  },
  catHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid var(--border-muted)',
  },
  serviceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 20px',
    background: 'var(--bg-card)',
    marginBottom: 2,
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.12s',
  },
  serviceName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-main)',
  },
  serviceRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  servicePrice: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  reviewCard: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-sm)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
    marginBottom: 10,
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reviewAuthor: {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'var(--text-main)',
  },
  reviewDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  reviewText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  hourRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-muted)',
    fontSize: '0.875rem',
  },
  loading: {
    textAlign: 'center',
    padding: 60,
    color: 'var(--text-muted)',
  },
};

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
      {/* Hero Card */}
      <div style={s.hero}>
        <div style={s.heroTop}>
          <div style={s.shopLogo}>🏪</div>
          <div style={s.heroInfo}>
            <h1 style={s.shopName}>{shop.name}</h1>
            <div style={s.addressLine}><span>📍</span><span>{shop.address}</span></div>
          </div>
          <span style={s.badge}>IRA Verified</span>
        </div>
        <div style={s.ratingRow}>
          <span style={s.stars}>{'★'.repeat(Math.round(shop.rating_avg || 0))}</span>
          <span style={s.ratingNum}>{shop.rating_avg || 'N/A'}</span>
          <span style={s.ratingCount}>({shop.review_count || 0} reviews)</span>
          {shop.phone && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span>📞</span><span>{shop.phone}</span>
            </span>
          )}
        </div>
        <div style={s.heroActions}>
          <button className="btn-ira-primary" onClick={() => setTab('services')}>Book a Repair</button>
          <button
            style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setTab('about')}
          >
            Hours & Info
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {['services', 'about', 'reviews'].map((t) => (
          <button key={t} className={`tab-item${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Services */}
      {tab === 'services' && (
        <div>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={s.serviceSection}>
              <div style={s.catHeader}>
                <span>{catIcons[cat] || '🔧'}</span>
                <span>{cat}</span>
              </div>
              <div className="section-block" style={{ overflow: 'hidden' }}>
                {items.map((svc, idx) => (
                  <div
                    key={svc.id || svc.name}
                    style={{ ...s.serviceRow, borderBottom: idx < items.length - 1 ? '1px solid var(--border-muted)' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,42,53,0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; }}
                  >
                    <span style={s.serviceName}>{svc.name}</span>
                    <div style={s.serviceRight}>
                      <span style={s.servicePrice}>€{svc.price}</span>
                      <button
                        className="btn-ira-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                        onClick={() => navigate(`/shop/${slug}/book/${svc.merchant_product_id || svc.id}`)}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* About */}
      {tab === 'about' && (
        <div>
          <div className="section-block" style={{ marginBottom: 20 }}>
            <div className="section-block-header"><div className="section-block-title">About</div></div>
            <div className="section-block-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{shop.description}</p>
            </div>
          </div>
          <div className="section-block">
            <div className="section-block-header"><div className="section-block-title">Business Hours</div></div>
            <div className="section-block-body" style={{ padding: '0 20px' }}>
              {(shop.business_hours || mockShop.business_hours).map((h, i) => (
                <div key={h.day} style={{ ...s.hourRow, borderBottom: i < 6 ? '1px solid var(--border-muted)' : 'none' }}>
                  <span style={{ fontWeight: 500 }}>{h.day}</span>
                  <span style={{ color: h.open ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {h.open ? `${h.open} – ${h.close}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div>
          <div className="section-block" style={{ marginBottom: 16 }}>
            <div className="section-block-header">
              <div className="section-block-title">Rating Breakdown</div>
            </div>
            <div className="section-block-body">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = mockReviews.filter((r) => r.rating === star).length;
                const pct = mockReviews.length ? (count / mockReviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{star}★</span>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 16 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {mockReviews.map((r) => (
            <div key={r.id} style={s.reviewCard}>
              <div style={s.reviewHeader}>
                <div>
                  <div style={s.reviewAuthor}>{r.author}</div>
                  <div style={{ color: '#f59e0b', fontSize: '0.85rem' }}>{'★'.repeat(r.rating)}</div>
                </div>
                <div style={s.reviewDate}>{r.date}</div>
              </div>
              <p style={s.reviewText}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
