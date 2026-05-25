import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hqAPI } from '../../api/client';

const s = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-main)',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  logoMark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    background: '#242424',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
  },
  logoText: {
    fontSize: '1.15rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
  },
  card: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-pop)',
    borderRadius: 'var(--radius-xl)',
    padding: '32px 28px',
    border: '1px solid var(--border-muted)',
  },
  heading: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    marginBottom: 6,
    textAlign: 'center',
  },
  subheading: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    marginTop: 8,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: '#242424',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  errorMsg: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.15)',
    color: '#b91c1c',
    fontSize: '0.82rem',
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  hint: {
    marginTop: 12,
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(37,99,235,0.05)',
    border: '1px solid rgba(37,99,235,0.12)',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
};

export default function HQLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await hqAPI.post('/auth/login', { email, password });
      const token = res.data?.data?.token || res.data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', 'hq');
        navigate('/hq/catalog');
        return;
      }
    } catch { /* fall through to demo */ }

    if (email === 'admin@ira.ie' && password === 'admin123') {
      localStorage.setItem('token', 'demo-hq-token');
      localStorage.setItem('role', 'hq');
      navigate('/hq/catalog');
    } else {
      setError('Invalid credentials. Try the demo credentials below.');
    }
    setLoading(false);
  };

  return (
    <div style={s.wrapper}>
      <div style={s.container} className="animate-up">
        <div style={s.logoMark}>
          <div style={s.logoIcon}>🛡️</div>
          <span style={s.logoText}>IRA Admin</span>
        </div>

        <form style={s.card} onSubmit={handleLogin}>
          <div style={s.heading}>HQ Portal</div>
          <div style={s.subheading}>Sign in to the administration console</div>

          {error && <div style={s.errorMsg}>{error}</div>}

          <div style={s.fieldGroup}>
            <label style={s.label}>Email Address</label>
            <input
              style={s.input}
              type="email"
              placeholder="admin@ira.ie"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={s.hint}>Demo: admin@ira.ie / admin123</div>

          <div style={s.footer}>
            Restricted to authorised IRA staff only.
          </div>
        </form>
      </div>
    </div>
  );
}
