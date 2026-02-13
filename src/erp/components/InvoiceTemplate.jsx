import React, { forwardRef } from 'react';
import './InvoiceTemplate.css';
import logo from '../../assets/logo.png';

// Convert number to words (Indian numbering)
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = 'Rupees ' + convert(rupees);
  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise';
  }
  result += ' Only';
  return result;
};

const InvoiceTemplate = forwardRef(({ sale, settings }, ref) => {
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const isInterState = sale?.gstType === 'inter_state';

  // Group items by GST rate for tax summary
  const gstSummary = {};
  sale?.items?.forEach(item => {
    const rate = item.gstRate || 0;
    if (!gstSummary[rate]) {
      gstSummary[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
    }
    gstSummary[rate].taxable += item.taxableAmount || 0;
    gstSummary[rate].cgst += item.cgstAmount || 0;
    gstSummary[rate].sgst += item.sgstAmount || 0;
    gstSummary[rate].igst += item.igstAmount || 0;
    gstSummary[rate].total += (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);
  });

  const companyAddress = settings?.address || {};
  const customerAddress = sale?.customerAddress || sale?.customer?.address || {};

  return (
    <div className="invoice-template" ref={ref}>
      {/* Header */}
      <div className="invoice-header">
        <div className="invoice-header-left">
          <div className="company-logo-section">
            <img src={logo} alt="Medineo Enterprises" className="company-logo" />
          </div>
          <div className="company-info">
            <h1 className="company-name">{settings?.companyName || 'Medineo Enterprises'}</h1>
            {settings?.companyTagline && <p className="company-tagline">{settings.companyTagline}</p>}
            <p className="company-address">
              {companyAddress.street && <>{companyAddress.street}<br /></>}
              {companyAddress.city}{companyAddress.state ? `, ${companyAddress.state}` : ''}{companyAddress.pincode ? ` - ${companyAddress.pincode}` : ''}
            </p>
            {settings?.phone && <p className="company-contact">Phone: {settings.phone}{settings?.alternatePhone ? ` / ${settings.alternatePhone}` : ''}</p>}
            {settings?.email && <p className="company-contact">Email: {settings.email}</p>}
          </div>
        </div>
        <div className="invoice-header-right">
          <h2 className="invoice-title">TAX INVOICE</h2>
          <p className="invoice-type-label">
            {sale?.invoiceType === 'return' ? '(CREDIT NOTE)' : '(ORIGINAL FOR RECIPIENT)'}
          </p>
        </div>
      </div>

      {/* Legal Details Bar */}
      <div className="legal-details-bar">
        {settings?.gstin && <span><strong>GSTIN:</strong> {settings.gstin}</span>}
        {settings?.drugLicenseNo && <span><strong>D.L. No:</strong> {settings.drugLicenseNo}</span>}
        {settings?.drugLicenseNo2 && <span><strong>D.L. No 2:</strong> {settings.drugLicenseNo2}</span>}
        {settings?.fssaiNumber && <span><strong>FSSAI:</strong> {settings.fssaiNumber}</span>}
        {settings?.panNumber && <span><strong>PAN:</strong> {settings.panNumber}</span>}
      </div>

      {/* Invoice & Customer Details */}
      <div className="invoice-details-grid">
        <div className="invoice-details-left">
          <h3 className="details-title">Bill To:</h3>
          <p className="customer-name">{sale?.customerName || sale?.customer?.name || '-'}</p>
          <p className="customer-address">
            {customerAddress.street && <>{customerAddress.street}<br /></>}
            {customerAddress.city}{customerAddress.state ? `, ${customerAddress.state}` : ''}{customerAddress.pincode ? ` - ${customerAddress.pincode}` : ''}
          </p>
          {(sale?.customerGstin || sale?.customer?.gstin) && (
            <p className="customer-legal"><strong>GSTIN:</strong> {sale?.customerGstin || sale?.customer?.gstin}</p>
          )}
          {(sale?.customerDrugLicense || sale?.customer?.drugLicenseNo) && (
            <p className="customer-legal"><strong>D.L. No:</strong> {sale?.customerDrugLicense || sale?.customer?.drugLicenseNo}</p>
          )}
          {sale?.customer?.phone && (
            <p className="customer-legal"><strong>Phone:</strong> {sale.customer.phone}</p>
          )}
        </div>
        <div className="invoice-details-right">
          <table className="invoice-meta-table">
            <tbody>
              <tr>
                <td><strong>Invoice No:</strong></td>
                <td>{sale?.invoiceNumber || '-'}</td>
              </tr>
              <tr>
                <td><strong>Invoice Date:</strong></td>
                <td>{formatDate(sale?.saleDate)}</td>
              </tr>
              <tr>
                <td><strong>Due Date:</strong></td>
                <td>{formatDate(sale?.dueDate) || '-'}</td>
              </tr>
              <tr>
                <td><strong>Payment Mode:</strong></td>
                <td>{sale?.paymentMode || 'Credit'}</td>
              </tr>
              <tr>
                <td><strong>State:</strong></td>
                <td>{settings?.gstSettings?.stateName || 'Maharashtra'} ({settings?.gstSettings?.stateCode || '27'})</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <div className="invoice-items-section">
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th className="col-sr">Sr.</th>
              <th className="col-name">Product Name</th>
              <th className="col-hsn">HSN</th>
              <th className="col-batch">Batch</th>
              <th className="col-expiry">Expiry</th>
              <th className="col-qty">Qty</th>
              <th className="col-free">Free</th>
              <th className="col-mrp">MRP</th>
              <th className="col-rate">Rate</th>
              <th className="col-disc">Disc%</th>
              <th className="col-taxable">Taxable</th>
              {isInterState ? (
                <th className="col-gst">IGST</th>
              ) : (
                <>
                  <th className="col-gst">CGST</th>
                  <th className="col-gst">SGST</th>
                </>
              )}
              <th className="col-total">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale?.items?.map((item, index) => (
              <tr key={item._id || index}>
                <td className="text-center">{index + 1}</td>
                <td className="item-name">{item.medicineName || item.medicine?.name || '-'}</td>
                <td className="text-center">{item.medicine?.hsnCode || '-'}</td>
                <td className="text-center">{item.batchNumber || '-'}</td>
                <td className="text-center">
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' }) : '-'}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{item.freeQuantity || 0}</td>
                <td className="text-right">{formatCurrency(item.mrp)}</td>
                <td className="text-right">{formatCurrency(item.sellingPrice)}</td>
                <td className="text-center">{item.discountPercent || 0}%</td>
                <td className="text-right">{formatCurrency(item.taxableAmount)}</td>
                {isInterState ? (
                  <td className="text-right">
                    <span className="gst-rate">{item.gstRate}%</span><br />
                    {formatCurrency(item.igstAmount)}
                  </td>
                ) : (
                  <>
                    <td className="text-right">
                      <span className="gst-rate">{item.gstRate / 2}%</span><br />
                      {formatCurrency(item.cgstAmount)}
                    </td>
                    <td className="text-right">
                      <span className="gst-rate">{item.gstRate / 2}%</span><br />
                      {formatCurrency(item.sgstAmount)}
                    </td>
                  </>
                )}
                <td className="text-right font-bold">{formatCurrency(item.totalAmount)}</td>
              </tr>
            ))}

            {/* Fill empty rows if less than 5 items to maintain structure */}
            {sale?.items?.length < 5 && Array.from({ length: 5 - (sale?.items?.length || 0) }).map((_, i) => (
              <tr key={`empty-${i}`} className="empty-row">
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                {isInterState ? <td></td> : <><td></td><td></td></>}
                <td></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="items-total-row">
              <td colSpan="5" className="text-right"><strong>Total</strong></td>
              <td className="text-center"><strong>{sale?.totalQuantity || 0}</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="text-right"><strong>{formatCurrency(sale?.taxableAmount)}</strong></td>
              {isInterState ? (
                <td className="text-right"><strong>{formatCurrency(sale?.igstTotal)}</strong></td>
              ) : (
                <>
                  <td className="text-right"><strong>{formatCurrency(sale?.cgstTotal)}</strong></td>
                  <td className="text-right"><strong>{formatCurrency(sale?.sgstTotal)}</strong></td>
                </>
              )}
              <td className="text-right"><strong>{formatCurrency(sale?.grandTotal)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tax Summary & Totals */}
      <div className="invoice-summary-grid">
        {/* Left: Tax Breakup */}
        <div className="tax-summary-section">
          <h4 className="summary-title">GST Summary</h4>
          <table className="tax-summary-table">
            <thead>
              <tr>
                <th>GST Rate</th>
                <th>Taxable Amt</th>
                {isInterState ? (
                  <th>IGST</th>
                ) : (
                  <>
                    <th>CGST</th>
                    <th>SGST</th>
                  </>
                )}
                <th>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(gstSummary).sort((a, b) => Number(a) - Number(b)).map(rate => (
                <tr key={rate}>
                  <td className="text-center">{rate}%</td>
                  <td className="text-right">{formatCurrency(gstSummary[rate].taxable)}</td>
                  {isInterState ? (
                    <td className="text-right">{formatCurrency(gstSummary[rate].igst)}</td>
                  ) : (
                    <>
                      <td className="text-right">{formatCurrency(gstSummary[rate].cgst)}</td>
                      <td className="text-right">{formatCurrency(gstSummary[rate].sgst)}</td>
                    </>
                  )}
                  <td className="text-right">{formatCurrency(gstSummary[rate].total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="amount-words">
            <strong>Amount in Words:</strong><br />
            <em>{numberToWords(sale?.grandTotal || 0)}</em>
          </div>
        </div>

        {/* Right: Grand Totals */}
        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr>
                <td>Subtotal:</td>
                <td className="text-right">{formatCurrency(sale?.subtotal)}</td>
              </tr>
              {sale?.totalDiscount > 0 && (
                <tr>
                  <td>Discount:</td>
                  <td className="text-right">- {formatCurrency(sale?.totalDiscount)}</td>
                </tr>
              )}
              <tr>
                <td>Taxable Amount:</td>
                <td className="text-right">{formatCurrency(sale?.taxableAmount)}</td>
              </tr>
              {isInterState ? (
                <tr>
                  <td>IGST:</td>
                  <td className="text-right">{formatCurrency(sale?.igstTotal)}</td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td>CGST:</td>
                    <td className="text-right">{formatCurrency(sale?.cgstTotal)}</td>
                  </tr>
                  <tr>
                    <td>SGST:</td>
                    <td className="text-right">{formatCurrency(sale?.sgstTotal)}</td>
                  </tr>
                </>
              )}
              {sale?.freightCharges > 0 && (
                <tr>
                  <td>Freight Charges:</td>
                  <td className="text-right">{formatCurrency(sale?.freightCharges)}</td>
                </tr>
              )}
              {sale?.otherCharges > 0 && (
                <tr>
                  <td>Other Charges:</td>
                  <td className="text-right">{formatCurrency(sale?.otherCharges)}</td>
                </tr>
              )}
              {sale?.roundOff !== 0 && (
                <tr>
                  <td>Round Off:</td>
                  <td className="text-right">{formatCurrency(sale?.roundOff)}</td>
                </tr>
              )}
              <tr className="grand-total-row">
                <td><strong>Grand Total:</strong></td>
                <td className="text-right"><strong>₹ {formatCurrency(sale?.grandTotal)}</strong></td>
              </tr>
              <tr className="paid-row">
                <td>Paid Amount:</td>
                <td className="text-right">{formatCurrency(sale?.paidAmount)}</td>
              </tr>
              <tr className="balance-row">
                <td><strong>Balance Due:</strong></td>
                <td className="text-right"><strong>₹ {formatCurrency(sale?.balanceAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Details & Terms */}
      <div className="invoice-footer-grid">
        {/* Bank Details */}
        {settings?.invoiceSettings?.showBankDetails && settings?.bankDetails?.bankName && (
          <div className="bank-details-section">
            <h4 className="footer-title">Bank Details</h4>
            <table className="bank-table">
              <tbody>
                <tr><td>Bank:</td><td>{settings.bankDetails.bankName}</td></tr>
                <tr><td>A/C No:</td><td>{settings.bankDetails.accountNumber}</td></tr>
                <tr><td>IFSC:</td><td>{settings.bankDetails.ifscCode}</td></tr>
                {settings.bankDetails.branchName && <tr><td>Branch:</td><td>{settings.bankDetails.branchName}</td></tr>}
                {settings.bankDetails.accountHolderName && <tr><td>A/C Holder:</td><td>{settings.bankDetails.accountHolderName}</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="terms-section">
          <h4 className="footer-title">Terms & Conditions</h4>
          {settings?.invoiceSettings?.termsAndConditions ? (
            <p className="terms-text">{settings.invoiceSettings.termsAndConditions}</p>
          ) : (
            <ol className="terms-list">
              <li>Goods once sold will not be taken back.</li>
              <li>Payment is due within 30 days from the date of invoice.</li>
              <li>Interest @ 18% p.a. will be charged on overdue payments.</li>
              <li>Subject to local jurisdiction only.</li>
              <li>E. & O.E.</li>
            </ol>
          )}
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-box">
            <p className="signature-label">Receiver's Signature</p>
          </div>
          <div className="signature-box company-signature">
            <p className="signature-company">For {settings?.companyName || 'Medineo Enterprises'}</p>
            <div className="seal-area">
              {/* Official seal placeholder - user can add image */}
            </div>
            <p className="signature-label">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      {settings?.invoiceSettings?.footerNote && (
        <div className="invoice-footer-note">
          <p>{settings.invoiceSettings.footerNote}</p>
        </div>
      )}

      <div className="invoice-footer-note">
        <p>This is a computer-generated invoice.</p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
