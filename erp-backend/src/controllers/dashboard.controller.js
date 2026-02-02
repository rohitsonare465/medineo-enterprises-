const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const Payment = require('../models/Payment');

// @desc    Get dashboard stats
// @route   GET /api/v1/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), today.getMonth() >= 3 ? 3 : -9, 1);

    // Parallel queries for performance
    const [
      todaySales,
      monthSales,
      yearSales,
      todayPurchases,
      monthPurchases,
      totalReceivable,
      totalPayable,
      lowStockCount,
      expiringCount,
      expiredCount,
      todayReceipts,
      todayPayments,
      recentSales,
      recentPurchases
    ] = await Promise.all([
      // Today's sales
      Sale.aggregate([
        { $match: { saleDate: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      
      // Month's sales
      Sale.aggregate([
        { $match: { saleDate: { $gte: monthStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      
      // Year's sales
      Sale.aggregate([
        { $match: { saleDate: { $gte: yearStart }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      
      // Today's purchases
      Purchase.aggregate([
        { $match: { purchaseDate: { $gte: today, $lt: tomorrow }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      
      // Month's purchases
      Purchase.aggregate([
        { $match: { purchaseDate: { $gte: monthStart }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]),
      
      // Total receivable (customer outstanding)
      Customer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$outstandingBalance' } } }
      ]),
      
      // Total payable (vendor outstanding)
      Vendor.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$outstandingBalance' } } }
      ]),
      
      // Low stock count
      Medicine.countDocuments({
        isActive: true,
        $expr: { $lt: ['$currentStock', '$minStockLevel'] }
      }),
      
      // Expiring in 90 days
      Batch.countDocuments({
        expiryDate: { $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), $gt: new Date() },
        quantity: { $gt: 0 }
      }),
      
      // Expired
      Batch.countDocuments({
        expiryDate: { $lte: new Date() },
        quantity: { $gt: 0 }
      }),
      
      // Today's receipts
      Payment.aggregate([
        { $match: { paymentType: 'customer_receipt', paymentDate: { $gte: today, $lt: tomorrow }, status: 'cleared' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      
      // Today's payments
      Payment.aggregate([
        { $match: { paymentType: 'vendor_payment', paymentDate: { $gte: today, $lt: tomorrow }, status: 'cleared' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      
      // Recent sales
      Sale.find({ status: { $ne: 'cancelled' } })
        .populate('customer', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber customerName grandTotal paymentStatus createdAt')
        .lean(),
      
      // Recent purchases
      Purchase.find({ status: 'confirmed' })
        .populate('vendor', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber vendorName grandTotal paymentStatus createdAt')
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        sales: {
          today: todaySales[0] || { total: 0, count: 0 },
          month: monthSales[0] || { total: 0, count: 0 },
          year: yearSales[0] || { total: 0, count: 0 }
        },
        purchases: {
          today: todayPurchases[0] || { total: 0, count: 0 },
          month: monthPurchases[0] || { total: 0, count: 0 }
        },
        receivable: totalReceivable[0]?.total || 0,
        payable: totalPayable[0]?.total || 0,
        receipts: {
          today: todayReceipts[0] || { total: 0, count: 0 }
        },
        payments: {
          today: todayPayments[0] || { total: 0, count: 0 }
        },
        alerts: {
          lowStock: lowStockCount,
          expiring: expiringCount,
          expired: expiredCount
        },
        recentActivity: {
          sales: recentSales,
          purchases: recentPurchases
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales chart data
// @route   GET /api/v1/dashboard/sales-chart
// @access  Private
exports.getSalesChart = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    let groupBy, dateFormat, limit;

    if (period === 'week') {
      groupBy = { $dayOfWeek: '$saleDate' };
      limit = 7;
    } else if (period === 'month') {
      groupBy = { $dayOfMonth: '$saleDate' };
      limit = 31;
    } else {
      groupBy = { $month: '$saleDate' };
      limit = 12;
    }

    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const data = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupBy,
          sales: { $sum: '$grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top customers
// @route   GET /api/v1/dashboard/top-customers
// @access  Private
exports.getTopCustomers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const customers = await Customer.find({ isActive: true, totalSales: { $gt: 0 } })
      .sort({ totalSales: -1 })
      .limit(parseInt(limit))
      .select('name code type totalSales outstandingBalance')
      .lean();

    res.status(200).json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling medicines
// @route   GET /api/v1/dashboard/top-medicines
// @access  Private
exports.getTopMedicines = async (req, res, next) => {
  try {
    const { limit = 10, period = 'month' } = req.query;

    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const data = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          medicineName: { $first: '$items.medicineName' },
          medicineCode: { $first: '$items.medicineCode' },
          totalQty: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.totalAmount' }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
