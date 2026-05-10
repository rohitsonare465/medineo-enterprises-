import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import InvoiceTemplate from '../components/InvoiceTemplate';
import api from '../../services/api';
import './InvoicePreview.css';

const CreditNotePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  
  const [creditNote, setCreditNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const res = await api.get(`/credit-notes/${id}`);
          setCreditNote(res.data.data);
          
          const settingsRes = await api.get('/settings');
          setSettings(settingsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch credit note or settings:', error);
        toast.error('Failed to load Credit Note details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getFileName = () => {
    const customerCode = creditNote?.customer?.code || creditNote?.customerName?.replace(/\s+/g, '-') || 'Customer';
    const invoiceNum = creditNote?.creditNoteNumber?.replace(/\//g, '-') || 'CreditNote';
    return `${invoiceNum}-${customerCode}-${Date.now()}.pdf`;
  };

  const generatePDF = async (action = 'download') => {
    if (!invoiceRef.current) return;
    setDownloading(true);

    const el = invoiceRef.current;
    // Force a fixed pixel width for consistent PDF rendering
    const originalWidth = el.style.width;
    const originalFontSmoothing = el.style.webkitFontSmoothing;
    el.style.width = '210mm';
    el.style.webkitFontSmoothing = 'antialiased';

    // Add pdf mode class temporarily to apply specific pdf CSS rules
    el.classList.add('pdf-mode');

    const opt = {
      margin: 0,
      filename: getFileName(),
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#FEFEFEfff'
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
        toast.success('Credit Note downloaded successfully!');
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
            title: `Credit Note ${creditNote?.creditNoteNumber}`,
            text: `Credit Note from ${settings?.companyName || 'Medineo Enterprises'}`,
            files: [file]
          });
          toast.success('Credit Note shared!');
        } else {
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = getFileName();
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Credit Note downloaded (sharing not supported on this device)');
        }
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      el.classList.remove('pdf-mode');
      el.style.width = originalWidth;
      el.style.webkitFontSmoothing = originalFontSmoothing;
      setDownloading(false);
    }
  };

  if (isLoading || !creditNote) {
    return (
      <div className="invoice-preview-page">
        <div className="invoice-loading">
          <div className="loader"></div>
          <p>Loading credit note...</p>
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
            <h2>Credit Note {creditNote?.creditNoteNumber}</h2>
            <span className="toolbar-customer">{creditNote?.customerName}</span>
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
          <InvoiceTemplate ref={invoiceRef} sale={creditNote} settings={settings} isCreditNote={true} />
        </div>
      </div>
    </div>
  );
};

export default CreditNotePreview;
