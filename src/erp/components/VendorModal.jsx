import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './VendorModal.css';

const VendorModal = ({ isOpen, onClose, onSubmit, vendor, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        contactPerson: '',
        phone: '',
        email: '',
        gstin: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                code: vendor.code || '',
                contactPerson: vendor.contactPerson || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                gstin: vendor.gstin || '',
                street: vendor.address?.street || '',
                city: vendor.address?.city || '',
                state: vendor.address?.state || '',
                pincode: vendor.address?.pincode || '',
                isActive: vendor.isActive !== undefined ? vendor.isActive : true
            });
        } else {
            setFormData({
                name: '',
                code: '',
                contactPerson: '',
                phone: '',
                email: '',
                gstin: '',
                street: '',
                city: '',
                state: '',
                pincode: '',
                isActive: true
            });
        }
        setErrors({});
    }, [vendor, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vendor name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
            newErrors.gstin = 'Enter a valid GST number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Transform flat fields to the structure expected by backend
            const payload = {
                name: formData.name,
                code: formData.code || undefined,
                contactPerson: formData.contactPerson,
                phone: formData.phone,
                email: formData.email,
                gstin: formData.gstin ? formData.gstin.toUpperCase() : undefined,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                },
                isActive: formData.isActive
            };
            onSubmit(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content vendor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Vendor Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter vendor name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="code">Vendor Code</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="contactPerson">Contact Person</label>
                            <input
                                type="text"
                                id="contactPerson"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="Enter contact person name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone <span className="required">*</span></label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="gstin">GST Number (GSTIN)</label>
                            <input
                                type="text"
                                id="gstin"
                                name="gstin"
                                value={formData.gstin}
                                onChange={handleChange}
                                placeholder="e.g. 22AAAAA0000A1Z5"
                                className={errors.gstin ? 'error' : ''}
                            />
                            {errors.gstin && <span className="error-text">{errors.gstin}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <textarea
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="Enter street address"
                            rows="2"
                        />
                    </div>

                    <div className="form-row three-col">
                        <div className="form-group">
                            <label htmlFor="city">City <span className="required">*</span></label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State <span className="required">*</span></label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className={errors.state ? 'error' : ''}
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="pincode">Pincode</label>
                            <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Pincode"
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <span>Active Vendor</span>
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (vendor ? 'Update Vendor' : 'Add Vendor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorModal;
