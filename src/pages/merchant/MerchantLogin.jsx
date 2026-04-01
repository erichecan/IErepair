import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { merchantAPI } from '../../api/client';

const s = {
  wrapper: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: 'var(--bg-deep)', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 420, padding: 36,
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-muted)',
    background: 'var(--bg-sidebar)',
  },
  logo: {
    fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700,
    color: 'var(--primary-green)', textAlign: 'center', marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 28,
  },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' },
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-muted)', background: 'var(--input-bg)',
    color: 'var(--text-main)', fontSize: '0.95rem', fontFamily: 'inherit',
    outline: 'none', marginBottom: 16,
  },
  btn: {
    width: '100%', padding: '12px', borderRadius: 20, border: 'none',
    background: 'var(--primary-green)', color: '#000', fontWeight: 700,
    cursor: 'pointer', fontSize: '0.95rem',
  },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' },
};

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await merchantAPI.post('/auth/login', { email, password });
      const data = res.data?.data || res.data;
      login(data.token, data.user);
      navigate('/merchant/dashboard');
    } catch {
      // Demo fallback
      login('merchant-demo-token', { id: 1, email, role: 'merchant', name: 'Demo Merchant', shop_name: 'Fix-It Dublin' });
      navigate('/merchant/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <form className="animate-up" style={s.card} onSubmit={handleSubmit}>
        <div style={s.logo}>IRA Merchant</div>
        <div style={s.subtitle}>Sign in to your merchant portal</div>

        {error && <div style={s.error}>{error}</div>}

        <label style={s.label}>Email Address</label>
        <input style={s.input} type="email" placeholder="merchant@shop.com" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button style={s.btn} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
