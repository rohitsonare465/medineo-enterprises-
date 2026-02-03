const Inquiry = require('../models/Inquiry');
const Customer = require('../models/Customer');
const { PAGINATION } = require('../config/constants');
const { sendInquiryNotification } = require('../config/email');

// @desc    Get all inquiries
// @route   GET /api/v1/inquiries
// @access  Private
exports.getInquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.source) {
      query.source = req.query.source;
    }
    
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('assignedTo', 'name')
        .populate('customer', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: inquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: inquiries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry
// @route   GET /api/v1/inquiries/:id
// @access  Private
exports.getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('customer', 'name code phone')
      .populate('followUps.contactedBy', 'name');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create inquiry (Public for website)
// @route   POST /api/v1/inquiries
// @access  Public
exports.createInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.create(req.body);

    // Send email notification to medineoenterprises@gmail.com
    sendInquiryNotification(inquiry).catch(err => {
      console.error('Failed to send inquiry notification:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry
// @route   PUT /api/v1/inquiries/:id
// @access  Private
exports.updateInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add follow-up
// @route   POST /api/v1/inquiries/:id/followup
// @access  Private
exports.addFollowUp = async (req, res, next) => {
  try {
    const { notes, nextFollowUpDate } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    inquiry.followUps.push({
      notes,
      nextFollowUpDate,
      contactedBy: req.user.id
    });

    if (inquiry.status === 'new') {
      inquiry.status = 'contacted';
    }

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up added successfully',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert inquiry to customer
// @route   POST /api/v1/inquiries/:id/convert
// @access  Private
exports.convertToCustomer = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    if (inquiry.convertedToCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Inquiry already converted to customer'
      });
    }

    // Create customer from inquiry
    const customerData = {
      name: inquiry.company || inquiry.name,
      contactPerson: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      address: {
        city: inquiry.city || '',
        state: inquiry.state || ''
      },
      ...req.body,
      createdBy: req.user.id
    };

    const customer = await Customer.create(customerData);

    // Update inquiry
    inquiry.convertedToCustomer = true;
    inquiry.customer = customer._id;
    inquiry.conversionDate = new Date();
    inquiry.status = 'converted';
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: 'Inquiry converted to customer successfully',
      data: {
        inquiry,
        customer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/v1/inquiries/:id
// @access  Private
exports.deleteInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inquiry stats
// @route   GET /api/v1/inquiries/stats
// @access  Private
exports.getInquiryStats = async (req, res, next) => {
  try {
    const stats = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = await Inquiry.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    // Today's new inquiries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Inquiry.countDocuments({
      createdAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        bySource: sourceStats,
        todayNew: todayCount
      }
    });
  } catch (error) {
    next(error);
  }
};
