import React, { useState, useEffect } from 'react';
import { FiX, FiTruck, FiDollarSign, FiCreditCard, FiFileText } from 'react-icons/fi';
import api from '../../services/api';
import './ReceiptModal.css';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        vendor: '',
        amount: '',
        paymentMode: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchVendors();
            setError('');
            setFormData({
                vendor: '',
                amount: '',
                paymentMode: 'Cash',
                paymentDate: new Date().toISOString().split('T')[0],
                notes: ''
            });
        }
    }, [isOpen]);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendors?limit=100');
            setVendors(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            setError('Failed to load vendors');
        }
        setIsLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.vendor) {
            setError('Please select a vendor');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/payments/vendor-payment', {
                vendor: formData.vendor,
                amount: parseFloat(formData.amount),
                paymentMode: formData.paymentMode,
                paymentDate: formData.paymentDate,
                notes: formData.notes
            });

            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create payment:', error);
            setError(error.response?.data?.message || 'Failed to create payment');
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Vendor Payment</h2>
                    <button className="modal-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="alert alert-error">{error}</div>}

                        <div className="form-group">
                            <label className="form-label">
                                <FiTruck className="label-icon" /> Vendor *
                            </label>
                            {isLoading ? (
                                <p>Loading vendors...</p>
                            ) : (
                                <select
                                    name="vendor"
                                    value={formData.vendor}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => (
                                        <option key={v._id} value={v._id}>
                                            {v.name} ({v.code})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    <FiDollarSign className="label-icon" /> Amount *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <FiCreditCard className="label-icon" /> Payment Mode *
                                </label>
                                <select
                                    name="paymentMode"
                                    value={formData.paymentMode}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="RTGS/NEFT">RTGS/NEFT</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Date</label>
                            <input
                                type="date"
                                name="paymentDate"
                                value={formData.paymentDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FiFileText className="label-icon" /> Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Optional notes..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
