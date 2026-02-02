const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const Customer = require('../models/Customer');
const Ledger = require('../models/Ledger');
const { PAGINATION } = require('../config/constants');

// @desc    Get all sales
// @route   GET /api/v1/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (req.query.customer) {
      query.customer = req.query.customer;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.startDate && req.query.endDate) {
      query.saleDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('customer', 'name code gstin type')
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Sale.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/v1/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name code gstin drugLicenseNo address phone')
      .populate('items.medicine', 'name code brand manufacturer')
      .populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sale
// @route   POST /api/v1/sales
// @access  Private
exports.createSale = async (req, res, next) => {
  try {
    console.log('=== SALE REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('=========================');

    const { customer, items, gstType, paymentMode, paidAmount, notes, freightCharges, otherCharges } = req.body;

    // Get customer details
    const customerDoc = await Customer.findById(customer);
    if (!customerDoc) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Determine GST type
    const isInterState = gstType === 'inter_state';

    // Process items and deduct from batches (FIFO)
    const processedItems = [];
    let subtotal = 0;
    let totalDiscount = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let taxableAmount = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicine}`
        });
      }

      // Get batch
      const batch = await Batch.findById(item.batch);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: `Batch not found: ${item.batch}`
        });
      }

      if (batch.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantity}`
        });
      }

      // Calculate item totals
      const sellingPrice = item.sellingPrice || batch.sellingPrice;
      const baseAmount = item.quantity * sellingPrice;
      const discountAmount = baseAmount * (item.discountPercent || 0) / 100;
      const itemTaxableAmount = baseAmount - discountAmount;

      const gstRate = medicine.gstRate;
      let cgst = 0, sgst = 0, igst = 0;

      if (isInterState) {
        igst = itemTaxableAmount * gstRate / 100;
      } else {
        cgst = itemTaxableAmount * (gstRate / 2) / 100;
        sgst = itemTaxableAmount * (gstRate / 2) / 100;
      }

      const itemTotal = itemTaxableAmount + cgst + sgst + igst;

      // Deduct from batch
      batch.quantity -= item.quantity;
      await batch.save();

      // Update medicine stock
      medicine.currentStock -= item.quantity;
      await medicine.save();

      processedItems.push({
        medicine: item.medicine,
        medicineName: medicine.name,
        medicineCode: medicine.code,
        batch: batch._id,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: item.quantity,
        freeQuantity: item.freeQuantity || 0,
        mrp: batch.mrp,
        sellingPrice,
        discountPercent: item.discountPercent || 0,
        discountAmount,
        gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        taxableAmount: itemTaxableAmount,
        totalAmount: itemTotal
      });

      subtotal += baseAmount;
      totalDiscount += discountAmount;
      taxableAmount += itemTaxableAmount;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;
    }

    // Calculate grand total
    const totalGst = cgstTotal + sgstTotal + igstTotal;
    const grandTotalBeforeRound = taxableAmount + totalGst + (freightCharges || 0) + (otherCharges || 0);
    const grandTotal = Math.round(grandTotalBeforeRound);
    const roundOff = grandTotal - grandTotalBeforeRound;

    // Calculate due date based on customer payment terms
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (customerDoc.paymentTerms || 15));

    // Create sale
    const sale = await Sale.create({
      customer,
      customerName: customerDoc.name,
      customerGstin: customerDoc.gstin,
      customerDrugLicense: customerDoc.drugLicenseNo,
      customerAddress: customerDoc.address,
      saleDate: new Date(),
      items: processedItems,
      subtotal,
      totalDiscount,
      taxableAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalGst,
      freightCharges: freightCharges || 0,
      otherCharges: otherCharges || 0,
      roundOff,
      grandTotal,
      paidAmount: paidAmount || 0,
      paymentMode: paymentMode || 'Credit',
      gstType: gstType || 'intra_state',
      dueDate,
      notes,
      createdBy: req.user.id
    });

    // Update customer outstanding
    customerDoc.totalSales += grandTotal;
    customerDoc.totalReceipts += paidAmount || 0;
    customerDoc.outstandingBalance += (grandTotal - (paidAmount || 0));
    await customerDoc.save();

    // Add ledger entry for sale
    await Ledger.addEntry({
      ledgerType: 'customer',
      partyId: customer,
      partyName: customerDoc.name,
      partyCode: customerDoc.code,
      date: new Date(),
      particulars: `Sales - ${sale.invoiceNumber}`,
      referenceNumber: sale.invoiceNumber,
      referenceType: 'sale',
      referenceId: sale._id,
      debit: grandTotal
    });

    // Add ledger entry for payment if paid
    if (paidAmount > 0) {
      await Ledger.addEntry({
        ledgerType: 'customer',
        partyId: customer,
        partyName: customerDoc.name,
        partyCode: customerDoc.code,
        date: new Date(),
        particulars: `Receipt against ${sale.invoiceNumber}`,
        referenceNumber: sale.invoiceNumber,
        referenceType: 'receipt',
        referenceId: sale._id,
        credit: paidAmount
      });
    }

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale
    });
  } catch (error) {
    console.error('Sale creation error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// @desc    Get sale summary
// @route   GET /api/v1/sales/summary
// @access  Private
exports.getSaleSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = { status: { $ne: 'cancelled' } };
    if (startDate && endDate) {
      matchQuery.saleDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          totalGst: { $sum: '$totalGst' },
          totalReceived: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' }
        }
      }
    ]);

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: today, $lt: tomorrow },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Monthly trend
    const monthlyTrend = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          total: { $sum: '$grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          totalSales: 0,
          totalAmount: 0,
          totalGst: 0,
          totalReceived: 0,
          totalPending: 0
        },
        todaySales: todaySales[0] || { count: 0, total: 0 },
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auto-allocate batches for sale (FIFO)
// @route   POST /api/v1/sales/allocate-batches
// @access  Private
exports.allocateBatches = async (req, res, next) => {
  try {
    const { items } = req.body;
    const allocations = [];

    for (const item of items) {
      const result = await Batch.getBatchesForSelling(item.medicine, item.quantity);
      allocations.push({
        medicine: item.medicine,
        requestedQty: item.quantity,
        ...result
      });
    }

    res.status(200).json({
      success: true,
      data: allocations
    });
  } catch (error) {
    next(error);
  }
};
