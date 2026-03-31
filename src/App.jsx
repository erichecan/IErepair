import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './styles/brand-design.css';

// Layouts
import CustomerLayout from './components/shared/CustomerLayout';
import MerchantLayout from './components/shared/MerchantLayout';
import HQLayout from './components/shared/HQLayout';

// Customer pages
import HomePage from './pages/customer/HomePage';
import SearchPage from './pages/customer/SearchPage';
import ShopPage from './pages/customer/ShopPage';
import BookingFlow from './pages/customer/BookingFlow';
import BookingConfirmation from './pages/customer/BookingConfirmation';
import MyBookings from './pages/customer/MyBookings';
import WarrantyWallet from './pages/customer/WarrantyWallet';
import LoginPage from './pages/customer/LoginPage';

// Merchant pages
import MerchantLogin from './pages/merchant/MerchantLogin';
import Dashboard from './pages/merchant/Dashboard';
import Calendar from './pages/merchant/Calendar';
import Pricing from './pages/merchant/Pricing';
import Orders from './pages/merchant/Orders';
import ScanCheckIn from './pages/merchant/ScanCheckIn';
import WarrantyClaims from './pages/merchant/WarrantyClaims';
import Settings from './pages/merchant/Settings';

// HQ pages
import HQLogin from './pages/hq/HQLogin';
import MasterCatalog from './pages/hq/MasterCatalog';
import MerchantManagement from './pages/hq/MerchantManagement';
import CommissionRules from './pages/hq/CommissionRules';
import Finance from './pages/hq/Finance';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer routes — wrapped in CustomerLayout */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/shop/:slug" element={<ShopPage />} />
            <Route path="/shop/:slug/book/:productId" element={<BookingFlow />} />
            <Route path="/booking/:bookingId" element={<BookingConfirmation />} />
            <Route path="/my/bookings" element={<MyBookings />} />
            <Route path="/my/warranties" element={<WarrantyWallet />} />
          </Route>

          {/* Customer login — no layout */}
          <Route path="/login" element={<LoginPage />} />

          {/* Merchant login — no layout */}
          <Route path="/merchant/login" element={<MerchantLogin />} />

          {/* Merchant routes — wrapped in MerchantLayout */}
          <Route element={<MerchantLayout />}>
            <Route path="/merchant/dashboard" element={<Dashboard />} />
            <Route path="/merchant/calendar" element={<Calendar />} />
            <Route path="/merchant/pricing" element={<Pricing />} />
            <Route path="/merchant/orders" element={<Orders />} />
            <Route path="/merchant/scan" element={<ScanCheckIn />} />
            <Route path="/merchant/warranty" element={<WarrantyClaims />} />
            <Route path="/merchant/settings" element={<Settings />} />
          </Route>

          {/* HQ login — no layout */}
          <Route path="/hq/login" element={<HQLogin />} />

          {/* HQ routes — wrapped in HQLayout */}
          <Route element={<HQLayout />}>
            <Route path="/hq/catalog" element={<MasterCatalog />} />
            <Route path="/hq/merchants" element={<MerchantManagement />} />
            <Route path="/hq/commission" element={<CommissionRules />} />
            <Route path="/hq/finance" element={<Finance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
