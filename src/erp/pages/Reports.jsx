import React, { useState } from 'react';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import { writeFile, utils as xlsxUtils } from 'xlsx';
import api from '../../services/api';
import './Reports.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const reports = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'purchases', label: 'Purchase Report' },
    { id: 'gst', label: 'GST Report' },
    { id: 'payments', label: 'Payment Report' },
    { id: 'profit', label: 'Profit Report' }
  ];

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(dateRange);
      const response = await api.get(`/reports/${activeReport}?${params.toString()}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
    setIsLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const exportToExcel = () => {
    if (!reportData) return;

    let wsTemplate = [];
    const reportNameMap = {
      sales: 'Sales_Report',
      purchases: 'Purchase_Report',
      gst: 'GST_Report',
      payments: 'Payment_Report',
      profit: 'Profit_Report'
    };

    const fileName = `${reportNameMap[activeReport]}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;

    switch (activeReport) {
      case 'sales':
        wsTemplate.push(['Sales Summary']);
        wsTemplate.push(['Total Sales', 'Total Amount', 'Total GST', 'Pending Amount']);
        wsTemplate.push([
          reportData.summary?.totalSales || 0,
          reportData.summary?.totalAmount || 0,
          reportData.summary?.totalGst || 0,
          reportData.summary?.totalPending || 0
        ]);

        if (reportData.customerWise?.length > 0) {
          wsTemplate.push([]);
          wsTemplate.push(['Customer-wise Summary']);
          wsTemplate.push(['Customer', 'Invoices', 'Amount', 'Received', 'Pending']);
          reportData.customerWise.forEach(item => {
            wsTemplate.push([
              item.customerName,
              item.count,
              item.amount,
              item.received,
              item.pending
            ]);
          });
        }
        break;

      case 'purchases':
        wsTemplate.push(['Purchase Summary']);
        wsTemplate.push(['Total Purchases', 'Total Amount', 'Total GST', 'Pending Amount']);
        wsTemplate.push([
          reportData.summary?.totalPurchases || 0,
          reportData.summary?.totalAmount || 0,
          reportData.summary?.totalGst || 0,
          reportData.summary?.totalPending || 0
        ]);

        if (reportData.vendorWise?.length > 0) {
          wsTemplate.push([]);
          wsTemplate.push(['Vendor-wise Summary']);
          wsTemplate.push(['Vendor', 'Purchases', 'Amount', 'Paid', 'Pending']);
          reportData.vendorWise.forEach(item => {
            wsTemplate.push([
              item.vendorName,
              item.count,
              item.amount,
              item.paid,
              item.pending
            ]);
          });
        }
        break;

      case 'gst':
        wsTemplate.push(['GST Summary']);
        wsTemplate.push([]);

        wsTemplate.push(['Output GST (Sales)']);
        wsTemplate.push(['CGST', 'SGST', 'IGST', 'Total']);
        wsTemplate.push([
          reportData.salesGst?.cgst || 0,
          reportData.salesGst?.sgst || 0,
          reportData.salesGst?.igst || 0,
          reportData.salesGst?.total || 0
        ]);

        wsTemplate.push([]);
        wsTemplate.push(['Input GST (Purchases)']);
        wsTemplate.push(['CGST', 'SGST', 'IGST', 'Total']);
        wsTemplate.push([
          reportData.purchaseGst?.cgst || 0,
          reportData.purchaseGst?.sgst || 0,
          reportData.purchaseGst?.igst || 0,
          reportData.purchaseGst?.total || 0
        ]);

        wsTemplate.push([]);
        wsTemplate.push(['Net GST Payable']);
        wsTemplate.push(['CGST', 'SGST', 'IGST', 'Total']);
        wsTemplate.push([
          reportData.netPayable?.cgst || 0,
          reportData.netPayable?.sgst || 0,
          reportData.netPayable?.igst || 0,
          reportData.netPayable?.total || 0
        ]);
        break;

      case 'profit':
        wsTemplate.push(['Profit & Loss Summary']);
        wsTemplate.push(['Metric', 'Amount (₹)']);
        wsTemplate.push(['Revenue', reportData.revenue || 0]);
        wsTemplate.push(['Cost of Goods', reportData.costOfGoods || 0]);
        wsTemplate.push(['Gross Profit', reportData.grossProfit || 0]);
        wsTemplate.push(['Gross Margin (%)', reportData.grossProfitMargin || 0]);
        break;

      case 'payments':
        wsTemplate.push(['Payments Summary']);
        wsTemplate.push(['Type', 'Total Amount', 'Transactions']);
        reportData.summary?.forEach(item => {
          wsTemplate.push([
            item._id === 'customer_receipt' ? 'Customer Receipts' : 'Vendor Payments',
            item.total,
            item.count
          ]);
        });
        break;

      default:
        break;
    }

    const wb = xlsxUtils.book_new();
    const ws = xlsxUtils.aoa_to_sheet(wsTemplate);
    xlsxUtils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, fileName);
  };

  const renderSalesReport = () => (
    <>
      <div className="report-summary">
        <div className="summary-item">
          <span>Total Sales</span>
          <strong>{reportData.summary?.totalSales || 0}</strong>
        </div>
        <div className="summary-item">
          <span>Total Amount</span>
          <strong>{formatCurrency(reportData.summary?.totalAmount)}</strong>
        </div>
        <div className="summary-item">
          <span>Total GST</span>
          <strong>{formatCurrency(reportData.summary?.totalGst)}</strong>
        </div>
        <div className="summary-item">
          <span>Pending Amount</span>
          <strong className="text-danger">{formatCurrency(reportData.summary?.totalPending)}</strong>
        </div>
      </div>
      {reportData.customerWise?.length > 0 && (
        <div className="report-table">
          <h4>Customer-wise Summary</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Invoices</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {reportData.customerWise.map((item, i) => (
                <tr key={i}>
                  <td>{item.customerName}</td>
                  <td>{item.count}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td className="text-success">{formatCurrency(item.received)}</td>
                  <td className="text-danger">{formatCurrency(item.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderGstReport = () => (
    <>
      <div className="gst-summary">
        <div className="gst-section">
          <h4>Output GST (Sales)</h4>
          <div className="gst-grid">
            <div className="gst-item">
              <span>CGST</span>
              <strong>{formatCurrency(reportData.salesGst?.cgst)}</strong>
            </div>
            <div className="gst-item">
              <span>SGST</span>
              <strong>{formatCurrency(reportData.salesGst?.sgst)}</strong>
            </div>
            <div className="gst-item">
              <span>IGST</span>
              <strong>{formatCurrency(reportData.salesGst?.igst)}</strong>
            </div>
            <div className="gst-item highlight">
              <span>Total</span>
              <strong>{formatCurrency(reportData.salesGst?.total)}</strong>
            </div>
          </div>
        </div>
        <div className="gst-section">
          <h4>Input GST (Purchases)</h4>
          <div className="gst-grid">
            <div className="gst-item">
              <span>CGST</span>
              <strong>{formatCurrency(reportData.purchaseGst?.cgst)}</strong>
            </div>
            <div className="gst-item">
              <span>SGST</span>
              <strong>{formatCurrency(reportData.purchaseGst?.sgst)}</strong>
            </div>
            <div className="gst-item">
              <span>IGST</span>
              <strong>{formatCurrency(reportData.purchaseGst?.igst)}</strong>
            </div>
            <div className="gst-item highlight">
              <span>Total</span>
              <strong>{formatCurrency(reportData.purchaseGst?.total)}</strong>
            </div>
          </div>
        </div>
        <div className="gst-section net-payable">
          <h4>Net GST Payable</h4>
          <div className="gst-grid">
            <div className="gst-item">
              <span>CGST</span>
              <strong>{formatCurrency(reportData.netPayable?.cgst)}</strong>
            </div>
            <div className="gst-item">
              <span>SGST</span>
              <strong>{formatCurrency(reportData.netPayable?.sgst)}</strong>
            </div>
            <div className="gst-item">
              <span>IGST</span>
              <strong>{formatCurrency(reportData.netPayable?.igst)}</strong>
            </div>
            <div className="gst-item total">
              <span>Total Payable</span>
              <strong>{formatCurrency(reportData.netPayable?.total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderProfitReport = () => (
    <div className="profit-summary">
      <div className="profit-item">
        <span>Revenue</span>
        <strong>{formatCurrency(reportData.revenue)}</strong>
      </div>
      <div className="profit-item">
        <span>Cost of Goods</span>
        <strong className="text-danger">- {formatCurrency(reportData.costOfGoods)}</strong>
      </div>
      <div className="profit-item highlight">
        <span>Gross Profit</span>
        <strong>{formatCurrency(reportData.grossProfit)}</strong>
      </div>
      <div className="profit-item">
        <span>Gross Margin</span>
        <strong>{reportData.grossProfitMargin?.toFixed(2)}%</strong>
      </div>
    </div>
  );

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download business reports</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="card report-selector">
          <h3>Select Report</h3>
          <div className="report-list">
            {reports.map(report => (
              <button
                key={report.id}
                className={`report-btn ${activeReport === report.id ? 'active' : ''}`}
                onClick={() => { setActiveReport(report.id); setReportData(null); }}
              >
                {report.label}
              </button>
            ))}
          </div>

          <div className="date-filters">
            <h4><FiCalendar /> Date Range</h4>
            <div className="form-group">
              <label className="form-label">From</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="date"
                className="form-input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={generateReport} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        <div className="card report-content">
          <div className="report-header">
            <h3>{reports.find(r => r.id === activeReport)?.label}</h3>
            {reportData && (
              <button className="btn btn-secondary" onClick={exportToExcel}>
                <FiDownload /> Export
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="report-loading">Generating report...</div>
          ) : reportData ? (
            <div className="report-body">
              {activeReport === 'sales' && renderSalesReport()}
              {activeReport === 'gst' && renderGstReport()}
              {activeReport === 'profit' && renderProfitReport()}
              {activeReport === 'purchases' && (
                <div className="report-summary">
                  <div className="summary-item">
                    <span>Total Purchases</span>
                    <strong>{reportData.summary?.totalPurchases || 0}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total Amount</span>
                    <strong>{formatCurrency(reportData.summary?.totalAmount)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total GST</span>
                    <strong>{formatCurrency(reportData.summary?.totalGst)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Pending Amount</span>
                    <strong className="text-danger">{formatCurrency(reportData.summary?.totalPending)}</strong>
                  </div>
                </div>
              )}
              {activeReport === 'payments' && (
                <div className="report-summary">
                  {reportData.summary?.map((item, i) => (
                    <div key={i} className="summary-item">
                      <span>{item._id === 'customer_receipt' ? 'Customer Receipts' : 'Vendor Payments'}</span>
                      <strong>{formatCurrency(item.total)}</strong>
                      <small>{item.count} transactions</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="report-placeholder">
              Select a report and date range, then click "Generate Report"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
