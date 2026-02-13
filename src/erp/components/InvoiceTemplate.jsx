import React, { forwardRef } from 'react';
import './InvoiceTemplate.css';
import logo from '../../assets/logo.png';
import seal from '../../assets/seal.png';

// Convert number to words (Indian numbering)
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  result += ' Only /-';
  return result;
};

const BANK_DEFAULTS = {
  accountNumber: '6553002100003380',
  ifscCode: 'PUNB0655300',
  bankName: 'Punjab National Bank',
  branchName: 'BHOPAL, HOSANGABAD ROAD'
};

const InvoiceTemplate = forwardRef(({ sale, settings }, ref) => {
  const fmt = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const cur = (amount) => {
    return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
  };

  const isInterState = sale?.gstType === 'inter_state';
  const companyAddr = settings?.address || {};
  const custAddr = sale?.customerAddress || sale?.customer?.address || {};
  const bank = settings?.bankDetails?.bankName ? settings.bankDetails : BANK_DEFAULTS;
  const stateCode = settings?.gstSettings?.stateCode || '23';
  const stateName = settings?.gstSettings?.stateName || 'Madhya Pradesh';

  const custName = sale?.customerName || sale?.customer?.name || '-';
  const custGstin = sale?.customerGstin || sale?.customer?.gstin || '';
  const custDL = sale?.customerDrugLicense || sale?.customer?.drugLicenseNo || '';
  const custPhone = sale?.customer?.phone || '';
  const descParts = [custName];
  if (custGstin) descParts.push('GSTIN: ' + custGstin);
  if (custDL) descParts.push('D.L.: ' + custDL);
  if (custPhone) descParts.push('Ph: ' + custPhone);
  const description = descParts.join(' , ');

  const fullAddress = [custAddr.street, custAddr.city, custAddr.state, custAddr.pincode].filter(Boolean).join(', ');
  const companyFullAddr = [companyAddr.street || 'Narmadapuram Rd, Danish Nagar', companyAddr.city || 'Bhopal', companyAddr.state || 'Madhya Pradesh', companyAddr.pincode || '462026'].filter(Boolean).join(', ');

  return (
    <div className="inv" ref={ref}>
      {/* Top Thank You Bar */}
      <div className="inv-thankyou">⚠ Thank-you for doing business with us</div>

      {/* Company Header */}
      <div className="inv-company-header">
        <div className="inv-logo-area">
          <img src={logo} alt="Logo" className="inv-logo" />
        </div>
        <div className="inv-company-info">
          <h1 className="inv-company-name">{settings?.companyName || 'Medineo Enterprises'}</h1>
          <p className="inv-company-addr">{companyFullAddr}</p>
          <p className="inv-company-contact">
            📞 {settings?.phone || '7893818387'} ✉ {settings?.email || 'medineoenterprises@gmail.com'}
          </p>
          <p className="inv-company-gstin">
            GSTIN : {settings?.gstin || '23HNCPM6815F1Z2'} <span className="inv-state-code-box">State Code : {stateCode}</span>
          </p>
        </div>
      </div>

      {/* TAX INVOICE Title Bar */}
      <table className="inv-table inv-title-table">
        <tbody>
          <tr>
            <td className="inv-title-cell">
              <strong className="inv-title-text">TAX INVOICE</strong>
            </td>
            <td className="inv-title-right">
              {sale?.invoiceType === 'return' ? 'Credit Note' : 'Original For Recipient'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Invoice Details Row */}
      <table className="inv-table inv-details-table">
        <tbody>
          <tr>
            <td className="inv-label">Invoice Number</td>
            <td className="inv-value">{sale?.invoiceNumber || '-'}</td>
            <td className="inv-label">Description</td>
            <td className="inv-value inv-desc-value">{description}</td>
          </tr>
          <tr>
            <td className="inv-label">Invoice Date</td>
            <td className="inv-value">{fmt(sale?.saleDate)}</td>
            <td className="inv-label"></td>
            <td className="inv-value"></td>
          </tr>
          <tr>
            <td className="inv-label">State</td>
            <td className="inv-value">{stateName}</td>
            <td className="inv-label"></td>
            <td className="inv-value"></td>
          </tr>
          <tr>
            <td className="inv-label">Reverse Charge</td>
            <td className="inv-value">NO</td>
            <td className="inv-label"></td>
            <td className="inv-value"></td>
          </tr>
        </tbody>
      </table>

      {/* Receiver / Consignee Details */}
      <table className="inv-table inv-party-table">
        <thead>
          <tr>
            <th>Details of Receiver | Billed to</th>
            <th>Details of Consignee | Shipped to</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="inv-party-cell">
              <p><strong>Name:</strong> {custName}</p>
              <p><strong>Address:</strong> {fullAddress || '-'}</p>
              {custGstin && <p><strong>GSTIN:</strong> {custGstin} <span className="inv-state-code-box">State Code : {stateCode}</span></p>}
              <p><strong>State:</strong> {custAddr.state || stateName}</p>
            </td>
            <td className="inv-party-cell">
              <p><strong>Name:</strong> {custName}</p>
              <p><strong>Address:</strong> {fullAddress || '-'}</p>
              {custGstin && <p><span className="inv-state-code-box">State Code : {stateCode}</span></p>}
              <p><strong>State:</strong> {custAddr.state || stateName}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table className="inv-table inv-items-table">
        <thead>
          <tr>
            <th className="col-sr">Sr.<br/>No.</th>
            <th className="col-product">Name of Product</th>
            <th className="col-batch">Batch<br/>Number</th>
            <th className="col-exp">Exp<br/>Date</th>
            <th className="col-hsn">HSN/SAC</th>
            <th className="col-qty">QTY</th>
            <th className="col-unit">Unit</th>
            <th className="col-rate">Rate</th>
            <th className="col-taxable">Taxable<br/>Value</th>
            {isInterState ? (
              <>
                <th className="col-gst-rate">IGST<br/>Rate</th>
                <th className="col-gst-amt">IGST<br/>Amount</th>
              </>
            ) : (
              <>
                <th className="col-gst-rate">CGST<br/>Rate</th>
                <th className="col-gst-amt">CGST<br/>Amount</th>
                <th className="col-gst-rate">SGST<br/>Rate</th>
                <th className="col-gst-amt">SGST<br/>Amount</th>
              </>
            )}
            <th className="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale?.items?.map((item, i) => (
            <tr key={item._id || i}>
              <td className="tc">{i + 1}</td>
              <td className="tl">{item.medicineName || item.medicine?.name || '-'}</td>
              <td className="tc">{item.batchNumber || '-'}</td>
              <td className="tc">
                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: 'numeric' }) : '-'}
              </td>
              <td className="tc">{item.medicine?.hsnCode || '30049099'}</td>
              <td className="tc">{item.quantity}</td>
              <td className="tc">PCS</td>
              <td className="tr">{cur(item.sellingPrice)}</td>
              <td className="tr">{cur(item.taxableAmount)}</td>
              {isInterState ? (
                <>
                  <td className="tc">{item.gstRate}%</td>
                  <td className="tr">{cur(item.igstAmount)}</td>
                </>
              ) : (
                <>
                  <td className="tc">{item.gstRate / 2}%</td>
                  <td className="tr">{cur(item.cgstAmount)}</td>
                  <td className="tc">{item.gstRate / 2}%</td>
                  <td className="tr">{cur(item.sgstAmount)}</td>
                </>
              )}
              <td className="tr fw">₹ {cur(item.totalAmount)}</td>
            </tr>
          ))}
          {/* Empty rows */}
          {sale?.items && sale.items.length < 8 && Array.from({ length: Math.max(2, 8 - sale.items.length) }).map((_, i) => (
            <tr key={`e${i}`} className="inv-empty-row">
              <td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
              {isInterState ? <><td></td><td></td></> : <><td></td><td></td><td></td><td></td></>}
              <td></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="inv-total-row">
            <td colSpan="5" className="tr fw">Total</td>
            <td className="tc fw">{sale?.totalQuantity || 0}</td>
            <td></td>
            <td></td>
            <td className="tr fw">₹ {cur(sale?.taxableAmount)}</td>
            {isInterState ? (
              <>
                <td></td>
                <td className="tr fw">₹ {cur(sale?.igstTotal)}</td>
              </>
            ) : (
              <>
                <td></td>
                <td className="tr fw">₹ {cur(sale?.cgstTotal)}</td>
                <td></td>
                <td className="tr fw">₹ {cur(sale?.sgstTotal)}</td>
              </>
            )}
            <td className="tr fw">₹ {cur(sale?.grandTotal)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in Words + Totals Summary */}
      <table className="inv-table inv-summary-table">
        <tbody>
          <tr>
            <td className="inv-words-cell" rowSpan="7">
              <strong>Total Invoice Amount in words</strong><br />
              <em>{numberToWords(sale?.grandTotal)}</em>
            </td>
            <td className="inv-summ-label">Total Amount Before Tax</td>
            <td className="inv-summ-value">₹ {cur(sale?.taxableAmount)}</td>
          </tr>
          {isInterState ? (
            <tr>
              <td className="inv-summ-label">Add : IGST</td>
              <td className="inv-summ-value">₹ {cur(sale?.igstTotal)}</td>
            </tr>
          ) : (
            <>
              <tr>
                <td className="inv-summ-label">Add : CGST</td>
                <td className="inv-summ-value">₹ {cur(sale?.cgstTotal)}</td>
              </tr>
              <tr>
                <td className="inv-summ-label">Add : SGST</td>
                <td className="inv-summ-value">₹ {cur(sale?.sgstTotal)}</td>
              </tr>
            </>
          )}
          <tr className="inv-summ-highlight">
            <td className="inv-summ-label fw">Total Tax Amount</td>
            <td className="inv-summ-value fw">₹ {cur(sale?.totalGst)}</td>
          </tr>
          <tr>
            <td className="inv-summ-label">Round Off Value</td>
            <td className="inv-summ-value">₹ {cur(sale?.roundOff)}</td>
          </tr>
          <tr className="inv-summ-final">
            <td className="inv-summ-label fw">Final Invoice Amount</td>
            <td className="inv-summ-value fw">₹ {cur(sale?.grandTotal)}</td>
          </tr>
          <tr className="inv-summ-balance">
            <td className="inv-summ-label fw">Balance Due</td>
            <td className="inv-summ-value fw">₹ {cur(sale?.balanceAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* Bank Details */}
      <table className="inv-table inv-bank-table">
        <tbody>
          <tr>
            <td colSpan="2" className="inv-bank-header">🏦 Bank and Payment Details</td>
          </tr>
          <tr>
            <td className="inv-bank-label">Account No.</td>
            <td className="inv-bank-value">{bank.accountNumber}</td>
          </tr>
          <tr>
            <td className="inv-bank-label">IFSC Code</td>
            <td className="inv-bank-value">{bank.ifscCode}</td>
          </tr>
          <tr>
            <td className="inv-bank-label">Bank Name</td>
            <td className="inv-bank-value">{bank.bankName}</td>
          </tr>
          <tr>
            <td className="inv-bank-label">Branch Name</td>
            <td className="inv-bank-value">{bank.branchName}</td>
          </tr>
        </tbody>
      </table>

      {/* Terms & Signature */}
      <table className="inv-table inv-footer-table">
        <tbody>
          <tr>
            <td className="inv-terms-cell">
              <strong>Terms And Conditions</strong>
              <ol>
                <li>This is an electronically generated document.</li>
                <li>All disputes are subject to seller city jurisdiction.</li>
                <li>Goods once sold will not be taken back.</li>
                <li>Payment is due within 30 days.</li>
                <li>E. & O.E.</li>
              </ol>
            </td>
            <td className="inv-sign-cell">
              <p className="inv-certified">Certified that the particular given above are true and correct</p>
              <p className="inv-for-company"><strong>For, {settings?.companyName || 'Medineo Enterprises'}</strong></p>
              <div className="inv-seal-area">
                <img src={seal} alt="Official Seal" className="inv-seal-img" />
              </div>
              <p className="inv-auth-sign">Authorised Signatory</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="inv-footer-msg">Thankyou for your business</div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
export default InvoiceTemplate;
