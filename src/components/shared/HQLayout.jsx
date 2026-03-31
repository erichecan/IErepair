import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const sidebarWidth = 260;

const navItems = [
  { to: '/hq/catalog', label: 'Catalog', icon: '📖' },
  { to: '/hq/merchants', label: 'Merchants', icon: '🏪' },
  { to: '/hq/commission', label: 'Commission', icon: '💰' },
  { to: '/hq/finance', label: 'Finance', icon: '📈' },
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
    fontSize: '1.3rem',
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
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  content: {
    flex: 1,
    padding: 24,
  },
};

export default function HQLayout() {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <NavLink to="/hq/catalog" style={styles.logo}>IRA Headquarters</NavLink>
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
          <span style={styles.title}>IRA Headquarters</span>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
