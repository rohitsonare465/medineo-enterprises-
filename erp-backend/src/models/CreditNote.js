const mongoose = require('mongoose');
const Counter = require('./Counter');

// Credit Note Item Schema (embedded in Credit Note)
// We use the exact same schema as sale items to maintain consistency
const creditNoteItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: String,
  medicineCode: String,

  // Batch Info
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  expiryDate: Date,

  // Quantity
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  freeQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  // Pricing
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },

  // Discounts
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },

  // GST
  gstRate: {
    type: Number,
    required: true,
    enum: [0, 5, 12, 18, 28]
  },
  cgstAmount: {
    type: Number,
    default: 0
  },
  sgstAmount: {
    type: Number,
    default: 0
  },
  igstAmount: {
    type: Number,
    default: 0
  },

  // Totals
  taxableAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

// Main Credit Note Schema
const creditNoteSchema = new mongoose.Schema({
  // Credit Note Details
  creditNoteNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Reference to original sale invoice
  originalInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  originalInvoiceNumber: {
    type: String,
    required: true
  },

  // Customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  customerName: String,
  customerGstin: String,
  customerDrugLicense: String,
  customerAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },

  // Credit Note Date
  date: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Items
  items: [creditNoteItemSchema],

  // Financial Summary
  totalItems: {
    type: Number,
    default: 0
  },
  totalQuantity: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  taxableAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // GST Breakup
  cgstTotal: {
    type: Number,
    default: 0
  },
  sgstTotal: {
    type: Number,
    default: 0
  },
  igstTotal: {
    type: Number,
    default: 0
  },
  totalGst: {
    type: Number,
    default: 0
  },

  // Other Charges
  freightCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  otherCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  roundOff: {
    type: Number,
    default: 0
  },

  // Grand Total
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },

  // GST Type
  gstType: {
    type: String,
    enum: ['intra_state', 'inter_state'],
    default: 'intra_state'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },

  // Notes
  notes: {
    type: String,
    maxlength: 1000
  },

  // Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-generate credit note number before validation
creditNoteSchema.pre('validate', async function (next) {
  try {
    if (!this.creditNoteNumber) {
      // Create prefix like CN-YYYY-YY (e.g. CN-2026-27)
      // The Counter logic handles the financial year parsing based on prefix
      // Here we just pass 'CN' and it will produce CN/YYYY-YY/0000X
      // But user wants CN-YYYY-YY/00X. 
      // Let's use 'CN' and modify format after getting sequence.
      const counter = await Counter.getNextSequence('credit_note', 'CN');
      
      // Counter.getNextSequence returns { sequence, financialYear, formatted: 'CN/2026-27/00001' }
      // The user asked for CN-2026-27/001 format
      this.creditNoteNumber = `CN-${counter.financialYear}/${String(counter.sequence).padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate totals before saving
creditNoteSchema.pre('save', function (next) {
  // Calculate totals
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity + item.freeQuantity, 0);

  next();
});

// Indexes
creditNoteSchema.index({ customer: 1, date: -1 });
creditNoteSchema.index({ originalInvoice: 1 });
creditNoteSchema.index({ date: -1 });

module.exports = mongoose.model('CreditNote', creditNoteSchema);
