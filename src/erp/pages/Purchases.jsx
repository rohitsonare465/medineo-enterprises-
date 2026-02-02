import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEye } from 'react-icons/fi';
import usePurchaseStore from '../../store/purchaseStore';
import './Sales.css';

const Purchases = () => {
  const { purchases, total, pages, isLoading, fetchPurchases } = usePurchaseStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPurchases({ page, search, paymentStatus: status });
  }, [page, search, status, fetchPurchases]);

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

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">Manage vendor purchase invoices</p>
        </div>
        <Link to="/erp/purchases/new" className="btn btn-primary">
          <FiPlus /> New Purchase
        </Link>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by invoice or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center">Loading...</td>
                </tr>
              ) : purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase._id}>
                    <td className="font-medium">{purchase.invoiceNumber}</td>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>{purchase.vendorName}</td>
                    <td>{purchase.items?.length || 0}</td>
                    <td className="font-medium">{formatCurrency(purchase.grandTotal)}</td>
                    <td className="text-green">{formatCurrency(purchase.paidAmount)}</td>
                    <td className="text-red">{formatCurrency(purchase.balanceAmount)}</td>
                    <td>
                      <span className={`badge badge-${purchase.paymentStatus === 'paid' ? 'success' : purchase.paymentStatus === 'partial' ? 'warning' : 'danger'}`}>
                        {purchase.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="View">
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No purchases found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page} of {pages} ({total} total)
            </span>
            <button
              className="pagination-btn"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;
