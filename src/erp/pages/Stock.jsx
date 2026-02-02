import React, { useEffect, useState, useCallback } from 'react';
import { FiPackage, FiAlertTriangle, FiClock, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import './Stock.css';

const Stock = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let endpoint = '/stock/overview';
      if (activeTab === 'low') endpoint = '/stock/low';
      if (activeTab === 'out') endpoint = '/stock/out-of-stock';
      if (activeTab === 'expiring') endpoint = '/stock/expiry-alerts';
      if (activeTab === 'summary') endpoint = '/stock/summary';

      const response = await api.get(endpoint);
      
      if (activeTab === 'summary') {
        setSummary(response.data.data);
      } else {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    }
    setIsLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'All Stock', icon: FiPackage },
    { id: 'low', label: 'Low Stock', icon: FiAlertTriangle },
    { id: 'out', label: 'Out of Stock', icon: FiAlertTriangle },
    { id: 'expiring', label: 'Expiring Soon', icon: FiClock },
    { id: 'summary', label: 'Summary', icon: FiPackage }
  ];

  return (
    <div className="stock-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Management</h1>
          <p className="page-subtitle">Track inventory and batch-wise stock</p>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'summary' && (
        <div className="card filters-card">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? (
          <div className="text-center" style={{ padding: '3rem' }}>Loading...</div>
        ) : activeTab === 'summary' ? (
          <div className="summary-grid">
            <div className="summary-card">
              <h4>Total Medicines</h4>
              <p className="summary-value">{summary?.totalMedicines || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Batches</h4>
              <p className="summary-value">{summary?.totalBatches || 0}</p>
            </div>
            <div className="summary-card">
              <h4>Total Stock Value</h4>
              <p className="summary-value">{formatCurrency(summary?.totalValue)}</p>
            </div>
            <div className="summary-card warning">
              <h4>Low Stock Items</h4>
              <p className="summary-value">{summary?.lowStockCount || 0}</p>
            </div>
            <div className="summary-card danger">
              <h4>Expiring in 90 Days</h4>
              <p className="summary-value">{summary?.expiringCount || 0}</p>
            </div>
            <div className="summary-card danger">
              <h4>Expired Batches</h4>
              <p className="summary-value">{summary?.expiredCount || 0}</p>
            </div>
          </div>
        ) : activeTab === 'expiring' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry Date</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.medicineName}</td>
                    <td>{item.batchNumber}</td>
                    <td>{formatDate(item.expiryDate)}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`badge badge-${item.daysToExpiry <= 0 ? 'danger' : item.daysToExpiry <= 30 ? 'warning' : 'info'}`}>
                        {item.daysToExpiry <= 0 ? 'Expired' : `${item.daysToExpiry} days`}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="text-center">No data found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.code}</strong></td>
                    <td>{item.name}</td>
                    <td className="capitalize">{item.category}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.minStockLevel}</td>
                    <td>
                      <span className={`badge ${item.currentStock === 0 ? 'badge-danger' : item.currentStock < item.minStockLevel ? 'badge-warning' : 'badge-success'}`}>
                        {item.currentStock === 0 ? 'Out of Stock' : item.currentStock < item.minStockLevel ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center">No data found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
