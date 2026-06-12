import React, { forwardRef } from 'react';
import logo from '../../assets/logo.png';
import seal from '../../assets/seal.png';
import './ProformaInvoiceTemplate.css';

const DEFAULT_BANK = {
  accountName: 'GREEN GRAPES DIAGNOSTICS',
  accountNumber: '10161436277',
  bankName: 'IDFC BANK',
  branchName: 'DWARKA SECTOR-12',
  ifscCode: 'IDFB0020134',
  swiftCode: 'IDFBINBBMUM'
};

const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (value) => {
    if (value < 20) return ones[value];
    if (value < 100) return tens[Math.floor(value / 10)] + (value % 10 ? ` ${ones[value % 10]}` : '');
    if (value < 1000) return ones[Math.floor(value / 100)] + ` Hundred${value % 100 ? ` ${convert(value % 100)}` : ''}`;
    if (value < 100000) return `${convert(Math.floor(value / 1000))} Thousand${value % 1000 ? ` ${convert(value % 1000)}` : ''}`;
    if (value < 10000000) return `${convert(Math.floor(value / 100000))} Lakh${value % 100000 ? ` ${convert(value % 100000)}` : ''}`;
    return `${convert(Math.floor(value / 10000000))} Crore${value % 10000000 ? ` ${convert(value % 10000000)}` : ''}`;
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = `${convert(rupees)} Rupees`;
  if (paise > 0) result += ` and ${convert(paise)} Paise`;
  return `${result} Only /-`;
};

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(amount || 0);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const ProformaInvoiceTemplate = forwardRef(({ invoice, settings }, ref) => {
  const companyAddr = settings?.address || {};
  const companyAddress = [
    companyAddr.street || '338/1, 3rd Floor, SS Complex, Shahbad Mohammed Pur',
    companyAddr.city || 'New Delhi',
    companyAddr.state || 'Delhi',
    companyAddr.pincode || '110037'
  ].filter(Boolean).join(', ');

  const bank = settings?.bankDetails?.accountNumber ? settings.bankDetails : DEFAULT_BANK;
  const billTo = invoice?.billTo || {};
  const shipTo = invoice?.shipTo || billTo;

  const items = invoice?.items || [];
  const totals = items.reduce((acc, item) => {
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
  }, { taxable: 0, gst: 0, total: 0 });

  return (
    <div className="pi-document" ref={ref}>
      <div className="pi-topbar">
        <span className="pi-topbar-text">Performa invoice</span>
        <span className="pi-topbar-ref">Quotation : {invoice?.quotationNumber || '-'}</span>
      </div>

      <table className="pi-table pi-header-table">
        <tbody>
          <tr>
            <td className="pi-company-cell">
              <div className="pi-brand">
                <img src={logo} alt="Company logo" className="pi-logo" />
                <div>
                  <h1 className="pi-company-name">{settings?.companyName || 'Medineo Enterprises'}</h1>
                  <p className="pi-company-addr">{companyAddress}</p>
                  <p className="pi-company-contact">Mob: {settings?.phone || '+91 9310160185'}</p>
                  <p className="pi-company-contact">Email: {settings?.email || 'n.shambhvi@greengrapesdiagnostics.com'}</p>
                  <p className="pi-company-contact">GSTIN/UIN: {settings?.gstin || '07AAWFG2734P1ZM'}</p>
                </div>
              </div>
            </td>
            <td className="pi-doc-cell">
              <div className="pi-meta-grid">
                <div>
                  <span className="pi-meta-label">Quotation No.</span>
                  <strong>{invoice?.quotationNumber || '-'}</strong>
                </div>
                <div>
                  <span className="pi-meta-label">Dated</span>
                  <strong>{formatDate(invoice?.invoiceDate)}</strong>
                </div>
                <div>
                  <span className="pi-meta-label">Other Reference(s)</span>
                  <strong>{invoice?.otherReference || '-'}</strong>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="pi-table pi-terms-table">
        <tbody>
          <tr>
            <td className="pi-terms-cell">
              <strong>Terms of Delivery</strong>
              <p>{invoice?.termsOfDelivery || '100 % ADVANCE BEFORE DISPATCH'}</p>
              <strong>DELIVERY TIME</strong>
              <p>{invoice?.deliveryTime || '1 or 2 Days ( After Payment )'}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="pi-table pi-address-table">
        <thead>
          <tr>
            <th>Bill To</th>
            <th>Ship To</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pi-address-cell">
              <p><strong>{billTo.name || '-'}</strong></p>
              <p>Building No./Flat No.: {billTo.flatNo || '-'}</p>
              <p>Road/Street: {billTo.street || '-'}</p>
              <p>Locality/Sub Locality: {billTo.locality || '-'}</p>
              <p>City/Town/Village: {billTo.city || '-'}</p>
              <p>District: {billTo.district || '-'}</p>
              <p>State: {billTo.state || '-'}</p>
              <p>PIN Code {billTo.pinCode || '-'}</p>
              {billTo.gstin && <p>GSTIN: {billTo.gstin}</p>}
              {billTo.dl && <p>DL : {billTo.dl}</p>}
              {billTo.phone && <p>Mob: {billTo.phone}</p>}
              {billTo.email && <p>Email: {billTo.email}</p>}
            </td>
            <td className="pi-address-cell">
              <p><strong>{shipTo.name || billTo.name || '-'}</strong></p>
              <p>Building No./Flat No.: {shipTo.flatNo || billTo.flatNo || '-'}</p>
              <p>Road/Street: {shipTo.street || billTo.street || '-'}</p>
              <p>Locality/Sub Locality: {shipTo.locality || billTo.locality || '-'}</p>
              <p>City/Town/Village: {shipTo.city || billTo.city || '-'}</p>
              <p>District: {shipTo.district || billTo.district || '-'}</p>
              <p>State: {shipTo.state || billTo.state || '-'}</p>
              <p>PIN Code {shipTo.pinCode || billTo.pinCode || '-'}</p>
              {shipTo.gstin && <p>GSTIN: {shipTo.gstin}</p>}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="pi-table pi-items-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>HSN</th>
            <th>GST Rate</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Unit Cost</th>
            <th>GST Amount</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, index) => {
            const qty = Number(item.qty) || 0;
            const unitCost = Number(item.unitCost) || 0;
            const gstRate = Number(item.gstRate) || 0;
            const taxableAmount = qty * unitCost;
            const gstAmount = (taxableAmount * gstRate) / 100;
            const total = taxableAmount + gstAmount;

            return (
              <tr key={`${item.productName}-${index}`}>
                <td>{item.productName || '-'}</td>
                <td className="tc">{item.hsn || '-'}</td>
                <td className="tc">{gstRate}%</td>
                <td className="tc">{qty}</td>
                <td className="tc">{item.unit || '-'}</td>
                <td className="tr">{formatCurrency(unitCost)}</td>
                <td className="tr">{formatCurrency(gstAmount)}</td>
                <td className="tr">{formatCurrency(total)}</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="8" className="pi-empty">No items added</td>
            </tr>
          )}
          {items.length < 6 && Array.from({ length: Math.max(1, 6 - items.length) }).map((_, index) => (
            <tr key={`empty-${index}`} className="pi-empty-row">
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="pi-total-label">Total</td>
            <td className="tr pi-total-value">{formatCurrency(totals.taxable)}</td>
            <td className="tr pi-total-value">{formatCurrency(totals.gst)}</td>
            <td className="tr pi-total-value">{formatCurrency(totals.total)}</td>
          </tr>
        </tfoot>
      </table>

      <table className="pi-table pi-summary-table">
        <tbody>
          <tr>
            <td className="pi-words-cell" rowSpan="4">
              <strong>Total in words</strong>
              <p>{numberToWords(totals.total)}</p>
            </td>
            <td className="pi-summary-label">Price</td>
            <td className="pi-summary-value">{invoice?.priceNote || 'Price: Ex-works Delhi Office'}</td>
          </tr>
          <tr>
            <td className="pi-summary-label">Taxable</td>
            <td className="pi-summary-value">₹ {formatCurrency(totals.taxable)}</td>
          </tr>
          <tr>
            <td className="pi-summary-label">GST</td>
            <td className="pi-summary-value">₹ {formatCurrency(totals.gst)}</td>
          </tr>
          <tr>
            <td className="pi-summary-label pi-summary-final">Total</td>
            <td className="pi-summary-value pi-summary-final">₹ {formatCurrency(totals.total)}</td>
          </tr>
        </tbody>
      </table>

      <table className="pi-table pi-bank-table">
        <tbody>
          <tr>
            <td colSpan="2" className="pi-bank-header">Company's Bank Details</td>
          </tr>
          <tr>
            <td className="pi-bank-label">A/c Holder's Name</td>
            <td className="pi-bank-value">{bank.accountName}</td>
          </tr>
          <tr>
            <td className="pi-bank-label">Bank Name</td>
            <td className="pi-bank-value">{bank.bankName}</td>
          </tr>
          <tr>
            <td className="pi-bank-label">A/c No.</td>
            <td className="pi-bank-value">{bank.accountNumber}</td>
          </tr>
          <tr>
            <td className="pi-bank-label">Branch & IFS Code</td>
            <td className="pi-bank-value">{bank.branchName} & {bank.ifscCode}</td>
          </tr>
          <tr>
            <td className="pi-bank-label">SWIFT Code</td>
            <td className="pi-bank-value">{bank.swiftCode}</td>
          </tr>
        </tbody>
      </table>

      <table className="pi-table pi-footer-table">
        <tbody>
          <tr>
            <td className="pi-terms-column">
              <strong>Terms & Conditions</strong>
              <p>{invoice?.termsOfDelivery || '100 % ADVANCE BEFORE DISPATCH'}</p>
              <p>{invoice?.deliveryTime || '1 or 2 Days ( After Payment )'}</p>
            </td>
            <td className="pi-sign-column">
              <p>For {settings?.companyName || 'Medineo Enterprises'}</p>
              <img src={seal} alt="Authorised Signature" className="pi-seal" />
              <span>Authorised Signature</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

ProformaInvoiceTemplate.displayName = 'ProformaInvoiceTemplate';

export default ProformaInvoiceTemplate;