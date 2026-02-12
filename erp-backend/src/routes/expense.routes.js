const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expense.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Summary must be before /:id route
router.get('/summary', getExpenseSummary);

router.route('/')
  .get(getExpenses)
  .post(authorize('owner', 'accountant'), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(authorize('owner', 'accountant'), updateExpense)
  .delete(authorize('owner'), deleteExpense);

module.exports = router;
