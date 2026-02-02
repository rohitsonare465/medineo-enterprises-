const express = require('express');
const router = express.Router();
const {
  getSalesReport,
  getPurchaseReport,
  getGstReport,
  getProfitReport,
  getPaymentReport
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('owner', 'accountant'));

router.get('/sales', getSalesReport);
router.get('/purchases', getPurchaseReport);
router.get('/gst', getGstReport);
router.get('/profit', authorize('owner'), getProfitReport);
router.get('/payments', getPaymentReport);

module.exports = router;
