const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Ledger = require('../models/Ledger');
const { PAGINATION } = require('../config/constants');

// @desc    Get all payments
// @route   GET /api/v1/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (req.query.paymentType) {
      query.paymentType = req.query.paymentType;
    }

    if (req.query.customer) {
      query.customer = req.query.customer;
    }

    if (req.query.vendor) {
      query.vendor = req.query.vendor;
    }

    if (req.query.paymentMode) {
      query.paymentMode = req.query.paymentMode;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      query.paymentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('customer', 'name code')
        .populate('vendor', 'name code')
        .populate('createdBy', 'name')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/v1/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'name code gstin address phone')
      .populate('vendor', 'name code gstin address phone')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer receipt
// @route   POST /api/v1/payments/customer-receipt
// @access  Private
exports.createCustomerReceipt = async (req, res, next) => {
  try {
    const { customer, amount, paymentMode, paymentDate, bankName, chequeNumber, chequeDate, transactionReference, linkedInvoices, notes } = req.body;

    // Get customer
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const previousOutstanding = customerDoc.outstandingBalance;

    // Create payment
    const payment = await Payment.create({
      paymentType: 'customer_receipt',
      customer,
      customerName: customerDoc.name,
      amount,
      paymentMode,
      paymentDate: paymentDate || new Date(),
      bankName,
      chequeNumber,
      chequeDate,
      transactionReference,
      linkedInvoices,
      previousOutstanding,
      newOutstanding: previousOutstanding - amount,
      notes,
      createdBy: req.user.id
    });

    // Update customer
    customerDoc.totalReceipts += amount;
    customerDoc.outstandingBalance -= amount;
    await customerDoc.save();

    // Update linked invoices if provided
    if (linkedInvoices && linkedInvoices.length > 0) {
      for (const invoice of linkedInvoices) {
        await Sale.findByIdAndUpdate(
          invoice.invoiceId,
          {
            $inc: { paidAmount: invoice.allocatedAmount }
          }
        );
      }
    }

    // Add ledger entry
    await Ledger.addEntry({
      ledgerType: 'customer',
      partyId: customer,
      partyName: customerDoc.name,
      partyCode: customerDoc.code,
      date: paymentDate || new Date(),
      particulars: `Receipt - ${payment.paymentNumber} (${paymentMode})`,
      referenceNumber: payment.paymentNumber,
      referenceType: 'receipt',
      referenceId: payment._id,
      credit: amount
    });

    res.status(201).json({
      success: true,
      message: 'Customer receipt recorded successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor payment
// @route   POST /api/v1/payments/vendor-payment
// @access  Private
exports.createVendorPayment = async (req, res, next) => {
  try {
    const { vendor, amount, paymentMode, paymentDate, bankName, chequeNumber, chequeDate, transactionReference, linkedInvoices, notes } = req.body;

    // Get vendor
    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const previousOutstanding = vendorDoc.outstandingBalance;

    // Create payment
    const payment = await Payment.create({
      paymentType: 'vendor_payment',
      vendor,
      vendorName: vendorDoc.name,
      amount,
      paymentMode,
      paymentDate: paymentDate || new Date(),
      bankName,
      chequeNumber,
      chequeDate,
      transactionReference,
      linkedInvoices,
      previousOutstanding,
      newOutstanding: previousOutstanding - amount,
      notes,
      createdBy: req.user.id
    });

    // Update vendor
    vendorDoc.totalPayments += amount;
    vendorDoc.outstandingBalance -= amount;
    await vendorDoc.save();

    // Update linked invoices if provided
    if (linkedInvoices && linkedInvoices.length > 0) {
      for (const invoice of linkedInvoices) {
        await Purchase.findByIdAndUpdate(
          invoice.invoiceId,
          {
            $inc: { paidAmount: invoice.allocatedAmount }
          }
        );
      }
    }

    // Add ledger entry
    await Ledger.addEntry({
      ledgerType: 'vendor',
      partyId: vendor,
      partyName: vendorDoc.name,
      partyCode: vendorDoc.code,
      date: paymentDate || new Date(),
      particulars: `Payment - ${payment.paymentNumber} (${paymentMode})`,
      referenceNumber: payment.paymentNumber,
      referenceType: 'payment',
      referenceId: payment._id,
      debit: amount
    });

    res.status(201).json({
      success: true,
      message: 'Vendor payment recorded successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment summary
// @route   GET /api/v1/payments/summary
// @access  Private
exports.getPaymentSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { status: 'cleared' };
    if (startDate && endDate) {
      matchQuery.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
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

    const result = {
      customerReceipts: { count: 0, total: 0 },
      vendorPayments: { count: 0, total: 0 }
    };

    summary.forEach(s => {
      if (s._id === 'customer_receipt') {
        result.customerReceipts = { count: s.count, total: s.total };
      } else {
        result.vendorPayments = { count: s.count, total: s.total };
      }
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
