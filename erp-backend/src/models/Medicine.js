const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  // Basic Details
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  // Product Information
  genericName: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer name is required'],
    trim: true
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'Tablets',
      'Capsules',
      'Syrups',
      'Injections',
      'Ointments',
      'Drops',
      'Powders',
      'Surgical',
      'Equipment',
      'Consumables',
      'Others'
    ]
  },
  subCategory: {
    type: String,
    trim: true
  },
  
  // Packaging
  packSize: {
    type: String,
    required: true,
    trim: true
  },
  unitOfMeasure: {
    type: String,
    default: 'Strip',
    enum: ['Strip', 'Bottle', 'Box', 'Vial', 'Ampule', 'Tube', 'Sachet', 'Piece', 'Pack']
  },
  unitsPerPack: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Pricing
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: 0
  },
  defaultPurchasePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  defaultSellingPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // GST
  gstRate: {
    type: Number,
    required: true,
    enum: [0, 5, 12, 18, 28],
    default: 12
  },
  hsnCode: {
    type: String,
    trim: true
  },
  
  // Stock Settings
  minStockLevel: {
    type: Number,
    default: 50,
    min: 0
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 100,
    min: 0
  },
  
  // Current Stock (calculated from batches)
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Additional Info
  description: {
    type: String,
    maxlength: 1000
  },
  composition: {
    type: String,
    maxlength: 500
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  isScheduledDrug: {
    type: Boolean,
    default: false
  },
  scheduleType: {
    type: String,
    enum: ['H', 'H1', 'X', 'G', null],
    default: null
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate medicine code
medicineSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Medicine').countDocuments();
    this.code = `MED${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Method to update stock from batches
medicineSchema.methods.updateStockFromBatches = async function() {
  const Batch = mongoose.model('Batch');
  const result = await Batch.aggregate([
    { $match: { medicine: this._id, quantity: { $gt: 0 } } },
    { $group: { _id: null, totalStock: { $sum: '$quantity' } } }
  ]);
  this.currentStock = result[0]?.totalStock || 0;
  await this.save();
};

// Indexes
medicineSchema.index({ name: 'text', genericName: 'text', brand: 'text', manufacturer: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ brand: 1 });
medicineSchema.index({ manufacturer: 1 });
medicineSchema.index({ isActive: 1 });
medicineSchema.index({ currentStock: 1, minStockLevel: 1 });
medicineSchema.index({ gstRate: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
