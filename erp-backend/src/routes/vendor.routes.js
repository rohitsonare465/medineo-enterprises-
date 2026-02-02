const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getOutstandingSummary
} = require('../controllers/vendor.controller');
const { protect, authorize } = require('../middleware/auth');
const { vendorValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/outstanding', getOutstandingSummary);

router.route('/')
  .get(getVendors)
  .post(authorize('owner', 'staff'), vendorValidation, handleValidationErrors, createVendor);

router.route('/:id')
  .get(getVendor)
  .put(authorize('owner', 'staff'), updateVendor)
  .delete(authorize('owner'), deleteVendor);

module.exports = router;
