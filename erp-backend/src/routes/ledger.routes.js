const express = require('express');
const router = express.Router();
const {
  getCustomerLedger,
  getVendorLedger,
  getCustomersOutstanding,
  getVendorsPayables
} = require('../controllers/ledger.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/customer/:customerId', getCustomerLedger);
router.get('/vendor/:vendorId', getVendorLedger);
router.get('/customers-outstanding', authorize('owner', 'accountant'), getCustomersOutstanding);
router.get('/vendors-payables', authorize('owner', 'accountant'), getVendorsPayables);

module.exports = router;
