const express = require('express');
const router = express.Router();
const {
  getStockOverview,
  getLowStockItems,
  getOutOfStockItems,
  getStockSummary,
  getExpiryAlerts
} = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', getStockOverview);
router.get('/low', getLowStockItems);
router.get('/out-of-stock', getOutOfStockItems);
router.get('/expiry-alerts', getExpiryAlerts);
router.get('/summary', getStockSummary);

module.exports = router;
