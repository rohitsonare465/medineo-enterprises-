import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import InvoiceTemplate from '../components/InvoiceTemplate';
import useSaleStore from '../../store/saleStore';
import api from '../../services/api';
import './InvoicePreview.css';

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const { sale, isLoading, fetchSale } = useSaleStore();
  const [settings, setSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSale(id);
      // Fetch company settings
      api.get('/settings').then(res => {
        setSettings(res.data.data);
      }).catch(err => {
        console.error('Failed to fetch settings:', err);
      });
    }
  }, [id, fetchSale]);

  const getFileName = () => {
    const customerCode = sale?.customer?.code || sale?.customerName?.replace(/\s+/g, '-') || 'Customer';
    const invoiceNum = sale?.invoiceNumber?.replace(/\//g, '-') || 'Invoice';
    return `${invoiceNum}-${customerCode}-${Date.now()}.pdf`;
  };

  const generatePDF = async (action = 'download') => {
    if (!invoiceRef.current) return;
    setDownloading(true);

    const opt = {
      margin: [4, 4, 4, 4],
      filename: getFileName(),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      if (action === 'download') {
        await html2pdf().set(opt).from(invoiceRef.current).save();
        toast.success('Invoice downloaded successfully!');
      } else if (action === 'print') {
        const pdfBlob = await html2pdf().set(opt).from(invoiceRef.current).output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(blobUrl, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
      } else if (action === 'share') {
        const pdfBlob = await html2pdf().set(opt).from(invoiceRef.current).output('blob');
        const file = new File([pdfBlob], getFileName(), { type: 'application/pdf' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Invoice ${sale?.invoiceNumber}`,
            text: `Invoice from ${settings?.companyName || 'Medineo Enterprises'}`,
            files: [file]
          });
          toast.success('Invoice shared!');
        } else {
          // Fallback: download if sharing not supported
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = getFileName();
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Invoice downloaded (sharing not supported on this device)');
        }
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading || !sale) {
    return (
      <div className="invoice-preview-page">
        <div className="invoice-loading">
          <div className="loader"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-preview-page">
      {/* Toolbar */}
      <div className="invoice-toolbar">
        <div className="toolbar-left">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <div className="toolbar-info">
            <h2>Invoice {sale?.invoiceNumber}</h2>
            <span className="toolbar-customer">{sale?.customerName}</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button
            className="btn btn-outline"
            onClick={() => generatePDF('print')}
            disabled={downloading}
          >
            <FiPrinter /> Print
          </button>
          <button
            className="btn btn-outline"
            onClick={() => generatePDF('share')}
            disabled={downloading}
          >
            <FiShare2 /> Share
          </button>
          <button
            className="btn btn-primary"
            onClick={() => generatePDF('download')}
            disabled={downloading}
          >
            <FiDownload /> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="invoice-preview-container">
        <div className="invoice-paper">
          <InvoiceTemplate ref={invoiceRef} sale={sale} settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
