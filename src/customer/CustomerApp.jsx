import React, { useState } from 'react';
import { HQ_MASTER_CATALOG, ALLIANCE_SHOPS } from '../shared/data/mockData';
import '../styles/brand-design.css';

const CustomerApp = () => {
  const [view, setView] = useState('Explore'); // Explore | Warranty
  const [search, setSearch] = useState('');
  
  const filteredParts = HQ_MASTER_CATALOG.filter(part => 
    part.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mobile-container" style={{ background: '#0A0D11', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ padding: '24px 0' }}>
        <div className="ira-logo-container" style={{ padding: 0, marginBottom: '20px' }}>
          <div className="ira-icon-box" style={{ width: '40px', height: '40px' }}>
            <span style={{ fontSize: '20px' }}>☘️</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            IRELAND REPAIR ALLIANCE
          </div>
        </div>

        {view === 'Explore' && (
          <div className="animate-up">
            <h1 style={{ fontSize: '28px', lineHeight: '1.2', marginBottom: '16px' }}>
              Find the best <span style={{ color: '#00D084' }}>Local Repair</span>
            </h1>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search device or part..." 
                className="price-input" 
                style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', background: '#1A1F26' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span style={{ position: 'absolute', right: '20px', top: '16px' }}>🔍</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {view === 'Explore' ? (
          <div className="animate-up" style={{ animationDelay: '0.1s' }}>
            <h3 style={{ fontSize: '14px', color: '#8E95A2', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
              REPAIR PARTNERS NEARBY
            </h3>
            
            {search ? (
              filteredParts.map(part => (
                <div key={part.id} className="glass-panel" style={{ borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>{part.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ALLIANCE_SHOPS.map(shop => (
                      <div key={shop.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{shop.name}</div>
                          <div style={{ fontSize: '12px', color: '#8E95A2' }}>{shop.location} • {shop.dist}km away</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#00D084', fontWeight: '800' }}>€{part.suggestedRetail.toFixed(2)}</div>
                          <div style={{ fontSize: '10px', color: '#8E95A2' }}>Alliance Guaranteed</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#8E95A2' }}>
                Enter a part name (e.g. "iPhone 15") to compare local shop prices.
              </div>
            )}
          </div>
        ) : (
          <div className="animate-up">
            <h2 style={{ marginBottom: '20px' }}>My Warranty Wallet</h2>
            <div className="glass-panel" style={{ borderRadius: '24px', padding: '24px', background: 'linear-gradient(135deg, #00D08422 0%, #1A1F26 100%)', border: '1px solid #00D08444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <span style={{ background: '#00D084', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>ACTIVE</span>
              </div>
              <div style={{ fontSize: '14px', color: '#8E95A2', marginBottom: '4px' }}>iPhone 15 Pro Screen</div>
              <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>ALL-ISLAND WARRANTY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8E95A2' }}>
                <div>ID: IRA-882-X9</div>
                <div>EXP: 24 MAR 2027</div>
              </div>
            </div>
            <p style={{ marginTop: '20px', color: '#8E95A2', fontSize: '14px', textAlign: 'center' }}>
              This digital certificate is valid at any Ireland Repair Alliance member shop across the island.
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: '24px', left: '24px', right: '24px', background: 'rgba(18, 20, 24, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', display: 'flex', justifyContent: 'space-around', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <button 
          onClick={() => setView('Explore')}
          style={{ background: 'transparent', border: 'none', color: view === 'Explore' ? '#00D084' : '#8E95A2', textAlign: 'center', transition: '0.2s' }}
        >
          <div style={{ fontSize: '20px' }}>🌍</div>
          <div style={{ fontSize: '11px', fontWeight: '600' }}>Explore</div>
        </button>
        <button 
          onClick={() => setView('Warranty')}
          style={{ background: 'transparent', border: 'none', color: view === 'Warranty' ? '#00D084' : '#8E95A2', textAlign: 'center', transition: '0.2s' }}
        >
          <div style={{ fontSize: '20px' }}>🛡️</div>
          <div style={{ fontSize: '11px', fontWeight: '600' }}>Warranty</div>
        </button>
      </nav>
    </div>
  );
};

export default CustomerApp;
