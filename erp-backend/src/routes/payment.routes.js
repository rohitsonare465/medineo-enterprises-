const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPayment,
  createCustomerReceipt,
  createVendorPayment,
  getPaymentSummary
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');
const { customerReceiptValidation, vendorPaymentValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/summary', getPaymentSummary);

router.route('/')
  .get(getPayments);

router.route('/:id')
  .get(getPayment);

router.post('/customer-receipt', authorize('owner', 'staff', 'accountant'), customerReceiptValidation, handleValidationErrors, createCustomerReceipt);
router.post('/vendor-payment', authorize('owner', 'accountant'), vendorPaymentValidation, handleValidationErrors, createVendorPayment);

module.exports = router;

