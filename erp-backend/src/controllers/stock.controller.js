const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const { PAGINATION } = require('../config/constants');

// @desc    Get stock overview
// @route   GET /api/v1/stock
// @access  Private
exports.getStockOverview = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.lowStock === 'true') {
      query.$expr = { $lt: ['$currentStock', '$minStockLevel'] };
    }

    if (req.query.outOfStock === 'true') {
      query.currentStock = 0;
    }

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .select('name code brand manufacturer category currentStock minStockLevel maxStockLevel reorderLevel mrp')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Medicine.countDocuments(query)
    ]);

    // Get batch count for each medicine
    const medicineIds = medicines.map(m => m._id);
    const batchCounts = await Batch.aggregate([
      { $match: { medicine: { $in: medicineIds }, quantity: { $gt: 0 } } },
      { $group: { _id: '$medicine', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } }
    ]);

    const batchCountMap = batchCounts.reduce((acc, b) => {
      acc[b._id.toString()] = { count: b.count, totalQty: b.totalQty };
      return acc;
    }, {});

    const stockData = medicines.map(m => ({
      ...m,
      batchCount: batchCountMap[m._id.toString()]?.count || 0,
      actualStock: batchCountMap[m._id.toString()]?.totalQty || 0,
      stockStatus: m.currentStock === 0 ? 'out_of_stock' :
        m.currentStock < m.minStockLevel ? 'low_stock' :
          m.currentStock > m.maxStockLevel ? 'over_stock' : 'normal'
    }));

    res.status(200).json({
      success: true,
      count: stockData.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: stockData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items
// @route   GET /api/v1/stock/low-stock
// @access  Private
exports.getLowStockItems = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      $expr: { $lt: ['$currentStock', '$minStockLevel'] }
    })
      .select('name code brand manufacturer category currentStock minStockLevel reorderLevel')
      .sort({ currentStock: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get out of stock items
// @route   GET /api/v1/stock/out-of-stock
// @access  Private
exports.getOutOfStockItems = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      currentStock: 0
    })
      .select('name code brand manufacturer category minStockLevel')
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock summary
// @route   GET /api/v1/stock/summary
// @access  Private
exports.getStockSummary = async (req, res, next) => {
  try {
    // Total medicines and stock
    const overview = await Medicine.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalMedicines: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          lowStockCount: {
            $sum: { $cond: [{ $lt: ['$currentStock', '$minStockLevel'] }, 1, 0] }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$currentStock', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Stock value
    const stockValue = await Batch.aggregate([
      { $match: { quantity: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalPurchaseValue: { $sum: { $multiply: ['$quantity', '$purchasePrice'] } },
          totalSaleValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
          totalMrpValue: { $sum: { $multiply: ['$quantity', '$mrp'] } }
        }
      }
    ]);

    // Expiring stock
    const expiringDays = [30, 60, 90];
    const expiringStock = {};

    for (const days of expiringDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const count = await Batch.countDocuments({
        expiryDate: { $lte: futureDate, $gt: new Date() },
        quantity: { $gt: 0 }
      });
      expiringStock[`within${days}Days`] = count;
    }

    // Expired stock
    const expiredCount = await Batch.countDocuments({
      expiryDate: { $lte: new Date() },
      quantity: { $gt: 0 }
    });

    // Category-wise stock
    const categoryStock = await Medicine.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: overview[0] || {
          totalMedicines: 0,
          totalStock: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        },
        stockValue: stockValue[0] || {
          totalPurchaseValue: 0,
          totalSaleValue: 0,
          totalMrpValue: 0
        },
        expiringStock: {
          ...expiringStock,
          expired: expiredCount
        },
        categoryStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock by medicine with batch details
// @route   GET /api/v1/stock/medicine/:id
// @access  Private
exports.getStockByMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .select('name code brand manufacturer category currentStock minStockLevel maxStockLevel');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    const batches = await Batch.find({
      medicine: req.params.id,
      quantity: { $gt: 0 }
    })
      .sort({ expiryDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        medicine,
        batches,
        totalStock: batches.reduce((sum, b) => sum + b.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring stock items
// @route   GET /api/v1/stock/expiry-alerts
// @access  Private
exports.getExpiryAlerts = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringBatches = await Batch.find({
      quantity: { $gt: 0 },
      expiryDate: { $lte: futureDate }
    })
      .populate('medicine', 'name code brand category')
      .sort({ expiryDate: 1 })
      .lean();

    const data = expiringBatches.map(batch => {
      const today = new Date();
      const expiryDate = new Date(batch.expiryDate);
      const diffTime = expiryDate - today;
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        _id: batch._id,
        medicineName: batch.medicine?.name || 'Unknown',
        medicineCode: batch.medicine?.code || '',
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
        daysToExpiry: daysToExpiry,
        status: daysToExpiry <= 0 ? 'expired' : daysToExpiry <= 30 ? 'critical' : 'warning'
      };
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

