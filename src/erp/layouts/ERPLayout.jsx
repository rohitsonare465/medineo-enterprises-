import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiShoppingCart, FiTruck, FiUsers, FiPackage, 
  FiDollarSign, FiBookOpen, FiBarChart2, FiSettings,
  FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiCreditCard
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import './ERPLayout.css';
import '../styles/common.css';

const ERPLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, hasPermission } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/erp/login');
  };

  const menuItems = [
    { path: '/erp', icon: FiHome, label: 'Dashboard', permission: 'canViewDashboard' },
    { path: '/erp/sales', icon: FiShoppingCart, label: 'Sales', permission: 'canManageSales' },
    { path: '/erp/purchases', icon: FiTruck, label: 'Purchases', permission: 'canManagePurchases' },
    { path: '/erp/customers', icon: FiUsers, label: 'Customers', permission: 'canManageSales' },
    { path: '/erp/vendors', icon: FiUsers, label: 'Vendors', permission: 'canManagePurchases' },
    { path: '/erp/medicines', icon: FiPackage, label: 'Medicines', permission: 'canManageStock' },
    { path: '/erp/stock', icon: FiPackage, label: 'Stock', permission: 'canManageStock' },
    { path: '/erp/payments', icon: FiDollarSign, label: 'Payments', permission: 'canManagePayments' },
    { path: '/erp/expenses', icon: FiCreditCard, label: 'Expenses', permission: 'canManagePayments' },
    { path: '/erp/ledger', icon: FiBookOpen, label: 'Ledger', permission: 'canViewReports' },
    { path: '/erp/reports', icon: FiBarChart2, label: 'Reports', permission: 'canViewReports' },
    { path: '/erp/settings', icon: FiSettings, label: 'Settings', permission: 'canManageSettings' }
  ];

  const filteredMenu = menuItems.filter(item => 
    user?.role === 'owner' || hasPermission(item.permission)
  );

  return (
    <div className={`erp-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="erp-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">
            {sidebarOpen ? 'Medineo ERP' : 'M'}
          </h1>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/erp'}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="nav-icon" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <>
                <div className="user-details">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
                <FiChevronDown className={`dropdown-icon ${userMenuOpen ? 'open' : ''}`} />
              </>
            )}
          </div>

          {userMenuOpen && sidebarOpen && (
            <div className="user-menu">
              <button onClick={() => navigate('/erp/settings')}>
                <FiUser /> Profile
              </button>
              <button onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="erp-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ERPLayout;
