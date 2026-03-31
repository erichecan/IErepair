import React from 'react';
import { generateWarrantyId } from '../logic/settlement';

const WarrantyWallet = () => {
  // Mock active warranties
  const warranties = [
    {
      id: generateWarrantyId('ord-101', 'shop-dublin-01'),
      item: 'iPhone 15 Pro Screen',
      shop: "O'Neill's Repairs",
      date: '2026-03-25',
      status: 'In Warranty',
      expiry: '2026-09-25'
    }
  ];

  return (
    <div className="warranty-wallet container animate-fade" style={{ paddingTop: '80px' }}>
      <h1>My All-Island Warranty Wallet</h1>
      <p className="text-muted">Digital certificates for every repair performed by IRA partners.</p>

      <div className="warranty-list" style={{ marginTop: '32px' }}>
        {warranties.map((w) => (
          <div key={w.id} className="warranty-card glass-card">
            <div className="card-header">
              <span className="status-badge">🛡️ {w.status}</span>
              <span className="id-badge">ID: {w.id}</span>
            </div>
            
            <div className="card-body">
              <h2>{w.item}</h2>
              <p className="text-muted">Repaired at: <strong>{w.shop}</strong></p>
              <div className="card-footer">
                <div className="date-item">
                  <span className="label">REPAIR DATE</span>
                  <strong>{w.date}</strong>
                </div>
                <div className="date-item">
                  <span className="label">EXPIRES</span>
                  <strong>{w.expiry}</strong>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-secondary">View Receipt</button>
              <button className="btn-primary">Transfer Warranty</button>
            </div>
            
            <div className="platform-note">
              <p>This warranty is valid at any of the <strong>3,000+</strong> Ireland Repair Alliance member locations.</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .warranty-card {
          padding: 0;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .card-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-glass);
          display: flex;
          justify-content: space-between;
          background: rgba(150, 255, 150, 0.05);
        }
        .status-badge {
          color: var(--primary-green);
          font-weight: 600;
        }
        .id-badge {
          font-family: monospace;
          background: var(--bg-deep);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .card-body {
          padding: 24px;
        }
        .card-footer {
          margin-top: 24px;
          display: flex;
          gap: 40px;
          border-top: 1px solid var(--border-glass);
          padding-top: 20px;
        }
        .date-item {
          display: flex;
          flex-direction: column;
        }
        .label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .card-actions {
          padding: 16px 24px;
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.02);
        }
        .platform-note {
          padding: 12px 24px;
          background: var(--bg-deep);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: center;
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--primary-green);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default WarrantyWallet;
