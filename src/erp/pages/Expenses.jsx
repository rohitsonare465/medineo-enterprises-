import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiTrendingDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useExpenseStore from '../../store/expenseStore';
import ExpenseModal from '../components/ExpenseModal';
import './Expenses.css';

const Expenses = () => {
  const { expenses, pages, summary, isLoading, fetchExpenses, fetchSummary, createExpense, updateExpense, deleteExpense } = useExpenseStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(() => {
    const params = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (paymentMode) params.paymentMode = paymentMode;
    fetchExpenses(params);
  }, [page, search, category, paymentMode, fetchExpenses]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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

  const handleAdd = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    let result;

    if (selectedExpense) {
      result = await updateExpense(selectedExpense._id, data);
    } else {
      result = await createExpense(data);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(selectedExpense ? 'Expense updated successfully' : 'Expense added successfully');
      setIsModalOpen(false);
      fetchData();
      fetchSummary();
    } else {
      toast.error(result.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const result = await deleteExpense(id);
      if (result.success) {
        toast.success('Expense deleted successfully');
        fetchSummary();
      } else {
        toast.error(result.message || 'Failed to delete expense');
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      paid: 'badge-success',
      pending: 'badge-warning',
      cancelled: 'badge-danger'
    };
    return map[status] || 'badge-secondary';
  };

  return (
    <div className="expenses-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Track and manage company expenses & debits</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="expense-summary-cards">
          <div className="summary-card total-card">
            <div className="summary-icon"><FiTrendingDown /></div>
            <div>
              <span className="summary-label">This Month Total</span>
              <span className="summary-value">{formatCurrency(summary.totalAmount)}</span>
            </div>
          </div>
          <div className="summary-card count-card">
            <div className="summary-icon">📋</div>
            <div>
              <span className="summary-label">Total Entries</span>
              <span className="summary-value">{summary.totalCount}</span>
            </div>
          </div>
          {summary.categoryBreakdown?.slice(0, 2).map((cat, idx) => (
            <div key={idx} className="summary-card category-card">
              <div>
                <span className="summary-label">{cat._id}</span>
                <span className="summary-value">{formatCurrency(cat.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <FiFilter />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="form-input"
            >
              <option value="">All Categories</option>
              <option value="Rent">Rent</option>
              <option value="Electricity">Electricity</option>
              <option value="Salary">Salary</option>
              <option value="Transport">Transport</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Marketing">Marketing</option>
              <option value="Insurance">Insurance</option>
              <option value="Taxes & Fees">Taxes & Fees</option>
              <option value="Telephone & Internet">Telephone & Internet</option>
              <option value="Packaging">Packaging</option>
              <option value="Courier & Shipping">Courier & Shipping</option>
              <option value="Food & Refreshments">Food & Refreshments</option>
              <option value="Travel">Travel</option>
              <option value="Professional Fees">Professional Fees</option>
              <option value="Bank Charges">Bank Charges</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={paymentMode}
              onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }}
              className="form-input"
            >
              <option value="">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>EXP #</th>
                <th>DATE</th>
                <th>TITLE</th>
                <th>CATEGORY</th>
                <th>PAID TO</th>
                <th>MODE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="text-center">Loading...</td>
                </tr>
              ) : expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td><strong>{expense.expenseNumber}</strong></td>
                    <td>{formatDate(expense.expenseDate)}</td>
                    <td>
                      <div className="expense-title-cell">
                        <span className="expense-name">{expense.title}</span>
                        {expense.description && (
                          <span className="expense-desc">{expense.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{expense.category}</span>
                    </td>
                    <td>{expense.paidTo || '-'}</td>
                    <td>{expense.paymentMode}</td>
                    <td className="text-danger expense-amount">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => handleEdit(expense)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDelete(expense._id)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
                    No expenses found. Click "Add Expense" to record your first expense.
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

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        expense={selectedExpense}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Expenses;
