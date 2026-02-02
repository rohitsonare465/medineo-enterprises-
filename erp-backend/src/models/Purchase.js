const mongoose = require('mongoose');

// Purchase Item Schema (embedded in Purchase)
const purchaseItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: String,
  medicineCode: String,
  
  // Batch Info
  batchNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  manufacturingDate: Date,
  
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
  purchasePrice: {
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
  },
  
  // Reference to created batch
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }
}, { _id: true });

// Main Purchase Schema
const purchaseSchema = new mongoose.Schema({
  // Invoice Details
  invoiceNumber: {
    type: String,
    unique: true,
    uppercase: true
  },
  vendorInvoiceNumber: {
    type: String,
    required: [true, 'Vendor invoice number is required'],
    trim: true
  },
  vendorInvoiceDate: {
    type: Date,
    required: [true, 'Vendor invoice date is required']
  },
  
  // Vendor
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  vendorName: String,
  vendorGstin: String,
  
  // Purchase Date
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Items
  items: [purchaseItemSchema],
  
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
  
  // Payment Status
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
  dueDate: {
    type: Date
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
    enum: ['draft', 'confirmed', 'cancelled'],
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

// Auto-generate invoice number
purchaseSchema.pre('save', async function(next) {
  if (!this.invoiceNumber || this.isNew) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const financialYear = currentMonth >= 4 
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    
    const count = await mongoose.model('Purchase').countDocuments({
      createdAt: {
        $gte: new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1),
        $lt: new Date(currentMonth >= 4 ? currentYear + 1 : currentYear, 3, 1)
      }
    });
    
    this.invoiceNumber = `PUR/${financialYear}/${String(count + 1).padStart(5, '0')}`;
  }
  
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
purchaseSchema.index({ invoiceNumber: 1 });
purchaseSchema.index({ vendor: 1, purchaseDate: -1 });
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ vendorInvoiceNumber: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
