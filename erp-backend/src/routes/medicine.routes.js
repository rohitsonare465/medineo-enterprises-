const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  searchForBilling
} = require('../controllers/medicine.controller');
const { protect, authorize } = require('../middleware/auth');
const { medicineValidation, handleValidationErrors } = require('../middleware/validation');

router.use(protect);

router.get('/billing', searchForBilling);

router.route('/')
  .get(getMedicines)
  .post(authorize('owner', 'staff'), medicineValidation, handleValidationErrors, createMedicine);

router.route('/:id')
  .get(getMedicine)
  .put(authorize('owner', 'staff'), updateMedicine)
  .delete(authorize('owner'), deleteMedicine);

module.exports = router;
