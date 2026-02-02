const Vendor = require('../models/Vendor');
const { PAGINATION } = require('../config/constants');

// @desc    Get all vendors
// @route   GET /api/v1/vendors
// @access  Private
exports.getVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.search) {
      // Escape special regex characters
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { gstin: searchRegex },
        { contactPerson: searchRegex }
      ];
    }
    
    // Default to active vendors unless explicitly set
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.city) {
      query['address.city'] = new RegExp(req.query.city, 'i');
    }

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vendor.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: vendors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/v1/vendors/:id
// @access  Private
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor
// @route   POST /api/v1/vendors
// @access  Private
exports.createVendor = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const vendor = await Vendor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/v1/vendors/:id
// @access  Private
exports.updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/v1/vendors/:id
// @access  Private
exports.deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if vendor has outstanding balance
    if (vendor.outstandingBalance > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vendor with outstanding balance'
      });
    }

    await vendor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor outstanding summary
// @route   GET /api/v1/vendors/summary/outstanding
// @access  Private
exports.getOutstandingSummary = async (req, res, next) => {
  try {
    const summary = await Vendor.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalVendors: { $sum: 1 },
          totalPurchases: { $sum: '$totalPurchases' },
          totalPayments: { $sum: '$totalPayments' },
          totalOutstanding: { $sum: '$outstandingBalance' }
        }
      }
    ]);

    const topOutstanding = await Vendor.find({ outstandingBalance: { $gt: 0 } })
      .sort({ outstandingBalance: -1 })
      .limit(10)
      .select('name code outstandingBalance phone');

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          totalVendors: 0,
          totalPurchases: 0,
          totalPayments: 0,
          totalOutstanding: 0
        },
        topOutstanding
      }
    });
  } catch (error) {
    next(error);
  }
};
