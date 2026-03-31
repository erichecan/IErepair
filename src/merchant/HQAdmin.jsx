import React, { useState } from 'react';
import { HQ_MASTER_CATALOG } from '../shared/data/mockData';
import '../styles/brand-design.css';

const HQAdmin = () => {
  const [catalog, setCatalog] = useState(HQ_MASTER_CATALOG);
  
  return (
    <div style={{ padding: '40px', background: '#0A0D11', minHeight: '100vh' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#00D084' }}>IRA Headquarters</h1>
          <div style={{ color: '#8E95A2' }}>Master Catalog & Supply Chain Management</div>
        </div>
        <button className="btn-ira-primary">+ Add New Master Product</button>
      </header>

      <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Alliance Master Catalog</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#8E95A2', borderBottom: '1px solid #ffffff1a' }}>
              <th style={{ padding: '16px' }}>Part ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Wholesale Base Cost</th>
              <th>Suggested Retail</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ffffff08' }}>
                <td style={{ padding: '16px', color: '#8E95A2' }}>{item.id}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.category}</td>
                <td>€{item.baseCost.toFixed(2)}</td>
                <td>€{item.suggestedRetail.toFixed(2)}</td>
                <td>
                  <button style={{ background: 'transparent', border: '1px solid #00D084', color: '#00D084', padding: '4px 12px', borderRadius: '4px' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HQAdmin;
