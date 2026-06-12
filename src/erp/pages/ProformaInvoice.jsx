import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiPlus, FiPrinter, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ProformaInvoiceTemplate from '../components/ProformaInvoiceTemplate';
import './ProformaInvoice.css';

const buildDefaultInvoice = () => ({
  quotationNumber: 'GGD/N/174',
  invoiceDate: '2026-06-03',
  otherReference: '',
  termsOfDelivery: '100 % ADVANCE BEFORE DISPATCH',
  deliveryTime: '1 or 2 Days ( After Payment )',
  priceNote: 'Price: Ex-works Delhi Office',
  billTo: {
    name: 'Medineo Enterprises',
    flatNo: 'S-16',
    street: 'PURUWASHA NAGAR',
    locality: 'Jatkheri',
    city: 'Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    pinCode: '462047',
    gstin: '',
    dl: '',
    phone: '',
    email: ''
  },
  shipTo: {
    name: 'Medineo Enterprises',
    flatNo: 'S-16',
    street: 'PURUWASHA NAGAR',
    locality: 'Jatkheri',
    city: 'Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    pinCode: '462047',
    gstin: ''
  },
  items: [
    {
      productName: 'Standard Hba1c',
      hsn: '',
      gstRate: 5,
      qty: 20,
      unit: '',
      unitCost: 1950
    }
  ]
});

