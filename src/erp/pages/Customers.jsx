import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCustomerStore from '../../store/customerStore';
import './Customers.css';

const Customers = () => {
  const { customers, pages, isLoading, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    type: 'medical_store',
    gstin: '',
    drugLicenseNo: '',
    creditLimit: 50000,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCustomers({ page, search });
  }, [page, search, fetchCustomers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      type: 'medical_store',
      gstin: '',
      drugLicenseNo: '',
      creditLimit: 50000,
      address: { street: '', city: '', state: '', pincode: '' }
    });
    setEditingCustomer(null);
    setErrors({});
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name || '',
        contactPerson: customer.contactPerson || '',
        phone: customer.phone || '',
        email: customer.email || '',
        type: customer.type || 'medical_store',
        gstin: customer.gstin || '',
        drugLicenseNo: customer.drugLicenseNo || '',
        creditLimit: customer.creditLimit || 50000,
        address: customer.address || { street: '', city: '', state: '', pincode: '' }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }

    if (!formData.drugLicenseNo.trim()) {
      newErrors.drugLicenseNo = 'Drug License is required';
    }

    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
      newErrors.gstin = 'Enter a valid GST number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    // Transform data to match backend model
    const payload = {
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      type: formData.type,
      gstin: formData.gstin ? formData.gstin.toUpperCase() : undefined,
      drugLicenseNo: formData.drugLicenseNo,
      creditLimit: parseInt(formData.creditLimit) || 50000,
      address: {
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        pincode: formData.address.pincode
      }
    };

    let result;
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer._id, payload);
    } else {
      result = await createCustomer(payload);
    }

    setIsSaving(false);

    if (result.success) {
      toast.success(editingCustomer ? 'Customer updated' : 'Customer created');
      closeModal();
      fetchCustomers({ page, search });
    } else {
      toast.error(result.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const result = await deleteCustomer(id);
      if (result.success) {
        toast.success('Customer deleted');
      } else {
        toast.error(result.message || 'Delete failed');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customers and their credit</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, code or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>City</th>
                <th>Credit Limit</th>
                <th>Outstanding</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center">Loading...</td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="font-medium">{customer.code}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className={`badge badge-${customer.type === 'hospital' ? 'info' : 'success'}`}>
                        {customer.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{customer.address?.city}</td>
                    <td>{formatCurrency(customer.creditLimit)}</td>
                    <td className={customer.outstandingBalance > 0 ? 'text-red' : ''}>
                      {formatCurrency(customer.outstandingBalance)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn"
                          title="Edit"
                          onClick={() => openModal(customer)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="action-btn danger"
                          title="Delete"
                          onClick={() => handleDelete(customer._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="pagination-info">Page {page} of {pages}</span>
            <button className="pagination-btn" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={closeModal}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input type="text" name="contactPerson" className="form-input" value={formData.contactPerson} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span className="required">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
                    <option value="medical_store">Medical Store</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="distributor">Distributor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Credit Limit</label>
                  <input type="number" name="creditLimit" className="form-input" value={formData.creditLimit} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number (GSTIN)</label>
                  <input
                    type="text"
                    name="gstin"
                    className={`form-input ${errors.gstin ? 'error' : ''}`}
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                  />
                  {errors.gstin && <span className="error-text">{errors.gstin}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Drug License No <span className="required">*</span></label>
                  <input
                    type="text"
                    name="drugLicenseNo"
                    className={`form-input ${errors.drugLicenseNo ? 'error' : ''}`}
                    value={formData.drugLicenseNo}
                    onChange={handleChange}
                  />
                  {errors.drugLicenseNo && <span className="error-text">{errors.drugLicenseNo}</span>}
                </div>
              </div>
              <h3 style={{ margin: '1rem 0 0.5rem' }}>Address</h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Street</label>
                  <input type="text" name="address.street" className="form-input" value={formData.address.street} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address.city"
                    className={`form-input ${errors['address.city'] ? 'error' : ''}`}
                    value={formData.address.city}
                    onChange={handleChange}
                  />
                  {errors['address.city'] && <span className="error-text">{errors['address.city']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="address.state"
                    className={`form-input ${errors['address.state'] ? 'error' : ''}`}
                    value={formData.address.state}
                    onChange={handleChange}
                  />
                  {errors['address.state'] && <span className="error-text">{errors['address.state']}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" name="address.pincode" className="form-input" value={formData.address.pincode} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
