import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import ReceiptModal from '../components/ReceiptModal';
import PaymentModal from '../components/PaymentModal';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  // Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchPaymentsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.append('paymentType', type);

      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data.data);
      setPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
    setIsLoading(false);
  }, [page, type]);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  const handleReceiptSuccess = () => {
    fetchPaymentsData();
  };

  const handlePaymentSuccess = () => {
    fetchPaymentsData();
  };

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
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Manage customer receipts and vendor payments</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setIsReceiptModalOpen(true)}>
            <FiPlus /> New Receipt
          </button>
          <button className="btn btn-secondary" onClick={() => setIsPaymentModalOpen(true)}>
            <FiPlus /> New Payment
          </button>
        </div>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <FiFilter />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="customer_receipt">Customer Receipts</option>
              <option value="vendor_payment">Vendor Payments</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Type</th>
                <th>Party</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment._id}>
                    <td><strong>{payment.paymentNumber}</strong></td>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>
                      <span className={`badge badge-${payment.paymentType === 'customer_receipt' ? 'success' : 'info'}`}>
                        {payment.paymentType === 'customer_receipt' ? 'Receipt' : 'Payment'}
                      </span>
                    </td>
                    <td>{payment.customerName || payment.vendorName}</td>
                    <td className="capitalize">{payment.paymentMode}</td>
                    <td className={payment.paymentType === 'customer_receipt' ? 'text-success' : 'text-danger'}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <span className={`badge badge-${payment.status === 'cleared' ? 'success' : 'warning'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary">
              Previous
            </button>
            <span className="page-info">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-secondary">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onSuccess={handleReceiptSuccess}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Payments;

