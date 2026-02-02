const mongoose = require('mongoose');

// Sale Item Schema (embedded in Sale)
const saleItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: String,
  medicineCode: String,

  // Batch Info (for tracking which batch was sold)
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

// Main Sale Schema
const saleSchema = new mongoose.Schema({
  // Invoice Details
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
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

  // Sale Date
  saleDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Items
  items: [saleItemSchema],

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

  // Payment
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'RTGS/NEFT', 'UPI', 'Cheque', 'Credit'],
    default: 'Credit'
  },
  dueDate: {
    type: Date
  },

  // GST Type
  gstType: {
    type: String,
    enum: ['intra_state', 'inter_state'],
    default: 'intra_state'
  },

  // Invoice Type
  invoiceType: {
    type: String,
    enum: ['regular', 'return', 'credit_note'],
    default: 'regular'
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'confirmed'
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
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate invoice number before validation
saleSchema.pre('validate', async function (next) {
  if (!this.invoiceNumber || this.isNew) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const financialYear = currentMonth >= 4
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    const count = await mongoose.model('Sale').countDocuments({
      createdAt: {
        $gte: new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1),
        $lt: new Date(currentMonth >= 4 ? currentYear + 1 : currentYear, 3, 1)
      }
    });

    this.invoiceNumber = `INV/${financialYear}/${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Calculate totals before saving
saleSchema.pre('save', function (next) {
  // Calculate totals
  this.totalItems = this.items.length;
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity + item.freeQuantity, 0);
  this.balanceAmount = this.grandTotal - this.paidAmount;

  // Update payment status
  if (this.paidAmount >= this.grandTotal) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'unpaid';
  }

  next();
});

// Indexes
saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ customer: 1, saleDate: -1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ status: 1 });
saleSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Sale', saleSchema);
