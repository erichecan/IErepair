import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const sidebarWidth = 260;

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
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-deep)',
  },
  sidebar: {
    width: sidebarWidth,
    minWidth: sidebarWidth,
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-muted)',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    padding: 24,
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--primary-green)',
    textDecoration: 'none',
    display: 'block',
  },
  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 24px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    margin: '4px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: 'var(--primary-green)',
    background: 'rgba(255,255,255,0.05)',
    borderLeft: '3px solid var(--primary-green)',
    borderRadius: '0 8px 8px 0',
    marginLeft: 0,
    paddingLeft: 21,
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid var(--border-muted)',
  },
  searchInput: {
    background: 'var(--input-bg)',
    border: '1px solid var(--border-muted)',
    color: 'white',
    padding: '10px 16px',
    borderRadius: 8,
    width: 280,
    outline: 'none',
    fontFamily: 'inherit',
  },
  merchantName: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  content: {
    flex: 1,
    padding: 24,
  },
};

export default function MerchantLayout() {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <NavLink to="/merchant/dashboard" style={styles.logo}>IRA Merchant</NavLink>
        <ul style={styles.navList}>
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      <div style={styles.mainArea}>
        <header style={styles.topBar}>
          <input type="text" placeholder="Search..." style={styles.searchInput} />
          <span style={styles.merchantName}>Merchant Portal</span>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
