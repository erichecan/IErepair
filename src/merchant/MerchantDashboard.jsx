import React, { useState } from 'react';
import { HQ_MASTER_CATALOG, ALLIANCE_SHOPS } from '../shared/data/mockData';
import '../styles/brand-design.css';

const MerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState('Quick Pricing');
  const shop = ALLIANCE_SHOPS[0]; // Simulation for O'Neill's Repairs
  
  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Repairs', icon: '🔧' },
    { name: 'Inventory', icon: '📦' },
    { name: 'Customers', icon: '👥' },
    { name: 'Quick Pricing', icon: '🏷️' },
    { name: 'Reports', icon: '📄' },
    { name: 'Team', icon: '👷' },
    { name: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0D11' }}>
      {/* Sidebar - Exactly as screenshot */}
      <aside className="glass-panel" style={{ width: '260px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="ira-logo-container">
          <div className="ira-icon-box">
             <span style={{ fontSize: '24px' }}>☘️</span>
          </div>
          <div className="logo-text">
            <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.1' }}>Ireland</div>
            <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.1', color: 'white' }}>Repair</div>
            <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.1', color: 'white' }}>Alliance</div>
          </div>
        </div>

        <nav style={{ marginTop: '20px' }}>
          {navItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8E95A2', fontSize: '14px', marginBottom: '8px' }}>
              <input type="text" placeholder="Search..." className="price-input" style={{ width: '300px', background: '#12161D' }} />
            </div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome back, O'Neill's Repairs</h1>
            <div style={{ color: '#8E95A2' }}>
              Dublin Branch | <span style={{ color: '#00D084' }}>Quick Pricing</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1A1F26', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600' }}>O'Neill's Repairs</div>
              <div style={{ fontSize: '12px', color: '#00D084' }}>Dublin | Active</div>
            </div>
          </div>
        </header>

        {activeTab === 'Quick Pricing' && (
          <section className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '20px' }}>Quick Pricing</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-ira-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px' }}>Filters</button>
                <button className="btn-ira-primary">Add New Part</button>
              </div>
            </div>

            <div className="table-header">
              <div>#</div>
              <div>Part Name</div>
              <div>Base Cost</div>
              <div>Status</div>
              <div>Your Price</div>
            </div>

            <div className="table-body">
              {HQ_MASTER_CATALOG.map((part, index) => (
                <div key={part.id} className="table-row">
                  <div style={{ color: '#8E95A2' }}>{index + 1}.</div>
                  <div className="part-name">{part.name}</div>
                  <div>€{part.baseCost.toFixed(2)}</div>
                  <div>
                    <label className="ira-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="ira-slider"></span>
                    </label>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      className="price-input" 
                      defaultValue={`€${part.suggestedRetail.toFixed(2)}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MerchantDashboard;
