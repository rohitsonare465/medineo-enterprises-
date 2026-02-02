const { validationResult, body, param, query } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== VALIDATION ERRORS ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Errors:', JSON.stringify(errors.array(), null, 2));
    console.log('=========================');
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth Validations
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['owner', 'staff', 'accountant'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

// Vendor Validations
const vendorValidation = [
  body('name').trim().notEmpty().withMessage('Vendor name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('gstin')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format'),
  handleValidationErrors
];

// Customer Validations
const customerValidation = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('drugLicenseNo').trim().notEmpty().withMessage('Drug license number is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('gstin')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format'),
  handleValidationErrors
];

// Medicine Validations
const medicineValidation = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('packSize').trim().notEmpty().withMessage('Pack size is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('gstRate')
    .isIn([0, 5, 12, 18, 28])
    .withMessage('GST rate must be 0, 5, 12, 18, or 28'),
  handleValidationErrors
];

// Purchase Validations
const purchaseValidation = [
  body('vendor').isMongoId().withMessage('Valid vendor ID is required'),
  body('vendorInvoiceNumber').trim().notEmpty().withMessage('Vendor invoice number is required'),
  body('vendorInvoiceDate').isISO8601().withMessage('Valid vendor invoice date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine').isMongoId().withMessage('Valid medicine ID is required'),
  body('items.*.batchNumber').trim().notEmpty().withMessage('Batch number is required'),
  body('items.*.expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price is required'),
  body('items.*.mrp').isFloat({ min: 0 }).withMessage('MRP is required'),
  handleValidationErrors
];

// Sale Validations
const saleValidation = [
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine').isMongoId().withMessage('Valid medicine ID is required'),
  body('items.*.batch').isMongoId().withMessage('Valid batch ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

// Payment Validations (generic - requires paymentType)
const paymentValidation = [
  body('paymentType')
    .isIn(['customer_receipt', 'vendor_payment'])
    .withMessage('Valid payment type is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .isIn(['Cash', 'Bank Transfer', 'RTGS/NEFT', 'UPI', 'Cheque', 'Credit Note'])
    .withMessage('Valid payment mode is required'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid payment date is required')
];

// Customer Receipt Validation (no paymentType required - set by controller)
const customerReceiptValidation = [
  body('customer').isMongoId().withMessage('Valid customer ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .isIn(['Cash', 'Bank Transfer', 'RTGS/NEFT', 'UPI', 'Cheque', 'Credit Note'])
    .withMessage('Valid payment mode is required'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid payment date is required')
];

// Vendor Payment Validation (no paymentType required - set by controller)
const vendorPaymentValidation = [
  body('vendor').isMongoId().withMessage('Valid vendor ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMode')
    .isIn(['Cash', 'Bank Transfer', 'RTGS/NEFT', 'UPI', 'Cheque', 'Credit Note'])
    .withMessage('Valid payment mode is required'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Valid payment date is required')
];

// MongoDB ID validation
const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  loginValidation,
  registerValidation,
  vendorValidation,
  customerValidation,
  medicineValidation,
  purchaseValidation,
  saleValidation,
  paymentValidation,
  customerReceiptValidation,
  vendorPaymentValidation,
  mongoIdValidation,
  paginationValidation
};
