import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import './Ledger.css';

const Ledger = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [partySearch, setPartySearch] = useState('');
  const [partyResults, setPartyResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (partySearch.length >= 2) {
        try {
          const endpoint = activeTab === 'customers' ? '/customers' : '/vendors';
          const response = await api.get(`${endpoint}?search=${partySearch}&limit=10`);
          setPartyResults(response.data.data);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
        }
      } else {
        setPartyResults([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [partySearch, activeTab]);

  const selectParty = (party) => {
    setSelectedParty(party);
    setPartySearch(party.name);
    setShowDropdown(false);
    fetchLedger(party._id);
  };

  const fetchLedger = async (id) => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'customers'
        ? `/ledger/customer/${id}`
        : `/ledger/vendor/${id}`;

      const params = new URLSearchParams(dateRange);
      const response = await api.get(`${endpoint}?${params.toString()}`);

      setLedgerData(response.data.data.entries || []);
      setSummary(response.data.data.summary || null);
    } catch (error) {
      console.error('Failed to fetch ledger:', error);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="ledger-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ledger</h1>
          <p className="page-subtitle">View party-wise account statements</p>
        </div>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('customers'); setSelectedParty(null); setLedgerData([]); }}
        >
          Customer Ledger
        </button>
        <button
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => { setActiveTab('vendors'); setSelectedParty(null); setLedgerData([]); }}
        >
          Vendor Ledger
        </button>
      </div>

      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-dropdown" style={{ flex: 1 }}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="form-input with-icon"
              placeholder={`Search ${activeTab === 'customers' ? 'customer' : 'vendor'}...`}
              value={partySearch}
              onChange={(e) => setPartySearch(e.target.value)}
            />
            {showDropdown && partyResults.length > 0 && (
              <div className="dropdown-menu">
                {partyResults.map(party => (
                  <div
                    key={party._id}
                    className="dropdown-item"
                    onClick={() => selectParty(party)}
                  >
                    <strong>{party.name}</strong>
                    <span className="item-meta">{party.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <input
            type="date"
            className="form-input"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <input
            type="date"
            className="form-input"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
          <button
            className="btn btn-secondary"
            onClick={() => selectedParty && fetchLedger(selectedParty._id)}
            disabled={!selectedParty}
          >
            Refresh
          </button>
        </div>
      </div>

      {selectedParty && (
        <div className="party-summary">
          <div className="party-info">
            <h3>{selectedParty.name}</h3>
            <p>{selectedParty.code} • {selectedParty.phone}</p>
          </div>
          {summary && (
            <div className="summary-boxes">
              <div className="summary-box">
                <span>Opening Balance</span>
                <strong>{formatCurrency(summary.openingBalance)}</strong>
              </div>
              <div className="summary-box">
                <span>Total {activeTab === 'customers' ? 'Sales' : 'Purchases'}</span>
                <strong>{formatCurrency(summary.totalDebit)}</strong>
              </div>
              <div className="summary-box">
                <span>Total {activeTab === 'customers' ? 'Receipts' : 'Payments'}</span>
                <strong>{formatCurrency(summary.totalCredit)}</strong>
              </div>
              <div className="summary-box highlight">
                <span>Closing Balance</span>
                <strong>{formatCurrency(summary.closingBalance)}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Particulars</th>
                <th>Ref. No.</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center">Loading...</td>
                </tr>
              ) : ledgerData.length > 0 ? (
                ledgerData.map((entry, index) => (
                  <tr key={index}>
                    <td>{formatDate(entry.date)}</td>
                    <td>{entry.description}</td>
                    <td>{entry.referenceNumber || '-'}</td>
                    <td className="text-danger">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</td>
                    <td className="text-success">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</td>
                    <td><strong>{formatCurrency(entry.balance)}</strong></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    {selectedParty ? 'No transactions found' : 'Select a party to view ledger'}
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

export default Ledger;
