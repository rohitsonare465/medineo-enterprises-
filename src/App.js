import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import ERPLayout from './erp/layouts/ERPLayout';
import PublicLayout from './layouts/PublicLayout';

// Public Pages (existing website)
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Contact from './pages/Contact';
import WhyChooseUs from './pages/WhyChooseUs';

// ERP Pages
import Login from './erp/pages/Login';
import Dashboard from './erp/pages/Dashboard';
import Sales from './erp/pages/Sales';
import NewSale from './erp/pages/NewSale';
import Purchases from './erp/pages/Purchases';
import NewPurchase from './erp/pages/NewPurchase';
import Customers from './erp/pages/Customers';
import Vendors from './erp/pages/Vendors';
import Medicines from './erp/pages/Medicines';
import Stock from './erp/pages/Stock';
import Payments from './erp/pages/Payments';
import Expenses from './erp/pages/Expenses';
import Ledger from './erp/pages/Ledger';
import Reports from './erp/pages/Reports';
import Settings from './erp/pages/Settings';

// Auth
import PrivateRoute from './erp/components/PrivateRoute';
import useAuthStore from './store/authStore';

// Components
import ScrollToTop from './components/ScrollToTop';

import './App.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-choose-us" element={<WhyChooseUs />} />
        </Route>

        {/* ERP Login - only redirect if BOTH authenticated AND user exists */}
        <Route path="/erp/login" element={
          (isAuthenticated && user) ? <Navigate to="/erp" replace /> : <Login />
        } />

        {/* ERP Dashboard Routes - Protected */}
        <Route path="/erp" element={<PrivateRoute />}>
          <Route element={<ERPLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/new" element={<NewSale />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="purchases/new" element={<NewPurchase />} />
            <Route path="customers" element={<Customers />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="stock" element={<Stock />} />
            <Route path="payments" element={<Payments />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="ledger" element={<Ledger />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
