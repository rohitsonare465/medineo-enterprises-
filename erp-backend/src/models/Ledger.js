const mongoose = require('mongoose');

// Ledger Entry Schema
const ledgerEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  particulars: {
    type: String,
    required: true
  },
  referenceNumber: String,
  referenceType: {
    type: String,
    enum: ['sale', 'purchase', 'payment', 'receipt', 'opening', 'adjustment', 'credit_note', 'debit_note']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  debit: {
    type: Number,
    default: 0,
    min: 0
  },
  credit: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  }
}, { _id: true, timestamps: true });

// Main Ledger Schema
const ledgerSchema = new mongoose.Schema({
  // Ledger Type
  ledgerType: {
    type: String,
    required: true,
    enum: ['customer', 'vendor']
  },
  
  // Reference to Customer or Vendor
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  
  // Party Details (denormalized for quick access)
  partyName: {
    type: String,
    required: true
  },
  partyCode: String,
  
  // Financial Year
  financialYear: {
    type: String,
    required: true
  },
  
  // Opening Balance
  openingBalance: {
    type: Number,
    default: 0
  },
  openingBalanceType: {
    type: String,
    enum: ['debit', 'credit'],
    default: 'debit'
  },
  
  // Running Totals
  totalDebit: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCredit: {
    type: Number,
    default: 0,
    min: 0
  },
  closingBalance: {
    type: Number,
    default: 0
  },
  
  // Ledger Entries
  entries: [ledgerEntrySchema],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique ledger per party per financial year
ledgerSchema.index({ ledgerType: 1, customer: 1, financialYear: 1 }, { unique: true, sparse: true });
ledgerSchema.index({ ledgerType: 1, vendor: 1, financialYear: 1 }, { unique: true, sparse: true });
ledgerSchema.index({ partyName: 'text' });
ledgerSchema.index({ financialYear: 1 });

// Static method to add entry to ledger
ledgerSchema.statics.addEntry = async function(options) {
  const {
    ledgerType,
    partyId,
    partyName,
    partyCode,
    date,
    particulars,
    referenceNumber,
    referenceType,
    referenceId,
    debit = 0,
    credit = 0
  } = options;
  
  // Determine financial year
  const entryDate = new Date(date);
  const month = entryDate.getMonth();
  const year = entryDate.getFullYear();
  const financialYear = month >= 3 
    ? `${year}-${(year + 1).toString().slice(-2)}`
    : `${year - 1}-${year.toString().slice(-2)}`;
  
  // Find or create ledger
  let query = { ledgerType, financialYear };
  if (ledgerType === 'customer') {
    query.customer = partyId;
  } else {
    query.vendor = partyId;
  }
  
  let ledger = await this.findOne(query);
  
  if (!ledger) {
    ledger = new this({
      ledgerType,
      financialYear,
      partyName,
      partyCode,
      ...(ledgerType === 'customer' ? { customer: partyId } : { vendor: partyId })
    });
  }
  
  // Calculate new balance
  const lastEntry = ledger.entries[ledger.entries.length - 1];
  const previousBalance = lastEntry ? lastEntry.balance : ledger.openingBalance;
  
  // For customer: debit increases outstanding (sales), credit decreases (receipts)
  // For vendor: credit increases outstanding (purchases), debit decreases (payments)
  let newBalance;
  if (ledgerType === 'customer') {
    newBalance = previousBalance + debit - credit;
  } else {
    newBalance = previousBalance + credit - debit;
  }
  
  // Add entry
  ledger.entries.push({
    date,
    particulars,
    referenceNumber,
    referenceType,
    referenceId,
    debit,
    credit,
    balance: newBalance
  });
  
  // Update running totals
  ledger.totalDebit += debit;
  ledger.totalCredit += credit;
  ledger.closingBalance = newBalance;
  
  await ledger.save();
  
  return ledger;
};

// Static method to get ledger statement
ledgerSchema.statics.getStatement = async function(ledgerType, partyId, financialYear, startDate, endDate) {
  let query = { ledgerType, financialYear };
  if (ledgerType === 'customer') {
    query.customer = partyId;
  } else {
    query.vendor = partyId;
  }
  
  const ledger = await this.findOne(query);
  
  if (!ledger) {
    return null;
  }
  
  // Filter entries by date range if provided
  let entries = ledger.entries;
  if (startDate || endDate) {
    entries = ledger.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) return false;
      if (endDate && entryDate > new Date(endDate)) return false;
      return true;
    });
  }
  
  return {
    partyName: ledger.partyName,
    partyCode: ledger.partyCode,
    financialYear: ledger.financialYear,
    openingBalance: ledger.openingBalance,
    totalDebit: ledger.totalDebit,
    totalCredit: ledger.totalCredit,
    closingBalance: ledger.closingBalance,
    entries
  };
};

module.exports = mongoose.model('Ledger', ledgerSchema);
