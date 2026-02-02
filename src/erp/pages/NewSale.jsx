import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCustomerStore from '../../store/customerStore';
import useMedicineStore from '../../store/medicineStore';
import useSaleStore from '../../store/saleStore';
import './NewSale.css';

const NewSale = () => {
  const navigate = useNavigate();
  const { searchCustomers } = useCustomerStore();
  const { searchForBilling } = useMedicineStore();
  const { createSale } = useSaleStore();

  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [items, setItems] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineResults, setMedicineResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const totals = items.reduce((acc, item) => {
    acc.taxable += item.taxableAmount || 0;
    acc.cgst += item.cgstAmount || 0;
    acc.sgst += item.sgstAmount || 0;
    acc.total += item.totalAmount || 0;
    return acc;
  }, { taxable: 0, cgst: 0, sgst: 0, total: 0 });

  // Customer search
  useEffect(() => {
    if (customerSearch.length >= 2) {
      const timeout = setTimeout(async () => {
        const results = await searchCustomers(customerSearch);
        setCustomerResults(results);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setCustomerResults([]);
    }
  }, [customerSearch, searchCustomers]);

  // Medicine search
  useEffect(() => {
    if (medicineSearch.length >= 2) {
      const timeout = setTimeout(async () => {
        const results = await searchForBilling(medicineSearch);
        setMedicineResults(results);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setMedicineResults([]);
    }
  }, [medicineSearch, searchForBilling]);

  const selectCustomer = (c) => {
    setCustomer(c);
    setCustomerSearch('');
    setCustomerResults([]);
  };

  const addMedicine = (medicine, batch) => {
    const existingIndex = items.findIndex(
      item => item.medicine === medicine._id && item.batch === batch._id
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      updateItemCalculations(newItems, existingIndex);
      setItems(newItems);
    } else {
      const newItem = {
        medicine: medicine._id,
        medicineName: medicine.name,
        medicineCode: medicine.code,
        batch: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: 1,
        availableQty: batch.quantity,
        mrp: batch.mrp,
        salePrice: batch.salePrice || batch.mrp,
        gstRate: medicine.gstRate,
        discount: 0,
        discountAmount: 0,
        taxableAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 0
      };
      const newItems = [...items, newItem];
      updateItemCalculations(newItems, newItems.length - 1);
      setItems(newItems);
    }
    setMedicineSearch('');
    setMedicineResults([]);
  };

  const updateItemCalculations = (itemsArray, index) => {
    const item = itemsArray[index];
    const grossAmount = item.quantity * item.salePrice;
    const discountAmount = (grossAmount * item.discount) / 100;
    const taxableAmount = grossAmount - discountAmount;
    const gstAmount = (taxableAmount * item.gstRate) / 100;
    const cgstAmount = gstAmount / 2;
    const sgstAmount = gstAmount / 2;
    const totalAmount = taxableAmount + gstAmount;

    itemsArray[index] = {
      ...item,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      totalAmount
    };
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = parseFloat(value) || 0;

    if (field === 'quantity' && newItems[index].quantity > newItems[index].availableQty) {
      toast.error('Quantity exceeds available stock');
      newItems[index].quantity = newItems[index].availableQty;
    }

    updateItemCalculations(newItems, index);
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!customer) {
      toast.error('Please select a customer');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setIsSubmitting(true);
    const saleData = {
      customer: customer._id,
      items: items.map(item => ({
        medicine: item.medicine,
        batch: item.batch,
        quantity: item.quantity,
        sellingPrice: item.salePrice,
        discountPercent: item.discount
      }))
    };

    const result = await createSale(saleData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Sale created: ${result.data.invoiceNumber}`);
      navigate('/erp/sales');
    } else {
      toast.error(result.message || 'Failed to create sale');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="new-sale-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Sale Invoice</h1>
          <p className="page-subtitle">Create a new GST compliant sale invoice</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/erp/sales')}>
            <FiX /> Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <FiSave /> {isSubmitting ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="sale-form-grid">
        {/* Customer Selection */}
        <div className="card customer-card">
          <h3 className="card-title">Customer Details</h3>
          {customer ? (
            <div className="selected-customer">
              <div className="customer-info">
                <strong>{customer.name}</strong>
                <span>{customer.code}</span>
                <span>{customer.phone}</span>
                <span>{customer.address?.city}, {customer.address?.state}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCustomer(null)}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="customer-search">
              <input
                type="text"
                placeholder="Search customer by name, code or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="form-input"
              />
              {customerResults.length > 0 && (
                <div className="search-results">
                  {customerResults.map((c) => (
                    <div
                      key={c._id}
                      className="search-result-item"
                      onClick={() => selectCustomer(c)}
                    >
                      <strong>{c.name}</strong>
                      <span>{c.code} • {c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="card summary-card">
          <h3 className="card-title">Invoice Summary</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Taxable Amount</span>
              <span>{formatCurrency(totals.taxable)}</span>
            </div>
            <div className="summary-row">
              <span>CGST</span>
              <span>{formatCurrency(totals.cgst)}</span>
            </div>
            <div className="summary-row">
              <span>SGST</span>
              <span>{formatCurrency(totals.sgst)}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Search */}
      <div className="card medicine-search-card">
        <div className="medicine-search">
          <input
            type="text"
            placeholder="Search medicine by name or code... (Press Enter to add)"
            value={medicineSearch}
            onChange={(e) => setMedicineSearch(e.target.value)}
            className="form-input"
          />
          {medicineSearch.length >= 2 && medicineResults.length === 0 && (
            <div className="medicine-results no-results">
              <div className="no-results-message">
                <p>No medicines found with available stock.</p>
                <p className="hint">Make sure you have created purchases to add stock first.</p>
              </div>
            </div>
          )}
          {medicineResults.length > 0 && (
            <div className="medicine-results">
              {medicineResults.map((medicine) => (
                <div key={medicine._id} className="medicine-result-group">
                  <div className="medicine-name">{medicine.name} ({medicine.code})</div>
                  {medicine.batches?.length > 0 ? (
                    <div className="batch-list">
                      {medicine.batches.map((batch) => (
                        <div
                          key={batch._id}
                          className="batch-item"
                          onClick={() => addMedicine(medicine, batch)}
                        >
                          <span>Batch: {batch.batchNumber}</span>
                          <span>Exp: {formatDate(batch.expiryDate)}</span>
                          <span>Stock: {batch.quantity}</span>
                          <span>MRP: ₹{batch.mrp}</span>
                          <button className="add-btn"><FiPlus /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-batches">No available batches with stock</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="card items-card">
        <h3 className="card-title">Invoice Items ({items.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>MRP</th>
                <th>Rate</th>
                <th>Disc%</th>
                <th>GST%</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="item-name">{item.medicineName}</div>
                      <div className="item-code">{item.medicineCode}</div>
                    </td>
                    <td>{item.batchNumber}</td>
                    <td>{formatDate(item.expiryDate)}</td>
                    <td>
                      <input
                        type="number"
                        className="qty-input"
                        value={item.quantity}
                        min="1"
                        max={item.availableQty}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                      <span className="avl-qty">/{item.availableQty}</span>
                    </td>
                    <td>₹{item.mrp}</td>
                    <td>
                      <input
                        type="number"
                        className="rate-input"
                        value={item.salePrice}
                        onChange={(e) => updateItem(index, 'salePrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="disc-input"
                        value={item.discount}
                        min="0"
                        max="100"
                        onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      />
                    </td>
                    <td>{item.gstRate}%</td>
                    <td className="font-medium">{formatCurrency(item.totalAmount)}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No items added. Search and add medicines above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewSale;
