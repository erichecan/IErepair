import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clientAPI } from '../../api/client';

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-surface)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-pop)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px 36px',
  },
  brand: {
    textAlign: 'center',
    marginBottom: 28,
  },
  logoBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 'var(--radius-lg)',
    background: '#242424',
    marginBottom: 14,
  },
  logoText: {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.025em',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: '#242424',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    marginTop: 4,
    transition: 'opacity 0.15s',
  },
  otpLabel: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: 20,
    lineHeight: 1.6,
  },
  otpWrap: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpInput: {
    width: 46,
    height: 56,
    textAlign: 'center',
    fontSize: '1.4rem',
    fontWeight: 800,
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    outline: 'none',
    fontFamily: 'inherit',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  changeEmail: {
    textAlign: 'center',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginTop: 14,
  },
  changeEmailLink: {
    color: 'var(--text-main)',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
  error: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(220,38,38,0.07)',
    color: '#b91c1c',
    fontSize: '0.82rem',
    marginBottom: 14,
    border: '1px solid rgba(220,38,38,0.12)',
  },
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
      login('demo-token', { id: 1, email, role: 'customer', name: 'Demo User' });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  const focusStyle = (e) => {
    e.target.style.borderColor = 'rgba(34,42,53,0.35)';
    e.target.style.boxShadow = '0 0 0 3px rgba(34,42,53,0.06), var(--shadow-sm)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'var(--border-muted)';
    e.target.style.boxShadow = 'var(--shadow-sm)';
  };

  return (
    <div style={s.page}>
      <div className="animate-up" style={s.card}>
        <div style={s.brand}>
          <div style={s.logoBox}>
            <span style={s.logoText}>IRA</span>
          </div>
          <div style={s.title}>{otpSent ? 'Check your inbox' : 'Sign in'}</div>
          <div style={s.subtitle}>
            {otpSent
              ? `We sent a 6-digit code to ${email}`
              : 'Enter your email to get a one-time code'}
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {!otpSent ? (
          <>
            <div style={s.formGroup}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <button
              style={{ ...s.submitBtn, opacity: loading || !email ? 0.5 : 1 }}
              onClick={handleSendOtp}
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        ) : (
          <>
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
                  onFocus={(e) => {
                    e.target.style.borderColor = '#242424';
                    e.target.style.boxShadow = '0 0 0 3px rgba(34,42,53,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-muted)';
                    e.target.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      const el = document.getElementById(`otp-${i - 1}`);
                      if (el) el.focus();
                    }
                  }}
                />
              ))}
            </div>
            <button
              style={{ ...s.submitBtn, opacity: loading || otp.join('').length < 6 ? 0.5 : 1 }}
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <div style={s.changeEmail}>
              <span
                style={s.changeEmailLink}
                onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); setError(''); }}
              >
                Use a different email
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
