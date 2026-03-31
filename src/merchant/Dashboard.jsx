import React, { useState } from 'react';
import { MASTER_CATALOG, ALLIANCE_SHOPS } from '../data/mockData';

const Dashboard = () => {
  const [shop, setShop] = useState(ALLIANCE_SHOPS[0]);
  const [activeTab, setActiveTab] = useState('pricing');

  const updatePrice = (itemId, newPrice) => {
    const updatedInventory = shop.inventory.map(item => 
      item.itemId === itemId ? { ...item, price: parseFloat(newPrice) || 0 } : item
    );
    // In a real app, this would be an API call
    setShop({ ...shop, inventory: updatedInventory });
  };

  const toggleStatus = (itemId) => {
    // Mock toggle logic
    console.log(`Toggling ${itemId}`);
  };

  return (
    <div className="merchant-dashboard animate-fade">
      <aside className="sidebar glass">
        <div className="logo-section">
          <div className="logo-icon flex-center">☘️</div>
          <h2>IRA Merchant</h2>
        </div>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            📊 Dashboard
          </button>
          <button className={activeTab === 'pricing' ? 'active' : ''} onClick={() => setActiveTab('pricing')}>
            🏷️ Quick Pricing
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            📦 Orders
          </button>
          <button className={activeTab === 'warranty' ? 'active' : ''} onClick={() => setActiveTab('warranty')}>
            🛡️ Warranty Pool
          </button>
        </nav>
        <div className="shop-info">
          <div className="shop-card glass-card">
            <p className="text-muted">Logged in as:</p>
            <strong>{shop.name}</strong>
            <p className="text-muted">{shop.address}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <h1>{activeTab === 'pricing' ? 'Master Catalog Sync & Pricing' : 'Merchant Dashboard'}</h1>
          <div className="header-actions">
            <button className="btn-primary">Sync Now</button>
          </div>
        </header>

        {activeTab === 'pricing' && (
          <section className="pricing-table glass-card animate-fade">
            <div className="table-header">
              <div className="col">Part Name</div>
              <div className="col">Base Cost</div>
              <div className="col">Status</div>
              <div className="col">Your Price (EUR)</div>
            </div>
            <div className="table-body">
              {MASTER_CATALOG.map((part) => {
                const shopItem = shop.inventory.find(i => i.itemId === part.id);
                const isActive = !!shopItem;
                return (
                  <div key={part.id} className="table-row">
                    <div className="col part-info">
                      <img src={part.image} alt={part.part_type} className="part-thumb" />
                      <div>
                        <strong>{part.brand} {part.model}</strong>
                        <p className="text-muted">{part.category}</p>
                      </div>
                    </div>
                    <div className="col">€{part.baseCost}</div>
                    <div className="col">
                      <label className="switch">
                        <input type="checkbox" checked={isActive} onChange={() => toggleStatus(part.id)} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="col">
                      <input 
                        type="number" 
                        className="price-input" 
                        value={shopItem?.price || part.suggestedPrice} 
                        onChange={(e) => updatePrice(part.id, e.target.value)}
                        placeholder={part.suggestedPrice}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab !== 'pricing' && (
          <div className="empty-state glass-card flex-center">
            <p className="text-muted">Feature coming soon: {activeTab}</p>
          </div>
        )}
      </main>

      <style jsx>{`
        .merchant-dashboard {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 280px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--primary-green);
          border-radius: 10px;
          font-size: 1.5rem;
        }
        nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        nav button {
          background: transparent;
          border: none;
          color: var(--text-muted);
          text-align: left;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        nav button:hover, nav button.active {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        nav button.active {
          border-left: 3px solid var(--primary-green);
        }
        .main-content {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .pricing-table {
          padding: 0;
          overflow: hidden;
        }
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border-glass);
          font-weight: 600;
          color: var(--text-muted);
        }
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-glass);
          align-items: center;
        }
        .part-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .part-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border-glass);
        }
        .price-input {
          background: var(--bg-deep);
          border: 1px solid var(--border-glass);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          width: 100px;
          outline: none;
        }
        .price-input:focus {
          border-color: var(--primary-green);
        }
        .btn-primary {
          background: var(--primary-green);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
        }
        /* Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #333;
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--primary-green); }
        input:checked + .slider:before { transform: translateX(20px); }
      `}</style>
    </div>
  );
};

export default Dashboard;
