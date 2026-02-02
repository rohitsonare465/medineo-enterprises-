const authRoutes = require('./auth.routes');
const vendorRoutes = require('./vendor.routes');
const customerRoutes = require('./customer.routes');
const medicineRoutes = require('./medicine.routes');
const batchRoutes = require('./batch.routes');
const purchaseRoutes = require('./purchase.routes');
const saleRoutes = require('./sale.routes');
const paymentRoutes = require('./payment.routes');
const stockRoutes = require('./stock.routes');
const ledgerRoutes = require('./ledger.routes');
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
const inquiryRoutes = require('./inquiry.routes');
const settingsRoutes = require('./settings.routes');

module.exports = {
  authRoutes,
  vendorRoutes,
  customerRoutes,
  medicineRoutes,
  batchRoutes,
  purchaseRoutes,
  saleRoutes,
  paymentRoutes,
  stockRoutes,
  ledgerRoutes,
  dashboardRoutes,
  reportRoutes,
  inquiryRoutes,
  settingsRoutes
};
