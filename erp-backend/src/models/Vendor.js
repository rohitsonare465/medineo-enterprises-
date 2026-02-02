const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Basic Details
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Contact Information
  contactPerson: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  // Address
  address: {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, default: 'India' }
  },
  
  // GST & Legal
  gstin: {
    type: String,
    uppercase: true,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
  },
  panNumber: {
    type: String,
    uppercase: true,
    trim: true
  },
  drugLicenseNo: {
    type: String,
    trim: true
  },
  
  // Payment Terms
  paymentTerms: {
    type: Number,
    default: 30,
    min: 0,
    max: 365
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Financial Summary (Updated from purchases)
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPayments: {
    type: Number,
    default: 0,
    min: 0
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  
  // Bank Details
  bankDetails: {
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, uppercase: true, trim: true },
    accountHolderName: { type: String, trim: true }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate vendor code
vendorSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Vendor').countDocuments();
    this.code = `VND${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual for calculating outstanding
vendorSchema.virtual('calculatedOutstanding').get(function() {
  return this.totalPurchases - this.totalPayments;
});

// Indexes
vendorSchema.index({ name: 'text', code: 'text' });
vendorSchema.index({ gstin: 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ 'address.city': 1, 'address.state': 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
