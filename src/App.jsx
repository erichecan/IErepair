import React from 'react';
import MerchantDashboard from './merchant/MerchantDashboard';
import HQAdmin from './merchant/HQAdmin';
import CustomerApp from './customer/CustomerApp';

function App() {
  const path = window.location.pathname;

  // Router-less separation for the demo
  if (path.startsWith('/merchant')) {
    return <MerchantDashboard />;
  }
  
  if (path.startsWith('/hq')) {
    return <HQAdmin />;
  }

  // Default is Customer WebApp (Mobile-First)
  return <CustomerApp />;
}

export default App;
