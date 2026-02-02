const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesChart,
  getTopCustomers,
  getTopMedicines
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDashboardStats);
router.get('/sales-chart', getSalesChart);
router.get('/top-customers', getTopCustomers);
router.get('/top-medicines', getTopMedicines);

module.exports = router;
