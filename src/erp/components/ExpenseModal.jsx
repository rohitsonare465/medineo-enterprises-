import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const CATEGORIES = [
  'Rent',
  'Electricity',
  'Salary',
  'Transport',
  'Office Supplies',
  'Maintenance',
  'Marketing',
  'Insurance',
  'Taxes & Fees',
  'Telephone & Internet',
  'Packaging',
  'Courier & Shipping',
  'Food & Refreshments',
  'Travel',
  'Professional Fees',
  'Bank Charges',
  'Miscellaneous'
];

const PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Debit Card'];

const initialForm = {
  title: '',
  description: '',
  category: '',
  amount: '',
  expenseDate: new Date().toISOString().split('T')[0],
  paymentMode: 'Cash',
  paidTo: '',
  billNumber: '',
  bankName: '',
  transactionReference: '',
  chequeNumber: '',
  isRecurring: false,
  recurringFrequency: '',
  status: 'paid'
};

const ExpenseModal = ({ isOpen, onClose, onSubmit, expense, isSubmitting }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title || '',
        description: expense.description || '',
        category: expense.category || '',
        amount: expense.amount || '',
        expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMode: expense.paymentMode || 'Cash',
        paidTo: expense.paidTo || '',
        billNumber: expense.billNumber || '',
        bankName: expense.bankName || '',
        transactionReference: expense.transactionReference || '',
        chequeNumber: expense.chequeNumber || '',
        isRecurring: expense.isRecurring || false,
        recurringFrequency: expense.recurringFrequency || '',
        status: expense.status || 'paid'
      });
    } else {
      setForm(initialForm);
    }
  }, [expense, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      amount: parseFloat(form.amount)
    };
    if (!data.isRecurring) {
      data.recurringFrequency = null;
    }
    onSubmit(data);
  };

  if (!isOpen) return null;

  const showBankFields = ['Bank Transfer', 'UPI', 'Credit Card', 'Debit Card'].includes(form.paymentMode);
  const showChequeFields = form.paymentMode === 'Cheque';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="btn-icon" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Title */}
              <div className="form-group col-span-2">
                <label className="form-label">Expense Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Office Rent - January"
                  required
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className="form-input" required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              {/* Payment Mode */}
              <div className="form-group">
                <label className="form-label">Payment Mode *</label>
                <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="form-input" required>
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              {/* Paid To */}
              <div className="form-group">
                <label className="form-label">Paid To</label>
                <input
                  type="text"
                  name="paidTo"
                  value={form.paidTo}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Person/Company name"
                />
              </div>

              {/* Bill Number */}
              <div className="form-group">
                <label className="form-label">Bill/Invoice Number</label>
                <input
                  type="text"
                  name="billNumber"
                  value={form.billNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Optional reference"
                />
              </div>

              {/* Bank fields */}
              {showBankFields && (
                <>
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transaction Reference</label>
                    <input
                      type="text"
                      name="transactionReference"
                      value={form.transactionReference}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              {/* Cheque fields */}
              {showChequeFields && (
                <>
                  <div className="form-group">
                    <label className="form-label">Cheque Number</label>
                    <input
                      type="text"
                      name="chequeNumber"
                      value={form.chequeNumber}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div className="form-group col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="2"
                  placeholder="Additional details about the expense..."
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-input">
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Recurring */}
              <div className="form-group">
                <label className="form-label checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={form.isRecurring}
                    onChange={handleChange}
                  />
                  <span>Recurring Expense</span>
                </label>
                {form.isRecurring && (
                  <select
                    name="recurringFrequency"
                    value={form.recurringFrequency}
                    onChange={handleChange}
                    className="form-input"
                    style={{ marginTop: '0.5rem' }}
                  >
                    <option value="">Select Frequency</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
