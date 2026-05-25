import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/merchant/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/merchant/calendar', label: 'Calendar', icon: '📅' },
  { to: '/merchant/pricing', label: 'Pricing', icon: '💲' },
  { to: '/merchant/orders', label: 'Orders', icon: '📦' },
  { to: '/merchant/scan', label: 'Scan', icon: '📷' },
  { to: '/merchant/warranty', label: 'Warranty', icon: '🛡️' },
  { to: '/merchant/settings', label: 'Settings', icon: '⚙️' },
];

const styles = {
  logo: {
    padding: '20px 20px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    textDecoration: 'none',
    display: 'block',
    letterSpacing: '-0.02em',
  },
  logoSub: {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 400,
    color: 'var(--text-muted)',
    letterSpacing: 0,
    marginTop: 2,
  },
  navList: {
    listStyle: 'none',
    padding: '8px 0',
    margin: 0,
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    margin: '1px 8px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s',
  },
  navLinkActive: {
    color: 'var(--text-main)',
    background: 'rgba(34,42,53,0.06)',
    fontWeight: 600,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    borderBottom: '1px solid var(--border-muted)',
    background: 'var(--bg-sidebar)',
  },
  searchInput: {
    background: '#f9f9f9',
    border: '1px solid var(--border-muted)',
    color: 'var(--text-main)',
    padding: '8px 14px',
    borderRadius: 'var(--radius-sm)',
    width: 260,
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
  },
  merchantName: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  content: {
    flex: 1,
    padding: 28,
  },
};

export default function MerchantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sidebar-layout">
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar-panel${sidebarOpen ? ' open' : ''}`}>
        <NavLink to="/merchant/dashboard" style={styles.logo} onClick={() => setSidebarOpen(false)}>
          IRA
          <span style={styles.logoSub}>Merchant Portal</span>
        </NavLink>
        <ul style={styles.navList}>
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      <div className="sidebar-main">
        <header style={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">
              ☰
            </button>
            <input
              type="text"
              placeholder="Search orders, customers..."
              style={styles.searchInput}
              onFocus={e => { e.target.style.borderColor = 'rgba(34,42,53,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(34,42,53,0.08)'; }}
            />
          </div>
          <span style={styles.merchantName}>Merchant Portal</span>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
