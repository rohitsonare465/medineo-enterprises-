const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private (Owner only)
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.updateSettings(req.body);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company info (public)
// @route   GET /api/v1/settings/company
// @access  Public
exports.getCompanyInfo = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        companyName: settings.companyName,
        companyTagline: settings.companyTagline,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        website: settings.website
      }
    });
  } catch (error) {
    next(error);
  }
};
