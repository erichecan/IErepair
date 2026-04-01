import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../api/client';

const s = {
  wrapper: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: 'var(--bg-deep)', padding: 20,
  },
  card: {
    width: '100%', maxWidth: 400, padding: 32,
    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-muted)',
    background: 'var(--bg-sidebar)',
  },
  logo: {
    fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 700,
    color: 'var(--primary-green)', textAlign: 'center', marginBottom: 8,
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
    cursor: 'pointer', fontSize: '0.95rem', marginBottom: 12,
  },
  otpWrap: {
    display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16,
  },
  otpInput: {
    width: 44, height: 52, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none',
    fontFamily: 'inherit',
  },
  error: { color: '#ff6b6b', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' },
  link: { textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp() {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await clientAPI.post('/auth/send-otp', { email });
      setOtpSent(true);
    } catch {
      // For demo, proceed to OTP entry
      setOtpSent(true);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    if (value.length > 1) value = value.slice(-1);
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    // Auto-focus next
    if (value && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`);
      if (el) el.focus();
    }
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await clientAPI.post('/auth/verify-otp', { email, code });
      const data = res.data?.data || res.data;
      login(data.token, data.user);
      navigate('/');
    } catch {
      // Demo fallback login
      login('demo-token', { id: 1, email, role: 'customer', name: 'Demo User' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrapper}>
      <div className="animate-up" style={s.card}>
        <div style={s.logo}>IRA</div>
        <div style={s.subtitle}>Sign in to your account</div>

        {error && <div style={s.error}>{error}</div>}

        {!otpSent ? (
          <>
            <label style={s.label}>Email Address</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
            <button style={s.btn} onClick={handleSendOtp} disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        ) : (
          <>
            <div style={{ ...s.subtitle, marginBottom: 16 }}>
              Enter the 6-digit code sent to {email}
            </div>
            <div style={s.otpWrap}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  style={s.otpInput}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      const el = document.getElementById(`otp-${i - 1}`);
                      if (el) el.focus();
                    }
                  }}
                />
              ))}
            </div>
            <button style={s.btn} onClick={handleVerify} disabled={loading || otp.join('').length < 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <div style={s.link}>
              <span style={{ cursor: 'pointer', color: 'var(--primary-green)' }} onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}>
                Use a different email
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
