import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hqAPI } from '../../api/client';

const s = {
  page: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-deep)', padding: 20 },
  card: { background: 'var(--bg-sidebar)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-lg)', padding: '40px 36px', width: '100%', maxWidth: 400, textAlign: 'center' },
  logo: { fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 },
  accent: { color: 'var(--primary-green)' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28 },
  field: { textAlign: 'left', marginBottom: 16 },
  label: { display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 },
  input: { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff', padding: '12px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { width: '100%', background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none', padding: '13px 24px', borderRadius: 20, cursor: 'pointer', fontSize: '1rem', marginTop: 8 },
  error: { color: '#EF4444', fontSize: '0.85rem', marginTop: 12 },
  hint: { color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 16 },
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

    // Demo fallback
    if (email === 'admin@ira.ie' && password === 'admin123') {
      localStorage.setItem('token', 'demo-hq-token');
      localStorage.setItem('role', 'hq');
      navigate('/hq/catalog');
    } else {
      setError('Invalid credentials. Demo: admin@ira.ie / admin123');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <form style={s.card} className="animate-up" onSubmit={handleLogin}>
        <div style={s.logo}><span style={s.accent}>IRA</span> Admin</div>
        <div style={s.subtitle}>HQ Administration Portal</div>

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" placeholder="admin@ira.ie" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={s.field}>
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {error && <div style={s.error}>{error}</div>}
        <div style={s.hint}>Demo: admin@ira.ie / admin123</div>
      </form>
    </div>
  );
}
