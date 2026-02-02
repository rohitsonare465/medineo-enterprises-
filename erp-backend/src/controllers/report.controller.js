const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');

// @desc    Get sales report
// @route   GET /api/v1/reports/sales
// @access  Private (Owner/Accountant)
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, customer, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const matchQuery = {
      saleDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $ne: 'cancelled' }
    };

    if (customer) {
      matchQuery.customer = customer;
    }

    // Summary
    const summary = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          totalTaxable: { $sum: '$taxableAmount' },
          totalCgst: { $sum: '$cgstTotal' },
          totalSgst: { $sum: '$sgstTotal' },
          totalIgst: { $sum: '$igstTotal' },
          totalGst: { $sum: '$totalGst' },
          totalDiscount: { $sum: '$totalDiscount' },
          totalReceived: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' }
        }
      }
    ]);

    // Group by period
    let groupByField;
    if (groupBy === 'day') {
      groupByField = { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } };
    } else if (groupBy === 'month') {
      groupByField = { $dateToString: { format: '%Y-%m', date: '$saleDate' } };
    } else {
      groupByField = { $dateToString: { format: '%Y', date: '$saleDate' } };
    }

    const periodWise = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupByField,
          count: { $sum: 1 },
          amount: { $sum: '$grandTotal' },
          gst: { $sum: '$totalGst' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Customer wise
    const customerWise = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$customer',
          customerName: { $first: '$customerName' },
          count: { $sum: 1 },
          amount: { $sum: '$grandTotal' },
          received: { $sum: '$paidAmount' },
          pending: { $sum: '$balanceAmount' }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {},
        periodWise,
        customerWise
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase report
// @route   GET /api/v1/reports/purchases
// @access  Private (Owner/Accountant)
exports.getPurchaseReport = async (req, res, next) => {
  try {
    const { startDate, endDate, vendor, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const matchQuery = {
      purchaseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'confirmed'
    };

    if (vendor) {
      matchQuery.vendor = vendor;
    }

    // Summary
    const summary = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          totalTaxable: { $sum: '$taxableAmount' },
          totalCgst: { $sum: '$cgstTotal' },
          totalSgst: { $sum: '$sgstTotal' },
          totalIgst: { $sum: '$igstTotal' },
          totalGst: { $sum: '$totalGst' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' }
        }
      }
    ]);

    // Vendor wise
    const vendorWise = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$vendor',
          vendorName: { $first: '$vendorName' },
          count: { $sum: 1 },
          amount: { $sum: '$grandTotal' },
          paid: { $sum: '$paidAmount' },
          pending: { $sum: '$balanceAmount' }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {},
        vendorWise
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GST report
// @route   GET /api/v1/reports/gst
// @access  Private (Owner/Accountant)
exports.getGstReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    let salesGst = { cgst: 0, sgst: 0, igst: 0, total: 0 };
    let purchaseGst = { cgst: 0, sgst: 0, igst: 0, total: 0 };

    if (type === 'all' || type === 'sales') {
      const salesResult = await Sale.aggregate([
        { $match: { saleDate: dateFilter, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            cgst: { $sum: '$cgstTotal' },
            sgst: { $sum: '$sgstTotal' },
            igst: { $sum: '$igstTotal' },
            total: { $sum: '$totalGst' }
          }
        }
      ]);
      if (salesResult[0]) {
        salesGst = salesResult[0];
      }
    }

    if (type === 'all' || type === 'purchases') {
      const purchaseResult = await Purchase.aggregate([
        { $match: { purchaseDate: dateFilter, status: 'confirmed' } },
        {
          $group: {
            _id: null,
            cgst: { $sum: '$cgstTotal' },
            sgst: { $sum: '$sgstTotal' },
            igst: { $sum: '$igstTotal' },
            total: { $sum: '$totalGst' }
          }
        }
      ]);
      if (purchaseResult[0]) {
        purchaseGst = purchaseResult[0];
      }
    }

    // GST rate wise breakup for sales
    const salesGstRateWise = await Sale.aggregate([
      { $match: { saleDate: dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.gstRate',
          taxableAmount: { $sum: '$items.taxableAmount' },
          cgst: { $sum: '$items.cgstAmount' },
          sgst: { $sum: '$items.sgstAmount' },
          igst: { $sum: '$items.igstAmount' },
          totalGst: { $sum: { $add: ['$items.cgstAmount', '$items.sgstAmount', '$items.igstAmount'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        salesGst,
        purchaseGst,
        netPayable: {
          cgst: salesGst.cgst - purchaseGst.cgst,
          sgst: salesGst.sgst - purchaseGst.sgst,
          igst: salesGst.igst - purchaseGst.igst,
          total: salesGst.total - purchaseGst.total
        },
        salesGstRateWise
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profit report
// @route   GET /api/v1/reports/profit
// @access  Private (Owner only)
exports.getProfitReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    // Sales total
    const salesTotal = await Sale.aggregate([
      { $match: { saleDate: dateFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$taxableAmount' },
          gstCollected: { $sum: '$totalGst' },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Cost of goods sold (from sale items)
    const cogs = await Sale.aggregate([
      { $match: { saleDate: dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'batches',
          localField: 'items.batch',
          foreignField: '_id',
          as: 'batchInfo'
        }
      },
      { $unwind: '$batchInfo' },
      {
        $group: {
          _id: null,
          totalCost: { $sum: { $multiply: ['$items.quantity', '$batchInfo.purchasePrice'] } }
        }
      }
    ]);

    const revenue = salesTotal[0]?.revenue || 0;
    const costOfGoods = cogs[0]?.totalCost || 0;
    const grossProfit = revenue - costOfGoods;
    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        revenue,
        costOfGoods,
        grossProfit,
        grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
        gstCollected: salesTotal[0]?.gstCollected || 0,
        totalSales: salesTotal[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment report
// @route   GET /api/v1/reports/payments
// @access  Private
exports.getPaymentReport = async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const matchQuery = {
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: 'cleared'
    };

    if (type) {
      matchQuery.paymentType = type;
    }

    const summary = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const paymentModeWise = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { type: '$paymentType', mode: '$paymentMode' },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary,
        paymentModeWise
      }
    });
  } catch (error) {
    next(error);
  }
};
