import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Explore', icon: '🔍', end: true },
  { to: '/my/bookings', label: 'Bookings', icon: '📋' },
  { to: '/my/warranties', label: 'Warranty', icon: '🛡️' },
  { to: '/login', label: 'Account', icon: '👤' },
];

const logoStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '1.1rem',
  fontWeight: 700,
  color: 'var(--text-main)',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

export default function CustomerLayout() {
  return (
    <div className="customer-wrapper">
      <header className="customer-header">
        <NavLink to="/" style={logoStyle}>
          IRA
          <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>
            Repair Marketplace
          </span>
        </NavLink>

        {/* Desktop horizontal nav */}
        <nav className="customer-header-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="customer-main">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="customer-bottom-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
