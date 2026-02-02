const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const { PAGINATION } = require('../config/constants');

// @desc    Get all batches
// @route   GET /api/v1/batches
// @access  Private
exports.getBatches = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.medicine) {
      query.medicine = req.query.medicine;
    }
    
    if (req.query.hasStock === 'true') {
      query.quantity = { $gt: 0 };
    }
    
    if (req.query.expired === 'true') {
      query.expiryDate = { $lte: new Date() };
    } else if (req.query.expired === 'false') {
      query.expiryDate = { $gt: new Date() };
    }

    const [batches, total] = await Promise.all([
      Batch.find(query)
        .populate('medicine', 'name code brand manufacturer')
        .populate('vendor', 'name code')
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Batch.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: batches.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: batches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch
// @route   GET /api/v1/batches/:id
// @access  Private
exports.getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('medicine', 'name code brand manufacturer category')
      .populate('vendor', 'name code')
      .populate('purchase', 'invoiceNumber vendorInvoiceNumber');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get batches by medicine for selling (FIFO)
// @route   GET /api/v1/batches/medicine/:medicineId/available
// @access  Private
exports.getAvailableBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find({
      medicine: req.params.medicineId,
      quantity: { $gt: 0 },
      isExpired: false,
      expiryDate: { $gt: new Date() }
    })
    .sort({ expiryDate: 1, createdAt: 1 }) // FIFO
    .lean();

    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

    res.status(200).json({
      success: true,
      totalStock,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring batches
// @route   GET /api/v1/batches/expiring
// @access  Private
exports.getExpiringBatches = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const batches = await Batch.find({
      expiryDate: { $lte: futureDate, $gt: new Date() },
      quantity: { $gt: 0 }
    })
    .populate('medicine', 'name code brand manufacturer')
    .sort({ expiryDate: 1 })
    .lean();

    // Group by expiry status
    const grouped = {
      critical: [], // 0-30 days
      warning: [],  // 31-60 days
      attention: [] // 61-90 days
    };

    batches.forEach(batch => {
      const daysUntil = Math.ceil((new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 30) {
        grouped.critical.push({ ...batch, daysUntilExpiry: daysUntil });
      } else if (daysUntil <= 60) {
        grouped.warning.push({ ...batch, daysUntilExpiry: daysUntil });
      } else {
        grouped.attention.push({ ...batch, daysUntilExpiry: daysUntil });
      }
    });

    res.status(200).json({
      success: true,
      data: grouped,
      summary: {
        critical: grouped.critical.length,
        warning: grouped.warning.length,
        attention: grouped.attention.length,
        total: batches.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expired batches
// @route   GET /api/v1/batches/expired
// @access  Private
exports.getExpiredBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find({
      expiryDate: { $lte: new Date() },
      quantity: { $gt: 0 }
    })
    .populate('medicine', 'name code brand manufacturer')
    .sort({ expiryDate: 1 })
    .lean();

    const totalValue = batches.reduce((sum, b) => sum + (b.quantity * b.purchasePrice), 0);

    res.status(200).json({
      success: true,
      count: batches.length,
      totalValue,
      data: batches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust batch quantity (for stock adjustment)
// @route   PUT /api/v1/batches/:id/adjust
// @access  Private (Owner only)
exports.adjustQuantity = async (req, res, next) => {
  try {
    const { adjustmentType, quantity, reason } = req.body;
    
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    let newQuantity;
    if (adjustmentType === 'add') {
      newQuantity = batch.quantity + quantity;
    } else if (adjustmentType === 'subtract') {
      if (batch.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Cannot subtract more than available quantity'
        });
      }
      newQuantity = batch.quantity - quantity;
    } else if (adjustmentType === 'set') {
      newQuantity = quantity;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid adjustment type'
      });
    }

    batch.quantity = newQuantity;
    batch.notes = reason || batch.notes;
    await batch.save();

    // Update medicine stock
    const medicine = await Medicine.findById(batch.medicine);
    if (medicine) {
      await medicine.updateStockFromBatches();
    }

    res.status(200).json({
      success: true,
      message: 'Batch quantity adjusted successfully',
      data: batch
    });
  } catch (error) {
    next(error);
  }
};
