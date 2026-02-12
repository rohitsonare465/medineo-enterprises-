const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const Vendor = require('../models/Vendor');
const Ledger = require('../models/Ledger');
const { PAGINATION } = require('../config/constants');

// @desc    Get all purchases
// @route   GET /api/v1/purchases
// @access  Private
exports.getPurchases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (req.query.vendor) {
      query.vendor = req.query.vendor;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    
    if (req.query.startDate && req.query.endDate) {
      query.purchaseDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate('vendor', 'name code gstin')
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Purchase.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: purchases.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: purchases
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single purchase
// @route   GET /api/v1/purchases/:id
// @access  Private
exports.getPurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('vendor', 'name code gstin address phone')
      .populate('items.medicine', 'name code brand manufacturer')
      .populate('createdBy', 'name email');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create purchase
// @route   POST /api/v1/purchases
// @access  Private
exports.createPurchase = async (req, res, next) => {
  try {
    const { vendor, vendorInvoiceNumber, vendorInvoiceDate, items, gstType, notes, freightCharges, otherCharges } = req.body;

    // Get vendor details
    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Determine GST type
    const isInterState = gstType === 'inter_state';

    // Process items and create batches
    const processedItems = [];
    const createdBatches = [];
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

      // Handle both naming conventions from frontend
      const freeQuantity = item.freeQuantity || item.freeQty || 0;
      const discountPercent = item.discountPercent || item.discount || 0;

      // Calculate item totals
      const baseAmount = item.quantity * item.purchasePrice;
      const discountAmount = baseAmount * discountPercent / 100;
      const itemTaxableAmount = baseAmount - discountAmount;
      
      const gstRate = item.gstRate || medicine.gstRate;
      let cgst = 0, sgst = 0, igst = 0;
      
      if (isInterState) {
        igst = itemTaxableAmount * gstRate / 100;
      } else {
        cgst = itemTaxableAmount * (gstRate / 2) / 100;
        sgst = itemTaxableAmount * (gstRate / 2) / 100;
      }

      const itemTotal = itemTaxableAmount + cgst + sgst + igst;

      // Calculate selling price if not provided (default to MRP or purchase price + margin)
      const sellingPrice = item.sellingPrice || item.mrp || Math.round(item.purchasePrice * 1.15);

      // Create batch
      const batch = await Batch.create({
        medicine: item.medicine,
        batchNumber: item.batchNumber.toUpperCase(),
        manufacturingDate: item.manufacturingDate,
        expiryDate: item.expiryDate,
        purchasePrice: item.purchasePrice,
        sellingPrice: sellingPrice,
        mrp: item.mrp,
        quantity: item.quantity + freeQuantity,
        initialQuantity: item.quantity + freeQuantity,
        vendor: vendor,
        createdBy: req.user.id
      });

      createdBatches.push(batch._id);

      processedItems.push({
        medicine: item.medicine,
        medicineName: medicine.name,
        medicineCode: medicine.code,
        batchNumber: item.batchNumber.toUpperCase(),
        expiryDate: item.expiryDate,
        manufacturingDate: item.manufacturingDate,
        quantity: item.quantity,
        freeQuantity: freeQuantity,
        mrp: item.mrp,
        purchasePrice: item.purchasePrice,
        sellingPrice: sellingPrice,
        discountPercent: discountPercent,
        discountAmount,
        gstRate,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        taxableAmount: itemTaxableAmount,
        totalAmount: itemTotal,
        batch: batch._id
      });

      // Update medicine stock
      medicine.currentStock += item.quantity + freeQuantity;
      await medicine.save();

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

    // Create purchase
    const purchase = await Purchase.create({
      vendorInvoiceNumber,
      vendorInvoiceDate,
      vendor,
      vendorName: vendorDoc.name,
      vendorGstin: vendorDoc.gstin,
      purchaseDate: new Date(),
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
      gstType: gstType || 'intra_state',
      notes,
      createdBy: req.user.id
    });

    // Update batch with purchase reference
    await Batch.updateMany(
      { _id: { $in: createdBatches } },
      { $set: { purchase: purchase._id } }
    );

    // Update vendor outstanding
    vendorDoc.totalPurchases += grandTotal;
    vendorDoc.outstandingBalance += grandTotal;
    await vendorDoc.save();

    // Add ledger entry
    await Ledger.addEntry({
      ledgerType: 'vendor',
      partyId: vendor,
      partyName: vendorDoc.name,
      partyCode: vendorDoc.code,
      date: new Date(),
      particulars: `Purchase - ${purchase.invoiceNumber}`,
      referenceNumber: purchase.invoiceNumber,
      referenceType: 'purchase',
      referenceId: purchase._id,
      credit: grandTotal
    });

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase summary
// @route   GET /api/v1/purchases/summary
// @access  Private
exports.getPurchaseSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { status: 'confirmed' };
    if (startDate && endDate) {
      matchQuery.purchaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$grandTotal' },
          totalGst: { $sum: '$totalGst' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balanceAmount' }
        }
      }
    ]);

    // Monthly trend
    const monthlyTrend = await Purchase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
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
          totalPurchases: 0,
          totalAmount: 0,
          totalGst: 0,
          totalPaid: 0,
          totalPending: 0
        },
        monthlyTrend
      }
    });
  } catch (error) {
    next(error);
  }
};
