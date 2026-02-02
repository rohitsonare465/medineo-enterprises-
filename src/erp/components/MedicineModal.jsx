import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './MedicineModal.css';

const MedicineModal = ({ isOpen, onClose, onSubmit, medicine, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        brand: '',
        manufacturer: '',
        category: 'Tablets',
        packSize: '',
        composition: '',
        mrp: '',
        gstRate: '12',
        hsnCode: '',
        minStockLevel: '50',
        maxStockLevel: '500',
        reorderLevel: '100',
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (medicine) {
            setFormData({
                name: medicine.name || '',
                genericName: medicine.genericName || '',
                brand: medicine.brand || '',
                manufacturer: medicine.manufacturer || '',
                category: medicine.category || 'tablet',
                packSize: medicine.packSize || '',
                composition: medicine.composition || '',
                mrp: medicine.mrp?.toString() || '',
                gstRate: medicine.gstRate?.toString() || '12',
                hsnCode: medicine.hsnCode || '',
                minStockLevel: medicine.minStockLevel?.toString() || '50',
                maxStockLevel: medicine.maxStockLevel?.toString() || '500',
                reorderLevel: medicine.reorderLevel?.toString() || '100',
                isActive: medicine.isActive !== undefined ? medicine.isActive : true
            });
        } else {
            setFormData({
                name: '',
                genericName: '',
                brand: '',
                manufacturer: '',
                category: 'Tablets',
                packSize: '',
                composition: '',
                mrp: '',
                gstRate: '12',
                hsnCode: '',
                minStockLevel: '50',
                maxStockLevel: '500',
                reorderLevel: '100',
                isActive: true
            });
        }
        setErrors({});
    }, [medicine, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Medicine name is required';
        }

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Manufacturer is required';
        }

        if (!formData.packSize.trim()) {
            newErrors.packSize = 'Pack size is required (e.g., "10 tablets", "100ml")';
        }

        if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
            newErrors.mrp = 'MRP must be a positive number';
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
            const payload = {
                name: formData.name,
                genericName: formData.genericName || undefined,
                brand: formData.brand,
                manufacturer: formData.manufacturer,
                category: formData.category,
                packSize: formData.packSize,
                composition: formData.composition || undefined,
                mrp: parseFloat(formData.mrp),
                gstRate: parseInt(formData.gstRate),
                hsnCode: formData.hsnCode || undefined,
                minStockLevel: parseInt(formData.minStockLevel) || 50,
                maxStockLevel: parseInt(formData.maxStockLevel) || 500,
                reorderLevel: parseInt(formData.reorderLevel) || 100,
                isActive: formData.isActive
            };
            onSubmit(payload);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content medicine-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Medicine Name <span className="required">*</span></label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter medicine name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="genericName">Generic Name</label>
                            <input
                                type="text"
                                id="genericName"
                                name="genericName"
                                value={formData.genericName}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="brand">Brand <span className="required">*</span></label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="Enter brand name"
                                className={errors.brand ? 'error' : ''}
                            />
                            {errors.brand && <span className="error-text">{errors.brand}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="manufacturer">Manufacturer <span className="required">*</span></label>
                            <input
                                type="text"
                                id="manufacturer"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                placeholder="Enter manufacturer name"
                                className={errors.manufacturer ? 'error' : ''}
                            />
                            {errors.manufacturer && <span className="error-text">{errors.manufacturer}</span>}
                        </div>
                    </div>

                    <div className="form-row three-col">
                        <div className="form-group">
                            <label htmlFor="category">Category <span className="required">*</span></label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Tablets">Tablets</option>
                                <option value="Capsules">Capsules</option>
                                <option value="Syrups">Syrups</option>
                                <option value="Injections">Injections</option>
                                <option value="Ointments">Ointments</option>
                                <option value="Drops">Drops</option>
                                <option value="Powders">Powders</option>
                                <option value="Surgical">Surgical</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Consumables">Consumables</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="packSize">Pack Size <span className="required">*</span></label>
                            <input
                                type="text"
                                id="packSize"
                                name="packSize"
                                value={formData.packSize}
                                onChange={handleChange}
                                placeholder="e.g. 10 tablets, 100ml"
                                className={errors.packSize ? 'error' : ''}
                            />
                            {errors.packSize && <span className="error-text">{errors.packSize}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="hsnCode">HSN Code</label>
                            <input
                                type="text"
                                id="hsnCode"
                                name="hsnCode"
                                value={formData.hsnCode}
                                onChange={handleChange}
                                placeholder="e.g. 3004"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="composition">Composition</label>
                        <textarea
                            id="composition"
                            name="composition"
                            value={formData.composition}
                            onChange={handleChange}
                            placeholder="Enter drug composition/salt details"
                            rows="2"
                        />
                    </div>

                    <div className="form-row three-col">
                        <div className="form-group">
                            <label htmlFor="mrp">MRP (₹) <span className="required">*</span></label>
                            <input
                                type="number"
                                id="mrp"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={errors.mrp ? 'error' : ''}
                            />
                            {errors.mrp && <span className="error-text">{errors.mrp}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="gstRate">GST Rate <span className="required">*</span></label>
                            <select
                                id="gstRate"
                                name="gstRate"
                                value={formData.gstRate}
                                onChange={handleChange}
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section-title">Stock Settings</div>

                    <div className="form-row three-col">
                        <div className="form-group">
                            <label htmlFor="minStockLevel">Min Stock Level</label>
                            <input
                                type="number"
                                id="minStockLevel"
                                name="minStockLevel"
                                value={formData.minStockLevel}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reorderLevel">Reorder Level</label>
                            <input
                                type="number"
                                id="reorderLevel"
                                name="reorderLevel"
                                value={formData.reorderLevel}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxStockLevel">Max Stock Level</label>
                            <input
                                type="number"
                                id="maxStockLevel"
                                name="maxStockLevel"
                                value={formData.maxStockLevel}
                                onChange={handleChange}
                                min="0"
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
                            <span>Active Medicine</span>
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : (medicine ? 'Update Medicine' : 'Add Medicine')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicineModal;
