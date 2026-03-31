import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const styles = {
  wrapper: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-deep)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-muted)',
  },
  logo: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'var(--primary-green)',
    textDecoration: 'none',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
  bottomNav: {
    display: 'flex',
    justifyContent: 'space-around',
    borderTop: '1px solid var(--border-muted)',
    background: 'var(--bg-sidebar)',
    padding: '10px 0 env(safe-area-inset-bottom, 10px)',
    position: 'sticky',
    bottom: 0,
  },
  navLink: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    padding: '6px 12px',
    transition: 'color 0.2s',
  },
  navLinkActive: {
    color: 'var(--primary-green)',
  },
  navIcon: {
    fontSize: '1.2rem',
  },
};

export default function CustomerLayout() {
  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <NavLink to="/" style={styles.logo}>IRA</NavLink>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>

      <nav style={styles.bottomNav}>
        {[
          { to: '/', label: 'Explore', icon: '🔍' },
          { to: '/my/bookings', label: 'My Bookings', icon: '📋' },
          { to: '/my/warranties', label: 'Warranty', icon: '🛡️' },
          { to: '/login', label: 'Account', icon: '👤' },
        ].map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
