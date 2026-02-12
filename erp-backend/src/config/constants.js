module.exports = {
  // User Roles
  ROLES: {
    OWNER: 'owner',
    STAFF: 'staff',
    ACCOUNTANT: 'accountant'
  },

  // Permission Matrix
  PERMISSIONS: {
    owner: [
      'dashboard:view',
      'dashboard:financial',
      'vendors:view', 'vendors:create', 'vendors:edit', 'vendors:delete',
      'customers:view', 'customers:create', 'customers:edit', 'customers:delete',
      'medicines:view', 'medicines:create', 'medicines:edit', 'medicines:delete',
      'batches:view', 'batches:create', 'batches:edit', 'batches:delete',
      'purchases:view', 'purchases:create', 'purchases:edit', 'purchases:delete',
      'sales:view', 'sales:create', 'sales:edit', 'sales:delete',
      'payments:view', 'payments:create', 'payments:edit', 'payments:delete',
      'ledger:view', 'ledger:customer', 'ledger:vendor',
      'stock:view', 'stock:adjust',
      'reports:view', 'reports:profit', 'reports:gst',
      'inquiries:view', 'inquiries:manage',
      'expenses:view', 'expenses:create', 'expenses:edit', 'expenses:delete',
      'settings:view', 'settings:edit',
      'users:view', 'users:create', 'users:edit', 'users:delete'
    ],
    staff: [
      'dashboard:view',
      'vendors:view',
      'customers:view', 'customers:create', 'customers:edit',
      'medicines:view',
      'batches:view',
      'purchases:view', 'purchases:create',
      'sales:view', 'sales:create',
      'payments:view', 'payments:create',
      'stock:view',
      'inquiries:view', 'inquiries:manage'
    ],
    accountant: [
      'dashboard:view',
      'dashboard:financial',
      'vendors:view',
      'customers:view',
      'medicines:view',
      'batches:view',
      'purchases:view',
      'sales:view',
      'payments:view', 'payments:create', 'payments:edit',
      'ledger:view', 'ledger:customer', 'ledger:vendor',
      'expenses:view', 'expenses:create', 'expenses:edit',
      'stock:view',
      'reports:view', 'reports:gst'
    ]
  },

  // GST Rates for Medicines in India
  GST_RATES: {
    ZERO: 0,
    FIVE: 5,
    TWELVE: 12,
    EIGHTEEN: 18,
    TWENTY_EIGHT: 28
  },

  // Medicine Categories
  MEDICINE_CATEGORIES: [
    'Tablets',
    'Capsules',
    'Syrups',
    'Injections',
    'Ointments',
    'Drops',
    'Powders',
    'Surgical',
    'Equipment',
    'Consumables',
    'Others'
  ],

  // Payment Modes
  PAYMENT_MODES: [
    'Cash',
    'Bank Transfer',
    'RTGS/NEFT',
    'UPI',
    'Cheque',
    'Credit Note'
  ],

  // Payment Types
  PAYMENT_TYPES: {
    CUSTOMER_RECEIPT: 'customer_receipt',
    VENDOR_PAYMENT: 'vendor_payment'
  },

  // Invoice Prefixes
  INVOICE_PREFIXES: {
    SALE: 'MED/INV',
    PURCHASE: 'MED/PUR',
    PAYMENT: 'MED/PAY',
    RECEIPT: 'MED/REC',
    CREDIT_NOTE: 'MED/CN',
    DEBIT_NOTE: 'MED/DN',
    EXPENSE: 'MED/EXP'
  },

  // Stock Alert Thresholds
  STOCK_ALERTS: {
    LOW_STOCK_THRESHOLD: 50,
    EXPIRY_WARNING_DAYS: [30, 60, 90]
  },

  // Inquiry Status
  INQUIRY_STATUS: {
    NEW: 'new',
    CONTACTED: 'contacted',
    CONVERTED: 'converted',
    CLOSED: 'closed'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  }
};
