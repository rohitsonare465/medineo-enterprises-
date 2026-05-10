const CreditNote = require('../models/CreditNote');
const Sale = require('../models/Sale');
const { PAGINATION } = require('../config/constants');

// @desc    Generate Credit Note from Sale
// @route   POST /api/v1/credit-notes
// @access  Private
exports.generateCreditNote = async (req, res, next) => {
  try {
    const { originalInvoiceId } = req.body;

    if (!originalInvoiceId) {
      return res.status(400).json({
        success: false,
        message: 'originalInvoiceId is required'
      });
    }

    const sale = await Sale.findById(originalInvoiceId).lean();
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Original invoice not found'
      });
    }

    // Check if credit note already exists (optional: user said one invoice can have multiple credit notes, so we don't block it, but maybe just proceed)
    
    // Generate Credit Note
    const creditNoteData = {
      originalInvoice: sale._id,
      originalInvoiceNumber: sale.invoiceNumber,
      customer: sale.customer,
      customerName: sale.customerName,
      customerGstin: sale.customerGstin,
      customerDrugLicense: sale.customerDrugLicense,
      customerAddress: sale.customerAddress,
      date: new Date(),
      items: sale.items.map(item => {
        // Strip _id to avoid duplicate key errors for embedded docs
        const { _id, ...itemData } = item;
        return itemData;
      }),
      subtotal: sale.subtotal,
      totalDiscount: sale.totalDiscount,
      taxableAmount: sale.taxableAmount,
      cgstTotal: sale.cgstTotal,
      sgstTotal: sale.sgstTotal,
      igstTotal: sale.igstTotal,
      totalGst: sale.totalGst,
      freightCharges: sale.freightCharges,
      otherCharges: sale.otherCharges,
      roundOff: sale.roundOff,
      grandTotal: sale.grandTotal,
      gstType: sale.gstType,
      createdBy: req.user.id
    };

    const creditNote = await CreditNote.create(creditNoteData);

    res.status(201).json({
      success: true,
      message: 'Credit Note generated successfully',
      data: creditNote
    });
  } catch (error) {
    console.error('Credit Note generation error:', error);
    next(error);
  }
};

// @desc    Get all Credit Notes
// @route   GET /api/v1/credit-notes
// @access  Private
exports.getCreditNotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.originalInvoice) {
      query.originalInvoice = req.query.originalInvoice;
    }

    const [creditNotes, total] = await Promise.all([
      CreditNote.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CreditNote.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: creditNotes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: creditNotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single Credit Note
// @route   GET /api/v1/credit-notes/:id
// @access  Private
exports.getCreditNote = async (req, res, next) => {
  try {
    const creditNote = await CreditNote.findById(req.params.id)
      .populate('originalInvoice', 'invoiceNumber saleDate')
      .populate('createdBy', 'name email');

    if (!creditNote) {
      return res.status(404).json({
        success: false,
        message: 'Credit Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: creditNote
    });
  } catch (error) {
    next(error);
  }
};
