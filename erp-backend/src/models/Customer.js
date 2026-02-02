const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Details
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['medical_store', 'hospital', 'clinic', 'distributor', 'other'],
    default: 'medical_store'
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
  
  // Billing Address (if different)
  billingAddress: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
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
    required: [true, 'Drug license number is required for medical customers'],
    trim: true
  },
  drugLicenseExpiry: {
    type: Date
  },
  
  // Credit & Payment
  creditLimit: {
    type: Number,
    default: 50000,
    min: 0
  },
  paymentTerms: {
    type: Number,
    default: 15,
    min: 0,
    max: 365
  },
  
  // Financial Summary (Updated from sales)
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  totalReceipts: {
    type: Number,
    default: 0,
    min: 0
  },
  outstandingBalance: {
    type: Number,
    default: 0
  },
  
  // Pricing
  priceCategory: {
    type: String,
    enum: ['retail', 'wholesale', 'institutional'],
    default: 'wholesale'
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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

// Auto-generate customer code
customerSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Customer').countDocuments();
    this.code = `CUS${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual for calculating outstanding
customerSchema.virtual('calculatedOutstanding').get(function() {
  return this.totalSales - this.totalReceipts;
});

// Check if over credit limit
customerSchema.methods.isOverCreditLimit = function() {
  return this.outstandingBalance >= this.creditLimit;
};

// Indexes
customerSchema.index({ name: 'text', code: 'text' });
customerSchema.index({ gstin: 1 });
customerSchema.index({ drugLicenseNo: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ type: 1 });
customerSchema.index({ 'address.city': 1, 'address.state': 1 });
customerSchema.index({ outstandingBalance: -1 });

module.exports = mongoose.model('Customer', customerSchema);
