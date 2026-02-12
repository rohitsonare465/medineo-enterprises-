const mongoose = require('mongoose');
const Counter = require('./Counter');

const expenseSchema = new mongoose.Schema({
  // Expense Reference Number
  expenseNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Expense Details
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Categorization
  category: {
    type: String,
    required: [true, 'Expense category is required'],
    enum: [
      'Rent',
      'Electricity',
      'Salary',
      'Transport',
      'Office Supplies',
      'Maintenance',
      'Marketing',
      'Insurance',
      'Taxes & Fees',
      'Telephone & Internet',
      'Packaging',
      'Courier & Shipping',
      'Food & Refreshments',
      'Travel',
      'Professional Fees',
      'Bank Charges',
      'Miscellaneous'
    ]
  },

  // Amount
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },

  // Date
  expenseDate: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Payment Mode
  paymentMode: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Debit Card']
  },

  // Payment Details
  bankName: {
    type: String,
    trim: true
  },
  transactionReference: {
    type: String,
    trim: true
  },
  chequeNumber: {
    type: String,
    trim: true
  },

  // Paid To
  paidTo: {
    type: String,
    trim: true,
    maxlength: [200, 'Paid to cannot exceed 200 characters']
  },

  // Receipt/Bill reference
  billNumber: {
    type: String,
    trim: true
  },

  // Recurring
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', null],
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'paid'
  },

  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Auto-generate expense number
expenseSchema.pre('validate', async function(next) {
  if (!this.expenseNumber) {
    try {
      const result = await Counter.getNextSequence('expense', 'MED/EXP');
      this.expenseNumber = result;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ paymentMode: 1 });
expenseSchema.index({ createdBy: 1 });
expenseSchema.index({ title: 'text', description: 'text', paidTo: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
