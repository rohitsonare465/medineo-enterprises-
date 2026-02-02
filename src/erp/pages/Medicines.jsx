import React, { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useMedicineStore from '../../store/medicineStore';
import MedicineModal from '../components/MedicineModal';
import './Medicines.css';

const Medicines = () => {
  const { medicines, pages, isLoading, fetchMedicines, createMedicine, updateMedicine, deleteMedicine } = useMedicineStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicines({ page, search, category });
  }, [page, search, category, fetchMedicines]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handleAdd = () => {
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    let result;

    if (selectedMedicine) {
      result = await updateMedicine(selectedMedicine._id, data);
    } else {
      result = await createMedicine(data);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(selectedMedicine ? 'Medicine updated successfully' : 'Medicine added successfully');
      setIsModalOpen(false);
      fetchMedicines({ page, search, category });
    } else {
      toast.error(result.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      const result = await deleteMedicine(id);
      if (result.success) {
        toast.success('Medicine deleted successfully');
      } else {
        toast.error(result.message || 'Failed to delete medicine');
      }
    }
  };

  return (
    <div className="medicines-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">Manage medicine master data</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add Medicine
        </button>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input filter-select"
          >
            <option value="">All Categories</option>
            <option value="Tablets">Tablets</option>
            <option value="Capsules">Capsules</option>
            <option value="Syrups">Syrups</option>
            <option value="Injections">Injections</option>
            <option value="Ointments">Ointments</option>
            <option value="Drops">Drops</option>
            <option value="Powders">Powders</option>
            <option value="Surgical">Surgical</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Category</th>
                <th>Stock</th>
                <th>MRP</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center">Loading...</td>
                </tr>
              ) : medicines.length > 0 ? (
                medicines.map((medicine) => (
                  <tr key={medicine._id}>
                    <td><strong>{medicine.code}</strong></td>
                    <td>
                      <div>{medicine.name}</div>
                      <small className="text-muted">{medicine.genericName}</small>
                    </td>
                    <td>{medicine.manufacturer}</td>
                    <td className="capitalize">{medicine.category}</td>
                    <td>
                      <span className={`stock-badge ${medicine.currentStock < medicine.minStockLevel ? 'low' : 'ok'}`}>
                        {medicine.currentStock}
                      </span>
                    </td>
                    <td>{formatCurrency(medicine.mrp)}</td>
                    <td>{medicine.gstRate}%</td>
                    <td>
                      <button className="btn-icon" onClick={() => handleEdit(medicine)}>
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(medicine._id)}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">No medicines found</td>
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

      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        medicine={selectedMedicine}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Medicines;
