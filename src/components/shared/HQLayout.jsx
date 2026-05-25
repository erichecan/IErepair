import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/hq/catalog', label: 'Catalog', icon: '📖' },
  { to: '/hq/merchants', label: 'Merchants', icon: '🏪' },
  { to: '/hq/commission', label: 'Commission', icon: '💰' },
  { to: '/hq/finance', label: 'Finance', icon: '📈' },
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
  title: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    letterSpacing: '-0.01em',
  },
  content: {
    flex: 1,
    padding: 28,
  },
};

export default function HQLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="sidebar-layout">
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar-panel${sidebarOpen ? ' open' : ''}`}>
        <NavLink to="/hq/catalog" style={styles.logo} onClick={() => setSidebarOpen(false)}>
          IRA
          <span style={styles.logoSub}>Headquarters</span>
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
            <span style={styles.title}>IRA Headquarters</span>
          </div>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
