import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiRefreshCw, FiSearch, FiArrowRight, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useSaleStore from '../../store/saleStore';
import './CreditNotes.css';

const CreditNotes = () => {
  const navigate = useNavigate();
  const { sales, fetchSales, isLoading: salesLoading } = useSaleStore();
  const [creditNotes, setCreditNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [search, setSearch] = useState('');
  const [generatingId, setGeneratingId] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSales({ page: 1, limit: 10, search });
    }, 250);

    return () => clearTimeout(timeout);
  }, [fetchSales, search]);

  useEffect(() => {
    const fetchCreditNotes = async () => {
      setLoadingNotes(true);
      try {
        const response = await api.get('/credit-notes?limit=20');
        setCreditNotes(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch credit notes:', error);
        toast.error('Failed to load credit notes');
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchCreditNotes();
  }, []);

  const handleRefresh = async () => {
    await Promise.all([
      fetchSales({ page: 1, limit: 10, search }),
      (async () => {
        setLoadingNotes(true);
        try {
          const response = await api.get('/credit-notes?limit=20');
          setCreditNotes(response.data.data || []);
        } catch (error) {
          console.error('Failed to fetch credit notes:', error);
          toast.error('Failed to load credit notes');
        } finally {
          setLoadingNotes(false);
        }
      })()
    ]);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const stats = useMemo(() => {
    const total = creditNotes.reduce((sum, item) => sum + (Number(item.grandTotal) || 0), 0);
    return {
      notes: creditNotes.length,
      total
    };
  }, [creditNotes]);

  const handleGenerate = async (sale) => {
    if (!sale?._id) return;

    try {
      setGeneratingId(sale._id);
      const response = await api.post('/credit-notes', { originalInvoiceId: sale._id });
      if (response.data.success) {
        toast.success('Credit note generated successfully');
        navigate(`/erp/credit-notes/${response.data.data._id}/preview`);
      }
    } catch (error) {
      console.error('Failed to generate credit note:', error);
      toast.error(error.response?.data?.message || 'Failed to generate credit note');
    } finally {
      setGeneratingId('');
    }
  };

  return (
    <div className="credit-notes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Credit Notes</h1>
          <p className="page-subtitle">Create a credit note from any sale bill and review existing credit notes</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/erp/sales')}>
            <FiArrowRight /> Go to Sales
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/erp')}>
            Dashboard
          </button>
        </div>
      </div>

      <div className="cn-stats-grid">
        <div className="card cn-stat-card">
          <span className="cn-stat-label">Generated notes</span>
          <strong className="cn-stat-value">{stats.notes}</strong>
        </div>
        <div className="card cn-stat-card">
          <span className="cn-stat-label">Total credited value</span>
          <strong className="cn-stat-value">{formatCurrency(stats.total)}</strong>
        </div>
      </div>

      <div className="credit-note-grid">
        <section className="card">
          <div className="section-header compact">
            <div>
              <h3>Generate from Sales Bill</h3>
              <span className="section-hint">Search an invoice and create the credit note from here</span>
            </div>
            <FiFileText />
          </div>

          <div className="search-box cn-search-box">
            <FiSearch className="search-icon" />
            <input
              className="form-input"
              placeholder="Search by invoice number or customer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-container cn-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {salesLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading sales...</td>
                  </tr>
                ) : sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale._id}>
                      <td><strong>{sale.invoiceNumber}</strong></td>
                      <td>{formatDate(sale.saleDate)}</td>
                      <td>{sale.customerName}</td>
                      <td>{formatCurrency(sale.grandTotal)}</td>
                      <td>{formatCurrency(sale.balanceAmount)}</td>
                      <td className="cn-actions-cell">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleGenerate(sale)}
                          disabled={generatingId === sale._id}
                        >
                          {generatingId === sale._id ? 'Generating...' : 'Create Credit Note'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center empty-state">No sales found for credit note generation</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="section-header compact">
            <div>
              <h3>Existing Credit Notes</h3>
              <span className="section-hint">Open a preview or inspect the linked invoice</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
              <FiRefreshCw /> Refresh
            </button>
          </div>

          <div className="table-container cn-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Credit Note #</th>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loadingNotes ? (
                  <tr>
                    <td colSpan="6" className="text-center">Loading credit notes...</td>
                  </tr>
                ) : creditNotes.length > 0 ? (
                  creditNotes.map((note) => (
                    <tr key={note._id}>
                      <td><strong>{note.creditNoteNumber}</strong></td>
                      <td>{formatDate(note.date)}</td>
                      <td>{note.originalInvoiceNumber}</td>
                      <td>{note.customerName}</td>
                      <td>{formatCurrency(note.grandTotal)}</td>
                      <td className="cn-actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/erp/credit-notes/${note._id}/preview`)}>
                          <FiEye /> Preview
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center empty-state">No credit notes created yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CreditNotes;