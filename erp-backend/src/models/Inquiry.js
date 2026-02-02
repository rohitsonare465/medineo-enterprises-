const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  // Inquiry Source
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'walkin', 'referral', 'other'],
    default: 'website'
  },
  
  // Contact Details
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  
  // Address
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  
  // Inquiry Details
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: 2000
  },
  interestedProducts: [{
    type: String,
    trim: true
  }],
  
  // Status Tracking
  status: {
    type: String,
    enum: ['new', 'contacted', 'followup', 'converted', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Follow-up History
  followUps: [{
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    nextFollowUpDate: Date,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Conversion
  convertedToCustomer: {
    type: Boolean,
    default: false
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  conversionDate: Date,
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes
  internalNotes: {
    type: String,
    maxlength: 1000
  },
  
  // Created by (if from internal)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ phone: 1 });
inquirySchema.index({ email: 1 });
inquirySchema.index({ assignedTo: 1 });
inquirySchema.index({ priority: 1, status: 1 });
inquirySchema.index({ source: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
