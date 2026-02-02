const Customer = require('../models/Customer');
const { PAGINATION } = require('../config/constants');

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.city) {
      query['address.city'] = new RegExp(req.query.city, 'i');
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/v1/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has outstanding balance
    if (customer.outstandingBalance > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with outstanding balance'
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer outstanding summary
// @route   GET /api/v1/customers/summary/outstanding
// @access  Private
exports.getOutstandingSummary = async (req, res, next) => {
  try {
    const summary = await Customer.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalSales: { $sum: '$totalSales' },
          totalReceipts: { $sum: '$totalReceipts' },
          totalOutstanding: { $sum: '$outstandingBalance' }
        }
      }
    ]);

    const topOutstanding = await Customer.find({ outstandingBalance: { $gt: 0 } })
      .sort({ outstandingBalance: -1 })
      .limit(10)
      .select('name code outstandingBalance phone type');

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          totalCustomers: 0,
          totalSales: 0,
          totalReceipts: 0,
          totalOutstanding: 0
        },
        topOutstanding
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check customer credit limit
// @route   GET /api/v1/customers/:id/credit-check
// @access  Private
exports.checkCreditLimit = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const availableCredit = customer.creditLimit - customer.outstandingBalance;
    const isOverLimit = customer.outstandingBalance >= customer.creditLimit;

    res.status(200).json({
      success: true,
      data: {
        creditLimit: customer.creditLimit,
        outstandingBalance: customer.outstandingBalance,
        availableCredit: availableCredit > 0 ? availableCredit : 0,
        isOverLimit
      }
    });
  } catch (error) {
    next(error);
  }
};
