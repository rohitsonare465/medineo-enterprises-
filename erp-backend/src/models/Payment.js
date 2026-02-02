const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Reference Number
  paymentNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Payment Type
  paymentType: {
    type: String,
    required: true,
    enum: ['customer_receipt', 'vendor_payment']
  },

  // Customer OR Vendor Reference
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: String,

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  vendorName: String,

  // Payment Details
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },

  // Payment Mode
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'RTGS/NEFT', 'UPI', 'Cheque', 'Credit Note']
  },

  // Bank/Cheque Details
  bankName: {
    type: String,
    trim: true
  },
  chequeNumber: {
    type: String,
    trim: true
  },
  chequeDate: {
    type: Date
  },
  transactionReference: {
    type: String,
    trim: true
  },

  // Linked Invoices (for allocation)
  linkedInvoices: [{
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'paymentType'
    },
    invoiceNumber: String,
    invoiceAmount: Number,
    allocatedAmount: Number,
    balanceBefore: Number,
    balanceAfter: Number
  }],

  // Balance Tracking
  previousOutstanding: {
    type: Number,
    default: 0
  },
  newOutstanding: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'cleared', 'bounced', 'cancelled'],
    default: 'cleared'
  },

  // Notes
  notes: {
    type: String,
    maxlength: 500
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

// Auto-generate payment number before validation
paymentSchema.pre('validate', async function (next) {
  if (!this.paymentNumber || this.isNew) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const financialYear = currentMonth >= 4
      ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
      : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;

    const prefix = this.paymentType === 'customer_receipt' ? 'REC' : 'PAY';

    const count = await mongoose.model('Payment').countDocuments({
      paymentType: this.paymentType,
      createdAt: {
        $gte: new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1),
        $lt: new Date(currentMonth >= 4 ? currentYear + 1 : currentYear, 3, 1)
      }
    });

    this.paymentNumber = `${prefix}/${financialYear}/${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ paymentType: 1, paymentDate: -1 });
paymentSchema.index({ customer: 1, paymentDate: -1 });
paymentSchema.index({ vendor: 1, paymentDate: -1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMode: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
