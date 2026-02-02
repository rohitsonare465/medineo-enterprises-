const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  // Reference to Medicine
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: [true, 'Medicine reference is required']
  },
  
  // Batch Details
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    uppercase: true
  },
  
  // Dates
  manufacturingDate: {
    type: Date
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  
  // Pricing for this batch
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  
  // Stock
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  initialQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Reference to Purchase
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  
  // Location (if multiple warehouses)
  location: {
    type: String,
    default: 'Main Store',
    trim: true
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound unique index for medicine + batch number
batchSchema.index({ medicine: 1, batchNumber: 1 }, { unique: true });

// Index for FIFO queries (oldest batches first)
batchSchema.index({ medicine: 1, expiryDate: 1, createdAt: 1 });

// Index for expiry alerts
batchSchema.index({ expiryDate: 1, quantity: 1 });

// Index for stock queries
batchSchema.index({ medicine: 1, quantity: 1 });

// Virtual for days until expiry
batchSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for expiry status
batchSchema.virtual('expiryStatus').get(function() {
  const days = this.daysUntilExpiry;
  if (days === null) return 'unknown';
  if (days <= 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 60) return 'warning';
  if (days <= 90) return 'attention';
  return 'good';
});

// Pre-save hook to check if expired
batchSchema.pre('save', function(next) {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.isExpired = true;
  }
  next();
});

// Static method to get batches for selling (FIFO)
batchSchema.statics.getBatchesForSelling = async function(medicineId, requiredQty) {
  const batches = await this.find({
    medicine: medicineId,
    quantity: { $gt: 0 },
    isExpired: false,
    expiryDate: { $gt: new Date() }
  })
  .sort({ expiryDate: 1, createdAt: 1 }) // FIFO: oldest expiry first
  .lean();
  
  const selectedBatches = [];
  let remainingQty = requiredQty;
  
  for (const batch of batches) {
    if (remainingQty <= 0) break;
    
    const qtyFromBatch = Math.min(batch.quantity, remainingQty);
    selectedBatches.push({
      batchId: batch._id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      availableQty: batch.quantity,
      allocatedQty: qtyFromBatch,
      sellingPrice: batch.sellingPrice,
      mrp: batch.mrp
    });
    remainingQty -= qtyFromBatch;
  }
  
  return {
    batches: selectedBatches,
    totalAllocated: requiredQty - remainingQty,
    shortfall: remainingQty > 0 ? remainingQty : 0
  };
};

// Static method to get expiring batches
batchSchema.statics.getExpiringBatches = async function(days = 90) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return await this.find({
    expiryDate: { $lte: futureDate, $gt: new Date() },
    quantity: { $gt: 0 },
    isExpired: false
  })
  .populate('medicine', 'name code brand manufacturer')
  .sort({ expiryDate: 1 });
};

// Static method to get expired batches
batchSchema.statics.getExpiredBatches = async function() {
  return await this.find({
    expiryDate: { $lte: new Date() },
    quantity: { $gt: 0 }
  })
  .populate('medicine', 'name code brand manufacturer')
  .sort({ expiryDate: 1 });
};

// Ensure virtual fields are included when converting to JSON
batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Batch', batchSchema);
