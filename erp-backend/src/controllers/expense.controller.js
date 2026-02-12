const Expense = require('../models/Expense');
const { PAGINATION } = require('../config/constants');

// @desc    Get all expenses
// @route   GET /api/v1/expenses
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { expenseNumber: searchRegex },
        { paidTo: searchRegex },
        { description: searchRegex }
      ];
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.paymentMode) {
      query.paymentMode = req.query.paymentMode;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      query.expenseDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.expenseDate = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.expenseDate = { $lte: new Date(req.query.endDate) };
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('createdBy', 'name')
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/v1/expenses/:id
// @access  Private
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/v1/expenses
// @access  Private (owner, accountant)
exports.createExpense = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/v1/expenses/:id
// @access  Private (owner, accountant)
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/v1/expenses/:id
// @access  Private (owner)
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expense summary (totals by category, month, etc.)
// @route   GET /api/v1/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Date range filter (default to current month)
    const startDate = req.query.startDate ? new Date(req.query.startDate) : startOfMonth;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : endOfMonth;

    const dateFilter = {
      expenseDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    };

    const [totalExpenses, categoryBreakdown, monthlyTrend, recentExpenses] = await Promise.all([
      // Total for period
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),

      // By category
      Expense.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),

      // Last 6 months trend
      Expense.aggregate([
        {
          $match: {
            expenseDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$expenseDate' },
              month: { $month: '$expenseDate' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Recent 5 expenses
      Expense.find({ status: { $ne: 'cancelled' } })
        .sort({ expenseDate: -1 })
        .limit(5)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalExpenses[0]?.total || 0,
        totalCount: totalExpenses[0]?.count || 0,
        categoryBreakdown,
        monthlyTrend,
        recentExpenses,
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    next(error);
  }
};
