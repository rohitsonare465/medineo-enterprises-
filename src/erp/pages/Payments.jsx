import React, { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiFilter, FiArrowDownCircle, FiArrowUpCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import api from '../../services/api';
import ReceiptModal from '../components/ReceiptModal';
import PaymentModal from '../components/PaymentModal';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('');

  // Modal states
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchPaymentsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.append('paymentType', type);
      if (paymentMode) params.append('paymentMode', paymentMode);

      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data.data);
      setPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
    setIsLoading(false);
  }, [page, type, paymentMode]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/payments/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchPaymentsData();
  }, [fetchPaymentsData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSuccess = () => {
    fetchPaymentsData();
    fetchSummary();
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

  const totalIn = summary?.customerReceipts?.total || 0;
  const totalOut = summary?.vendorPayments?.total || 0;
  const netBalance = totalIn - totalOut;

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track all credit (money in) and debit (money out) records</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-credit" onClick={() => setIsReceiptModalOpen(true)}>
            <FiArrowDownCircle /> Credit (Money In)
          </button>
          <button className="btn btn-debit" onClick={() => setIsPaymentModalOpen(true)}>
            <FiArrowUpCircle /> Debit (Money Out)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="payment-summary-cards">
        <div className="summary-card credit-summary">
          <div className="summary-card-icon credit-icon">
            <FiTrendingUp />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-label">Total Credit (Money In)</span>
            <span className="summary-card-value credit-value">{formatCurrency(totalIn)}</span>
            <span className="summary-card-count">{summary?.customerReceipts?.count || 0} receipts from customers</span>
          </div>
        </div>

        <div className="summary-card debit-summary">
          <div className="summary-card-icon debit-icon">
            <FiTrendingDown />
          </div>
          <div className="summary-card-info">
            <span className="summary-card-label">Total Debit (Money Out)</span>
            <span className="summary-card-value debit-value">{formatCurrency(totalOut)}</span>
            <span className="summary-card-count">{summary?.vendorPayments?.count || 0} payments to vendors</span>
          </div>
        </div>

        <div className={`summary-card balance-summary ${netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className={`summary-card-icon ${netBalance >= 0 ? 'credit-icon' : 'debit-icon'}`}>
            {netBalance >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          </div>
          <div className="summary-card-info">
            <span className="summary-card-label">Net Balance</span>
            <span className={`summary-card-value ${netBalance >= 0 ? 'credit-value' : 'debit-value'}`}>
              {formatCurrency(Math.abs(netBalance))}
            </span>
            <span className="summary-card-count">
              {netBalance >= 0 ? 'Net positive (more inflow)' : 'Net negative (more outflow)'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
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
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="form-input"
            >
              <option value="">All Transactions</option>
              <option value="customer_receipt">Credit (Money In)</option>
              <option value="vendor_payment">Debit (Money Out)</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={paymentMode}
              onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }}
              className="form-input"
            >
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="RTGS/NEFT">RTGS/NEFT</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>REF #</th>
                <th>DATE</th>
                <th>TYPE</th>
                <th>PARTY</th>
                <th>MODE</th>
                <th>CREDIT (IN)</th>
                <th>DEBIT (OUT)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center">Loading...</td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => {
                  const isCredit = payment.paymentType === 'customer_receipt';
                  return (
                    <tr key={payment._id}>
                      <td><strong>{payment.paymentNumber}</strong></td>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>
                        <span className={`type-badge ${isCredit ? 'type-credit' : 'type-debit'}`}>
                          {isCredit ? (
                            <><FiArrowDownCircle /> Credit</>
                          ) : (
                            <><FiArrowUpCircle /> Debit</>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="party-cell">
                          <span className="party-name">{payment.customerName || payment.vendorName}</span>
                          <span className="party-type">{isCredit ? 'Customer' : 'Vendor'}</span>
                        </div>
                      </td>
                      <td className="capitalize">{payment.paymentMode}</td>
                      <td className="text-success">
                        {isCredit ? formatCurrency(payment.amount) : '-'}
                      </td>
                      <td className="text-danger">
                        {!isCredit ? formatCurrency(payment.amount) : '-'}
                      </td>
                      <td>
                        <span className={`badge badge-${payment.status === 'cleared' ? 'success' : payment.status === 'bounced' ? 'danger' : 'warning'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center empty-state">
                    No payment records found. Use the buttons above to record Credit (money in) or Debit (money out).
                  </td>
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
        onSuccess={handleSuccess}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Payments;

