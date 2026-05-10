const express = require('express');
const router = express.Router();
const {
  generateCreditNote,
  getCreditNotes,
  getCreditNote
} = require('../controllers/creditNote.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCreditNotes)
  .post(authorize('owner', 'staff'), generateCreditNote);

router.route('/:id')
  .get(getCreditNote);

module.exports = router;
