import React from 'react';

const spinnerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'var(--bg-deep)',
};

const dotStyle = {
  width: 40,
  height: 40,
  border: '4px solid rgba(255,255,255,0.1)',
  borderTopColor: '#00D084',
  borderRadius: '50%',
  animation: 'ira-spin 0.8s linear infinite',
};

export default function LoadingSpinner() {
  return (
    <div style={spinnerStyle}>
      <style>{`@keyframes ira-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={dotStyle} />
    </div>
  );
}
