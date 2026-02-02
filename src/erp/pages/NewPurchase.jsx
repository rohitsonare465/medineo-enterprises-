import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useVendorStore from '../../store/vendorStore';
import useMedicineStore from '../../store/medicineStore';
import usePurchaseStore from '../../store/purchaseStore';
import './NewSale.css';

const NewPurchase = () => {
  const navigate = useNavigate();
  const { searchVendors } = useVendorStore();
  const { searchMedicines } = useMedicineStore();
  const { createPurchase } = usePurchaseStore();

  const [vendor, setVendor] = useState(null);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorResults, setVendorResults] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
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

  // Vendor search
  useEffect(() => {
    if (vendorSearch.length >= 2) {
      const timeout = setTimeout(async () => {
        const results = await searchVendors(vendorSearch);
        setVendorResults(results);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setVendorResults([]);
    }
  }, [vendorSearch, searchVendors]);

  // Medicine search
  useEffect(() => {
    if (medicineSearch.length >= 2) {
      const timeout = setTimeout(async () => {
        const results = await searchMedicines(medicineSearch);
        setMedicineResults(results);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setMedicineResults([]);
    }
  }, [medicineSearch, searchMedicines]);

  const selectVendor = (v) => {
    setVendor(v);
    setVendorSearch('');
    setVendorResults([]);
  };

  const addMedicine = (medicine) => {
    const newItem = {
      medicine: medicine._id,
      medicineName: medicine.name,
      medicineCode: medicine.code,
      batchNumber: '',
      expiryDate: '',
      quantity: 1,
      freeQty: 0,
      purchasePrice: 0,
      mrp: 0,
      gstRate: medicine.gstRate,
      discount: 0,
      discountAmount: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      totalAmount: 0
    };
    setItems([...items, newItem]);
    setMedicineSearch('');
    setMedicineResults([]);
  };

  const updateItemCalculations = (itemsArray, index) => {
    const item = itemsArray[index];
    const grossAmount = item.quantity * item.purchasePrice;
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
    if (['quantity', 'freeQty', 'purchasePrice', 'mrp', 'discount'].includes(field)) {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    updateItemCalculations(newItems, index);
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!vendor) {
      toast.error('Please select a vendor');
      return;
    }
    if (!invoiceNumber) {
      toast.error('Please enter vendor invoice number');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Validate items
    for (const item of items) {
      if (!item.batchNumber || !item.expiryDate) {
        toast.error('Please fill batch number and expiry for all items');
        return;
      }
    }

    setIsSubmitting(true);
    const purchaseData = {
      vendor: vendor._id,
      vendorInvoiceNumber: invoiceNumber,
      vendorInvoiceDate: invoiceDate,
      items: items.map(item => ({
        medicine: item.medicine,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        quantity: item.quantity,
        freeQty: item.freeQty,
        purchasePrice: item.purchasePrice,
        mrp: item.mrp,
        discount: item.discount,
        gstRate: item.gstRate
      }))
    };

    const result = await createPurchase(purchaseData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Purchase recorded successfully');
      navigate('/erp/purchases');
    } else {
      toast.error(result.message || 'Failed to create purchase');
    }
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
          <h1 className="page-title">New Purchase Entry</h1>
          <p className="page-subtitle">Record vendor purchase invoice</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/erp/purchases')}>
            <FiX /> Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <FiSave /> {isSubmitting ? 'Saving...' : 'Save Purchase'}
          </button>
        </div>
      </div>

      <div className="sale-form-grid">
        {/* Vendor Selection */}
        <div className="card customer-card">
          <h3 className="card-title">Vendor Details</h3>
          {vendor ? (
            <div className="selected-customer">
              <div className="customer-info">
                <strong>{vendor.name}</strong>
                <span>{vendor.code}</span>
                <span>GST: {vendor.gstNumber}</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setVendor(null)}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="customer-search">
              <input
                type="text"
                placeholder="Search vendor by name or code..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="form-input"
              />
              {vendorResults.length > 0 && (
                <div className="search-results">
                  {vendorResults.map((v) => (
                    <div 
                      key={v._id} 
                      className="search-result-item"
                      onClick={() => selectVendor(v)}
                    >
                      <strong>{v.name}</strong>
                      <span>{v.code} • {v.gstNumber}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Vendor Invoice #</label>
              <input
                type="text"
                className="form-input"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter vendor invoice number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                className="form-input"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="card summary-card">
          <h3 className="card-title">Purchase Summary</h3>
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
            placeholder="Search medicine by name or code..."
            value={medicineSearch}
            onChange={(e) => setMedicineSearch(e.target.value)}
            className="form-input"
          />
          {medicineResults.length > 0 && (
            <div className="search-results">
              {medicineResults.map((medicine) => (
                <div 
                  key={medicine._id} 
                  className="search-result-item"
                  onClick={() => addMedicine(medicine)}
                >
                  <strong>{medicine.name}</strong>
                  <span>{medicine.code} • GST: {medicine.gstRate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="card items-card">
        <h3 className="card-title">Purchase Items ({items.length})</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch #</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Free</th>
                <th>Rate</th>
                <th>MRP</th>
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
                    <td>
                      <input
                        type="text"
                        className="rate-input"
                        value={item.batchNumber}
                        onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                        placeholder="Batch #"
                      />
                    </td>
                    <td>
                      <input
                        type="month"
                        className="rate-input"
                        value={item.expiryDate}
                        onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="qty-input"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="qty-input"
                        value={item.freeQty}
                        min="0"
                        onChange={(e) => updateItem(index, 'freeQty', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="rate-input"
                        value={item.purchasePrice}
                        onChange={(e) => updateItem(index, 'purchasePrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="rate-input"
                        value={item.mrp}
                        onChange={(e) => updateItem(index, 'mrp', e.target.value)}
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
                  <td colSpan="12" className="text-center">
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

export default NewPurchase;
