// Export all models
const User = require('./User');
const Vendor = require('./Vendor');
const Customer = require('./Customer');
const Medicine = require('./Medicine');
const Batch = require('./Batch');
const Purchase = require('./Purchase');
const Sale = require('./Sale');
const Payment = require('./Payment');
const Ledger = require('./Ledger');
const Inquiry = require('./Inquiry');
const Settings = require('./Settings');
const Counter = require('./Counter');

module.exports = {
  User,
  Vendor,
  Customer,
  Medicine,
  Batch,
  Purchase,
  Sale,
  Payment,
  Ledger,
  Inquiry,
  Settings,
  Counter
};
