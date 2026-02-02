const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getCompanyInfo
} = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth');

// Public route for company info
router.get('/company', getCompanyInfo);

// Protected routes
router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorize('owner'), updateSettings);

module.exports = router;
