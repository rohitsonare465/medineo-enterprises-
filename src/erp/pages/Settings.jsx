import React, { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import './Settings.css';

const Settings = () => {
  const { user, hasRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
    setIsSaving(false);
  };

  const updateSetting = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const updated = { ...prev };
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  if (isLoading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage application settings</p>
        </div>
        {hasRole('owner') && (
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <FiSave /> {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>

      <div className="settings-grid">
        <div className="card settings-nav">
          <button 
            className={`nav-btn ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
          >
            Company Info
          </button>
          <button 
            className={`nav-btn ${activeTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoice')}
          >
            Invoice Settings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'gst' ? 'active' : ''}`}
            onClick={() => setActiveTab('gst')}
          >
            GST Settings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Alerts
          </button>
          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
        </div>

        <div className="card settings-content">
          {activeTab === 'company' && settings && (
            <div className="settings-section">
              <h3>Company Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.companyName || ''}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.companyTagline || ''}
                    onChange={(e) => updateSetting('companyTagline', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={settings.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.phone || ''}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.gstNumber || ''}
                    onChange={(e) => updateSetting('gstNumber', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Drug License No.</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.drugLicenseNumber || ''}
                    onChange={(e) => updateSetting('drugLicenseNumber', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Address</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={`${settings.address?.street || ''}\n${settings.address?.city || ''}, ${settings.address?.state || ''} ${settings.address?.pincode || ''}`}
                  readOnly
                />
              </div>
            </div>
          )}

          {activeTab === 'invoice' && settings && (
            <div className="settings-section">
              <h3>Invoice Prefixes</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Sale Invoice Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.invoicePrefix?.sale || ''}
                    onChange={(e) => updateSetting('invoicePrefix.sale', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Invoice Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.invoicePrefix?.purchase || ''}
                    onChange={(e) => updateSetting('invoicePrefix.purchase', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Receipt Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.invoicePrefix?.receipt || ''}
                    onChange={(e) => updateSetting('invoicePrefix.receipt', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.invoicePrefix?.payment || ''}
                    onChange={(e) => updateSetting('invoicePrefix.payment', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gst' && settings && (
            <div className="settings-section">
              <h3>GST Configuration</h3>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.gst?.enabled || false}
                    onChange={(e) => updateSetting('gst.enabled', e.target.checked)}
                  />
                  {' '}Enable GST
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Default GST Rate</label>
                <select
                  className="form-input"
                  value={settings.gst?.defaultRate || 12}
                  onChange={(e) => updateSetting('gst.defaultRate', parseInt(e.target.value))}
                  style={{ width: '150px' }}
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'stock' && settings && (
            <div className="settings-section">
              <h3>Stock Alert Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Low Stock Threshold (Default)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.stock?.lowStockThreshold || 50}
                    onChange={(e) => updateSetting('stock.lowStockThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Alert Days</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.stock?.expiryAlertDays || 90}
                    onChange={(e) => updateSetting('stock.expiryAlertDays', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="settings-section">
              <h3>My Profile</h3>
              <div className="profile-info">
                <div className="profile-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-details">
                  <h4>{user?.name}</h4>
                  <p>{user?.email}</p>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={user?.name || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={user?.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={user?.phone || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-input" value={user?.role || ''} readOnly />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
