import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEye, FiPrinter } from 'react-icons/fi';
import useSaleStore from '../../store/saleStore';
import './Sales.css';

const Sales = () => {
  const { sales, total, pages, isLoading, fetchSales } = useSaleStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchSales({ page, search, paymentStatus: status });
  }, [page, search, status, fetchSales]);

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
          <h1 className="page-title">Sales</h1>
          <p className="page-subtitle">Manage your sales invoices</p>
        </div>
        <Link to="/erp/sales/new" className="btn btn-primary">
          <FiPlus /> New Sale
        </Link>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by invoice or customer..."
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

      {/* Sales Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
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
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="font-medium">{sale.invoiceNumber}</td>
                    <td>{formatDate(sale.saleDate)}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.items?.length || 0}</td>
                    <td className="font-medium">{formatCurrency(sale.grandTotal)}</td>
                    <td className="text-green">{formatCurrency(sale.paidAmount)}</td>
                    <td className="text-red">{formatCurrency(sale.balanceAmount)}</td>
                    <td>
                      <span className={`badge badge-${sale.paymentStatus === 'paid' ? 'success' : sale.paymentStatus === 'partial' ? 'warning' : 'danger'}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" title="View">
                          <FiEye />
                        </button>
                        <button className="action-btn" title="Print">
                          <FiPrinter />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No sales found</td>
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

export default Sales;
