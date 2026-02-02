const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  getSaleSummary
} = require('../controllers/sale.controller');
const { protect, authorize } = require('../middleware/auth');
const { saleValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/summary', getSaleSummary);

router.route('/')
  .get(getSales)
  .post(authorize('owner', 'staff'), saleValidation, handleValidationErrors, createSale);

router.route('/:id')
  .get(getSale);

module.exports = router;
