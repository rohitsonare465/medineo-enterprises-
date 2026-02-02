const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatch,
  getAvailableBatches,
  getExpiringBatches,
  getExpiredBatches,
  adjustQuantity
} = require('../controllers/batch.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/expiring', getExpiringBatches);
router.get('/expired', getExpiredBatches);
router.get('/available/:medicineId', getAvailableBatches);

router.route('/')
  .get(getBatches);

router.route('/:id')
  .get(getBatch);

router.post('/:id/adjust', authorize('owner'), adjustQuantity);

module.exports = router;
