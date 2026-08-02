const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const { PAGINATION } = require('../config/constants');

// @desc    Get all medicines
// @route   GET /api/v1/medicines
// @access  Private
exports.getMedicines = async (req, res, next) => {
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
        { brand: searchRegex },
        { manufacturer: searchRegex },
        { genericName: searchRegex }
      ];
    }
    
    // Default to active medicines unless explicitly set
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.brand) {
      query.brand = new RegExp(req.query.brand, 'i');
    }
    
    if (req.query.manufacturer) {
      query.manufacturer = new RegExp(req.query.manufacturer, 'i');
    }
    
    if (req.query.lowStock === 'true') {
      query.$expr = { $lt: ['$currentStock', '$minStockLevel'] };
    }

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Medicine.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine
// @route   GET /api/v1/medicines/:id
// @access  Private
exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Get batches for this medicine
    const batches = await Batch.find({ medicine: medicine._id, quantity: { $gt: 0 } })
      .sort({ expiryDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...medicine.toObject(),
        batches
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create medicine
// @route   POST /api/v1/medicines
// @access  Private
exports.createMedicine = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const medicine = await Medicine.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/v1/medicines/:id
// @access  Private
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/v1/medicines/:id
// @access  Private
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check if medicine has stock
    if (medicine.currentStock > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete medicine with existing stock'
      });
    }

    await medicine.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine categories
// @route   GET /api/v1/medicines/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Medicine.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine brands
// @route   GET /api/v1/medicines/brands
// @access  Private
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Medicine.distinct('brand');
    
    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine manufacturers
// @route   GET /api/v1/medicines/manufacturers
// @access  Private
exports.getManufacturers = async (req, res, next) => {
  try {
    const manufacturers = await Medicine.distinct('manufacturer');
    
    res.status(200).json({
      success: true,
      data: manufacturers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search medicines for billing
// @route   GET /api/v1/medicines/search/billing
// @access  Private
exports.searchForBilling = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Match medicines by text only. We intentionally do NOT gate on the cached
    // `currentStock` field here: it can be stale (it is not refreshed when a
    // batch silently crosses its expiry date), which caused medicines to show
    // up in billing with "no available batches". Availability is decided below
    // from the actual batches.
    const medicines = await Medicine.find({
      isActive: true,
      $or: [
        { name: new RegExp(q, 'i') },
        { code: new RegExp(q, 'i') },
        { genericName: new RegExp(q, 'i') }
      ]
    })
    .limit(50)
    .lean();

    // Get available batches for each medicine. Availability is based on the
    // live `expiryDate` comparison (not the stored `isExpired` flag, which goes
    // stale) plus quantity > 0. A missing expiry date is treated as valid.
    const medicineIds = medicines.map(m => m._id);
    const batches = await Batch.find({
      medicine: { $in: medicineIds },
      quantity: { $gt: 0 },
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null },
        { expiryDate: { $exists: false } }
      ]
    })
    .sort({ expiryDate: 1 })
    .lean();

    // Group batches by medicine
    const batchesByMedicine = batches.reduce((acc, batch) => {
      const key = batch.medicine.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(batch);
      return acc;
    }, {});

    // Only return medicines that actually have sellable batches, and report
    // their real available stock so the UI and billing always agree.
    const result = medicines
      .filter(medicine => batchesByMedicine[medicine._id.toString()]?.length)
      .map(medicine => {
        const medicineBatches = batchesByMedicine[medicine._id.toString()];
        return {
          ...medicine,
          currentStock: medicineBatches.reduce((sum, b) => sum + b.quantity, 0),
          batches: medicineBatches
        };
      });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
