import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShoppingCart, FiTruck, FiDollarSign, FiPackage, 
  FiAlertTriangle, FiTrendingUp, FiUsers, FiClock
} from 'react-icons/fi';
import useDashboardStore from '../../store/dashboardStore';
import useAuthStore from '../../store/authStore';
import './Dashboard.css';

const Dashboard = () => {
  const { stats, isLoading, fetchDashboardStats } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}!</p>
        </div>
        <div className="header-actions">
          <Link to="/erp/sales/new" className="btn btn-primary">
            <FiShoppingCart /> New Sale
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <FiTrendingUp />
            </div>
          </div>
          <p className="stat-label">Today's Sales</p>
          <p className="stat-value">{formatCurrency(stats?.sales?.today?.total)}</p>
          <p className="stat-subtext">{stats?.sales?.today?.count || 0} invoices</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">
              <FiShoppingCart />
            </div>
          </div>
          <p className="stat-label">Monthly Sales</p>
          <p className="stat-value">{formatCurrency(stats?.sales?.month?.total)}</p>
          <p className="stat-subtext">{stats?.sales?.month?.count || 0} invoices</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon purple">
              <FiTruck />
            </div>
          </div>
          <p className="stat-label">Today's Purchases</p>
          <p className="stat-value">{formatCurrency(stats?.purchases?.today?.total)}</p>
          <p className="stat-subtext">{stats?.purchases?.today?.count || 0} invoices</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon orange">
              <FiDollarSign />
            </div>
          </div>
          <p className="stat-label">Total Receivable</p>
          <p className="stat-value">{formatCurrency(stats?.receivable)}</p>
          <p className="stat-subtext">From customers</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">
              <FiDollarSign />
            </div>
          </div>
          <p className="stat-label">Total Payable</p>
          <p className="stat-value">{formatCurrency(stats?.payable)}</p>
          <p className="stat-subtext">To vendors</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">
              <FiDollarSign />
            </div>
          </div>
          <p className="stat-label">Today's Receipts</p>
          <p className="stat-value">{formatCurrency(stats?.receipts?.today?.total)}</p>
          <p className="stat-subtext">{stats?.receipts?.today?.count || 0} payments</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Alerts</h2>
        <div className="alerts-grid">
          {stats?.alerts?.lowStock > 0 && (
            <div className="alert-card warning">
              <FiPackage className="alert-icon" />
              <div className="alert-content">
                <span className="alert-count">{stats.alerts.lowStock}</span>
                <span className="alert-text">Low Stock Items</span>
              </div>
              <Link to="/erp/stock?filter=low" className="alert-link">View →</Link>
            </div>
          )}

          {stats?.alerts?.expiring > 0 && (
            <div className="alert-card warning">
              <FiClock className="alert-icon" />
              <div className="alert-content">
                <span className="alert-count">{stats.alerts.expiring}</span>
                <span className="alert-text">Expiring Soon (90 days)</span>
              </div>
              <Link to="/erp/stock?filter=expiring" className="alert-link">View →</Link>
            </div>
          )}

          {stats?.alerts?.expired > 0 && (
            <div className="alert-card danger">
              <FiAlertTriangle className="alert-icon" />
              <div className="alert-content">
                <span className="alert-count">{stats.alerts.expired}</span>
                <span className="alert-text">Expired Batches</span>
              </div>
              <Link to="/erp/stock?filter=expired" className="alert-link">View →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Sales</h3>
            <Link to="/erp/sales" className="view-all">View All</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivity?.sales?.length > 0 ? (
                  stats.recentActivity.sales.map((sale) => (
                    <tr key={sale._id}>
                      <td>{sale.invoiceNumber}</td>
                      <td>{sale.customerName || sale.customer?.name}</td>
                      <td>{formatCurrency(sale.grandTotal)}</td>
                      <td>
                        <span className={`badge badge-${sale.paymentStatus === 'paid' ? 'success' : sale.paymentStatus === 'partial' ? 'warning' : 'danger'}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No recent sales</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Purchases</h3>
            <Link to="/erp/purchases" className="view-all">View All</Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivity?.purchases?.length > 0 ? (
                  stats.recentActivity.purchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td>{purchase.invoiceNumber}</td>
                      <td>{purchase.vendorName || purchase.vendor?.name}</td>
                      <td>{formatCurrency(purchase.grandTotal)}</td>
                      <td>
                        <span className={`badge badge-${purchase.paymentStatus === 'paid' ? 'success' : purchase.paymentStatus === 'partial' ? 'warning' : 'danger'}`}>
                          {purchase.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No recent purchases</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
