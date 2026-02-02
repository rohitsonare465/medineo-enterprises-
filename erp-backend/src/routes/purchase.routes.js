const express = require('express');
const router = express.Router();
const {
  getPurchases,
  getPurchase,
  createPurchase,
  getPurchaseSummary
} = require('../controllers/purchase.controller');
const { protect, authorize } = require('../middleware/auth');
const { purchaseValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/summary', getPurchaseSummary);

router.route('/')
  .get(getPurchases)
  .post(authorize('owner', 'staff'), purchaseValidation, handleValidationErrors, createPurchase);

router.route('/:id')
  .get(getPurchase);

module.exports = router;
