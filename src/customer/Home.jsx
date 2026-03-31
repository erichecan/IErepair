import React, { useState, useEffect } from 'react';
import { MASTER_CATALOG, ALLIANCE_SHOPS } from '../data/mockData';

const CustomerHome = () => {
  const [searchQuery, setSearchQuery] = useState('iPhone 15 Pro Screen');
  const [userLocation, setUserLocation] = useState({ lat: 53.3498, lng: -6.2603 }); // Default to Dublin
  const [results, setResults] = useState([]);

  // Mock distance calculation (in km)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    // Filter shops and items based on search
    const matchedPart = MASTER_CATALOG.find(p => 
      `${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedPart) {
      const shopOffers = ALLIANCE_SHOPS.map(shop => {
        const item = shop.inventory.find(i => i.itemId === matchedPart.id);
        const distance = getDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng);
        return item ? { ...shop, offerPrice: item.price, part: matchedPart, distance } : null;
      }).filter(Boolean);

      // Sort by proximity
      shopOffers.sort((a, b) => a.distance - b.distance);
      setResults(shopOffers);
    } else {
      setResults([]);
    }
  }, [searchQuery, userLocation]);

  return (
    <div className="customer-app animate-fade">
      <header className="app-header glass">
        <div className="search-container container">
          <div className="search-bar">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search model or part (e.g. iPhone 15 Screen)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="container">
        <section className="location-banner glass-card">
          <div className="flex-center" style={{ gap: '8px' }}>
            <span>📍</span>
            <span>Repairs near <strong>Dublin, Ireland</strong></span>
          </div>
        </section>

        <section className="results-list">
          <h2 className="section-title">Found {results.length} Repairs Near You</h2>
          
          {results.map((shop) => (
            <div key={shop.id} className="shop-offer-card glass-card">
              <div className="offer-main">
                <div className="shop-identity">
                  <h3>{shop.name}</h3>
                  <div className="rating">⭐ {shop.rating} <span className="text-muted">(1.2k reviews)</span></div>
                  <p className="text-muted">{shop.address}</p>
                </div>
                <div className="pricing-info">
                  <div className="price-tag">€{shop.offerPrice}</div>
                  <div className="distance-tag">{shop.distance.toFixed(1)} km away</div>
                </div>
              </div>
              
              <div className="offer-footer">
                <div className="badges">
                  <span className="badge">✅ Ireland Repair Alliance Certified</span>
                  <span className="badge">🛡️ All-Island Warranty</span>
                </div>
                <button className="btn-book">Book Now</button>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="empty-state glass-card flex-center">
              <p className="text-muted">No shops found for "{searchQuery}". Try searching for iPhone or Samsung.</p>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .customer-app {
          padding-bottom: 2rem;
        }
        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 16px 0;
          margin-bottom: 24px;
        }
        .search-bar {
          background: var(--bg-deep);
          border: 1px solid var(--border-glass);
          padding: 12px 20px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 1rem;
        }
        .location-banner {
          margin-bottom: 32px;
          padding: 12px;
          border-radius: 12px;
          border-color: var(--secondary-blue);
        }
        .section-title {
          margin-bottom: 20px;
          font-size: 1.5rem;
        }
        .shop-offer-card {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .offer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .shop-identity h3 {
          color: var(--primary-green);
          margin-bottom: 4px;
        }
        .rating {
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        .pricing-info {
          text-align: right;
        }
        .price-tag {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-main);
          font-family: 'Outfit';
        }
        .distance-tag {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .offer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
        }
        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .badge {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          color: var(--primary-green);
          border: 1px solid var(--primary-green-glow);
        }
        .btn-book {
          background: linear-gradient(to right, var(--primary-green), var(--secondary-blue));
          border: none;
          padding: 10px 24px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-book:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default CustomerHome;
