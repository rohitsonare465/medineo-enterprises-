const express = require('express');
const router = express.Router();
const {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  addFollowUp,
  convertToCustomer,
  getInquiryStats
} = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middleware/auth');

// Public route for website inquiries
router.post('/', createInquiry);

// Protected routes
router.use(protect);

router.get('/stats', getInquiryStats);

router.route('/')
  .get(getInquiries);

router.route('/:id')
  .get(getInquiry)
  .put(updateInquiry)
  .delete(authorize('owner'), deleteInquiry);

router.post('/:id/followup', addFollowUp);
router.post('/:id/convert', authorize('owner', 'staff'), convertToCustomer);

module.exports = router;