const ProformaInvoice = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [invoice, setInvoice] = useState(buildDefaultInvoice());

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data.data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const totals = useMemo(() => invoice.items.reduce((acc, item) => {
    const qty = Number(item.qty) || 0;
    const unitCost = Number(item.unitCost) || 0;
    const gstRate = Number(item.gstRate) || 0;
    const taxableAmount = qty * unitCost;
    const gstAmount = (taxableAmount * gstRate) / 100;
    const total = taxableAmount + gstAmount;

    acc.taxable += taxableAmount;
    acc.gst += gstAmount;
    acc.total += total;
    return acc;
  }, { taxable: 0, gst: 0, total: 0 }), [invoice.items]);

  const updateBillTo = (field, value) => {
    setInvoice((current) => ({
      ...current,
      billTo: { ...current.billTo, [field]: value }
    }));
  };

  const updateShipTo = (field, value) => {
    setInvoice((current) => ({
      ...current,
      shipTo: { ...current.shipTo, [field]: value }
    }));
  };

  const updateItem = (index, field, value) => {
    setInvoice((current) => {
      const items = [...current.items];
      items[index] = {
        ...items[index],
        [field]: ['gstRate', 'qty', 'unitCost'].includes(field) ? Number(value) || 0 : value
      };
      return { ...current, items };
    });
  };

  const addItem = () => {
    setInvoice((current) => ({
      ...current,
      items: [...current.items, { productName: '', hsn: '', gstRate: 5, qty: 1, unit: '', unitCost: 0 }]
    }));
  };

  const removeItem = (index) => {
    setInvoice((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const copyBillToShip = () => {
    setInvoice((current) => ({
      ...current,
      shipTo: { ...current.billTo }
    }));
    toast.success('Bill to details copied to Ship To');
  };

  const resetSample = () => {
    setInvoice(buildDefaultInvoice());
    toast.success('Sample PI restored');
  };

  const exportPdf = async (action = 'download') => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    const originalWidth = element.style.width;
    const originalSmoothing = element.style.webkitFontSmoothing;

    element.style.width = '210mm';
    element.style.webkitFontSmoothing = 'antialiased';
    element.classList.add('pdf-mode');
    setDownloading(true);

    const options = {
      margin: 0,
      filename: `PI-${invoice.quotationNumber || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      if (action === 'download') {
        await html2pdf().set(options).from(previewRef.current).save();
        toast.success('Proforma invoice downloaded');
      } else if (action === 'print') {
        const pdfBlob = await html2pdf().set(options).from(previewRef.current).output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
      }
    } catch (error) {
      console.error('Failed to export proforma invoice:', error);
      toast.error('Failed to export proforma invoice');
    } finally {
      element.classList.remove('pdf-mode');
      element.style.width = originalWidth;
      element.style.webkitFontSmoothing = originalSmoothing;
      setDownloading(false);
    }
  };

  return (
    <div className="proforma-page">
      <div className="page-header proforma-page-header">
        <div>
          <h1 className="page-title">Proforma Invoice</h1>
          <p className="page-subtitle">Generate a print-ready PI in the ERP panel</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/erp')}>
            <FiArrowLeft /> Back
          </button>
          <button className="btn btn-secondary" onClick={resetSample}>
            <FiRotateCcw /> Reset Sample
          </button>
          <button className="btn btn-secondary" onClick={() => exportPdf('print')} disabled={downloading}>
            <FiPrinter /> Print
          </button>
          <button className="btn btn-primary" onClick={() => exportPdf('download')} disabled={downloading}>
            <FiDownload /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="proforma-layout">
        <div className="card proforma-editor">
          <div className="section-header">
            <div>
              <h3>Document Details</h3>
              <span className="section-hint">Header and billing metadata</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Quotation Number</label>
              <input className="form-input" value={invoice.quotationNumber} onChange={(e) => setInvoice((current) => ({ ...current, quotationNumber: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Dated</label>
              <input type="date" className="form-input" value={invoice.invoiceDate} onChange={(e) => setInvoice((current) => ({ ...current, invoiceDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Other Reference(s)</label>
              <input className="form-input" value={invoice.otherReference} onChange={(e) => setInvoice((current) => ({ ...current, otherReference: e.target.value }))} placeholder="Optional reference" />
            </div>
            <div className="form-group">
              <label className="form-label">Price Note</label>
              <input className="form-input" value={invoice.priceNote} onChange={(e) => setInvoice((current) => ({ ...current, priceNote: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Terms of Delivery</label>
              <input className="form-input" value={invoice.termsOfDelivery} onChange={(e) => setInvoice((current) => ({ ...current, termsOfDelivery: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Time</label>
              <input className="form-input" value={invoice.deliveryTime} onChange={(e) => setInvoice((current) => ({ ...current, deliveryTime: e.target.value }))} />
            </div>
          </div>

          <div className="editor-split">
            <div>
              <div className="section-header compact">
                <div>
                  <h3>Bill To</h3>
                  <span className="section-hint">Customer / company receiving the PI</span>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={copyBillToShip}>Copy to Ship To</button>
              </div>
              <div className="form-grid two-col">
                {[
                  ['name', 'Name'], ['flatNo', 'Flat / Building No.'], ['street', 'Road / Street'], ['locality', 'Locality / Sub Locality'],
                  ['city', 'City / Town / Village'], ['district', 'District'], ['state', 'State'], ['pinCode', 'PIN Code'],
                  ['gstin', 'GSTIN'], ['dl', 'DL'], ['phone', 'Mobile'], ['email', 'Email']
                ].map(([field, label]) => (
                  <div className="form-group" key={`bill-${field}`}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-input"
                      value={invoice.billTo[field]}
                      onChange={(e) => updateBillTo(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-header compact">
                <div>
                  <h3>Ship To</h3>
                  <span className="section-hint">Optional if the billing and shipping addresses match</span>
                </div>
              </div>
              <div className="form-grid two-col">
                {[
                  ['name', 'Name'], ['flatNo', 'Flat / Building No.'], ['street', 'Road / Street'], ['locality', 'Locality / Sub Locality'],
                  ['city', 'City / Town / Village'], ['district', 'District'], ['state', 'State'], ['pinCode', 'PIN Code'],
                  ['gstin', 'GSTIN']
                ].map(([field, label]) => (
                  <div className="form-group" key={`ship-${field}`}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-input"
                      value={invoice.shipTo[field]}
                      onChange={(e) => updateShipTo(field, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-header compact">
            <div>
              <h3>Items</h3>
              <span className="section-hint">Add the products or services that appear on the PI</span>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <FiPlus /> Add Item
            </button>
          </div>

          <div className="table-container pi-editor-table-container">
            <table className="data-table pi-editor-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>HSN</th>
                  <th>GST %</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={`${item.productName || 'item'}-${index}`}>
                    <td><input className="form-input pi-inline-input" value={item.productName} onChange={(e) => updateItem(index, 'productName', e.target.value)} /></td>
                    <td><input className="form-input pi-inline-input" value={item.hsn} onChange={(e) => updateItem(index, 'hsn', e.target.value)} /></td>
                    <td><input type="number" className="form-input pi-inline-input" value={item.gstRate} onChange={(e) => updateItem(index, 'gstRate', e.target.value)} /></td>
                    <td><input type="number" className="form-input pi-inline-input" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} /></td>
                    <td><input className="form-input pi-inline-input" value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)} /></td>
                    <td><input type="number" className="form-input pi-inline-input" value={item.unitCost} onChange={(e) => updateItem(index, 'unitCost', e.target.value)} /></td>
                    <td>
                      <button type="button" className="btn-icon pi-remove-btn" onClick={() => removeItem(index)} disabled={invoice.items.length === 1}>
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pi-summary-card">
            <div>
              <span>Total Taxable</span>
              <strong>₹ {totals.taxable.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span>Total GST</span>
              <strong>₹ {totals.gst.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span>Grand Total</span>
              <strong>₹ {totals.total.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div className="card proforma-preview-card">
          <div className="section-header">
            <div>
              <h3>Live Preview</h3>
              <span className="section-hint">PDF-ready document</span>
            </div>
            <span className="section-hint">{settings?.companyName ? 'Synced with ERP settings' : 'Using sample company details'}</span>
          </div>
          <div className="pi-paper-wrap">
            <ProformaInvoiceTemplate ref={previewRef} invoice={invoice} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProformaInvoice;