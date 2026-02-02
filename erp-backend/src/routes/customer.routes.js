const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  checkCreditLimit,
  getOutstandingSummary
} = require('../controllers/customer.controller');
const { protect, authorize } = require('../middleware/auth');
const { customerValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/outstanding', getOutstandingSummary);
router.get('/:id/credit-check', checkCreditLimit);

router.route('/')
  .get(getCustomers)
  .post(authorize('owner', 'staff'), customerValidation, handleValidationErrors, createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(authorize('owner', 'staff'), updateCustomer)
  .delete(authorize('owner'), deleteCustomer);

module.exports = router;
