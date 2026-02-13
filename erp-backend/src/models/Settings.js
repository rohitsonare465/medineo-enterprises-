const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    default: 'Medineo Enterprises'
  },
  companyTagline: String,
  companyLogo: String,
  
  // Legal Details
  gstin: {
    type: String,
    uppercase: true,
    default: '23HNCPM6815F1Z2'
  },
  panNumber: {
    type: String,
    uppercase: true
  },
  drugLicenseNo: String,
  drugLicenseNo2: String,
  fssaiNumber: String,
  
  // Contact Information
  email: String,
  phone: String,
  alternatePhone: String,
  website: String,
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  
  // Bank Details
  bankDetails: {
    bankName: { type: String, default: 'Punjab National Bank' },
    accountNumber: { type: String, default: '6553002100003380' },
    ifscCode: { type: String, default: 'PUNB0655300' },
    accountHolderName: String,
    branchName: { type: String, default: 'BHOPAL, HOSANGABAD ROAD' }
  },
  
  // Invoice Settings
  invoiceSettings: {
    salePrefix: { type: String, default: 'INV' },
    purchasePrefix: { type: String, default: 'PUR' },
    receiptPrefix: { type: String, default: 'REC' },
    paymentPrefix: { type: String, default: 'PAY' },
    termsAndConditions: String,
    footerNote: String,
    showBankDetails: { type: Boolean, default: true }
  },
  
  // GST Settings
  gstSettings: {
    defaultGstRate: { type: Number, default: 12 },
    stateCode: { type: String, default: '23' },  // Madhya Pradesh
    stateName: { type: String, default: 'Madhya Pradesh' }
  },
  
  // Stock Settings
  stockSettings: {
    lowStockThreshold: { type: Number, default: 50 },
    expiryWarningDays: { type: Number, default: 90 },
    enableBatchTracking: { type: Boolean, default: true },
    enableExpiryTracking: { type: Boolean, default: true }
  },
  
  // Notification Settings
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: true },
    expiryAlert: { type: Boolean, default: true },
    paymentReminder: { type: Boolean, default: true }
  },
  
  // System Settings
  systemSettings: {
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    financialYearStart: { type: Number, default: 4 }  // April
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(updates);
  } else {
    Object.assign(settings, updates);
  }
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
