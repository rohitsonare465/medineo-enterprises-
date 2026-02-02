import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useVendorStore from '../../store/vendorStore';
import VendorModal from '../components/VendorModal';
import './Vendors.css';

const Vendors = () => {
  const { vendors, pages, isLoading, fetchVendors, createVendor, updateVendor, deleteVendor } = useVendorStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchVendors({ page, search });
  }, [page, search, fetchVendors]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleAddClick = () => {
    setSelectedVendor(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    try {
      let result;
      if (selectedVendor) {
        result = await updateVendor(selectedVendor._id, formData);
        if (result.success) {
          toast.success('Vendor updated successfully');
        } else {
          toast.error(result.message || 'Failed to update vendor');
        }
      } else {
        result = await createVendor(formData);
        if (result.success) {
          toast.success('Vendor added successfully');
        } else {
          toast.error(result.message || 'Failed to add vendor');
        }
      }

      if (result.success) {
        handleCloseModal();
        fetchVendors({ page, search });
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      const result = await deleteVendor(id);
      if (result.success) {
        toast.success('Vendor deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete vendor');
      }
    }
  };

  return (
    <div className="vendors-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage pharmaceutical suppliers</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddClick}>
          <FiPlus /> Add Vendor
        </button>
      </div>

      <div className="card filters-card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Contact</th>
                <th>GST Number</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading...</td>
                </tr>
              ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td><strong>{vendor.code}</strong></td>
                    <td>{vendor.name}</td>
                    <td>
                      <div>{vendor.contactPerson || '-'}</div>
                      <small className="text-muted">{vendor.phone}</small>
                    </td>
                    <td>{vendor.gstNumber || '-'}</td>
                    <td className={vendor.outstandingBalance > 0 ? 'text-danger' : ''}>
                      {formatCurrency(vendor.outstandingBalance)}
                    </td>
                    <td>
                      <span className={`badge badge-${vendor.isActive ? 'success' : 'danger'}`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEditClick(vendor)}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(vendor._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No vendors found</td>
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

      <VendorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        vendor={selectedVendor}
        isLoading={isSaving}
      />
    </div>
  );
};

export default Vendors;
