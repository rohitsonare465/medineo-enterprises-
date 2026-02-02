const Ledger = require('../models/Ledger');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const { PAGINATION } = require('../config/constants');

// @desc    Get customer ledger
// @route   GET /api/v1/ledger/customer/:customerId
// @access  Private
exports.getCustomerLedger = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { financialYear, startDate, endDate } = req.query;

    const customer = await Customer.findById(customerId).select('name code gstin outstandingBalance');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Determine financial year if not provided
    let fy = financialYear;
    if (!fy) {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      fy = month >= 3 
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;
    }

    const ledger = await Ledger.findOne({
      ledgerType: 'customer',
      customer: customerId,
      financialYear: fy
    });

    if (!ledger) {
      return res.status(200).json({
        success: true,
        data: {
          customer,
          financialYear: fy,
          openingBalance: 0,
          entries: [],
          closingBalance: 0,
          totalDebit: 0,
          totalCredit: 0
        }
      });
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

    res.status(200).json({
      success: true,
      data: {
        customer,
        financialYear: ledger.financialYear,
        openingBalance: ledger.openingBalance,
        entries,
        closingBalance: ledger.closingBalance,
        totalDebit: ledger.totalDebit,
        totalCredit: ledger.totalCredit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor ledger
// @route   GET /api/v1/ledger/vendor/:vendorId
// @access  Private
exports.getVendorLedger = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { financialYear, startDate, endDate } = req.query;

    const vendor = await Vendor.findById(vendorId).select('name code gstin outstandingBalance');
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Determine financial year if not provided
    let fy = financialYear;
    if (!fy) {
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      fy = month >= 3 
        ? `${year}-${(year + 1).toString().slice(-2)}`
        : `${year - 1}-${year.toString().slice(-2)}`;
    }

    const ledger = await Ledger.findOne({
      ledgerType: 'vendor',
      vendor: vendorId,
      financialYear: fy
    });

    if (!ledger) {
      return res.status(200).json({
        success: true,
        data: {
          vendor,
          financialYear: fy,
          openingBalance: 0,
          entries: [],
          closingBalance: 0,
          totalDebit: 0,
          totalCredit: 0
        }
      });
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

    res.status(200).json({
      success: true,
      data: {
        vendor,
        financialYear: ledger.financialYear,
        openingBalance: ledger.openingBalance,
        entries,
        closingBalance: ledger.closingBalance,
        totalDebit: ledger.totalDebit,
        totalCredit: ledger.totalCredit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customer outstanding
// @route   GET /api/v1/ledger/customers/outstanding
// @access  Private
exports.getCustomersOutstanding = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = { 
      isActive: true,
      outstandingBalance: { $gt: 0 }
    };

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const [customers, total, totals] = await Promise.all([
      Customer.find(query)
        .select('name code phone type totalSales totalReceipts outstandingBalance creditLimit')
        .sort({ outstandingBalance: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
      Customer.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalOutstanding: { $sum: '$outstandingBalance' },
            totalSales: { $sum: '$totalSales' },
            totalReceipts: { $sum: '$totalReceipts' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      summary: totals[0] || { totalOutstanding: 0, totalSales: 0, totalReceipts: 0 },
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendor payables
// @route   GET /api/v1/ledger/vendors/payables
// @access  Private
exports.getVendorsPayables = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = { 
      isActive: true,
      outstandingBalance: { $gt: 0 }
    };

    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const [vendors, total, totals] = await Promise.all([
      Vendor.find(query)
        .select('name code phone totalPurchases totalPayments outstandingBalance')
        .sort({ outstandingBalance: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vendor.countDocuments(query),
      Vendor.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalPayable: { $sum: '$outstandingBalance' },
            totalPurchases: { $sum: '$totalPurchases' },
            totalPayments: { $sum: '$totalPayments' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      count: vendors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      summary: totals[0] || { totalPayable: 0, totalPurchases: 0, totalPayments: 0 },
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};
