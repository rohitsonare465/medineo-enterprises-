const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Models
const User = require('./models/User');
const Settings = require('./models/Settings');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    // Clear existing data
    await User.deleteMany({});
    await Settings.deleteMany({});

    // Plain password - will be hashed by the User model's pre-save hook
    const plainPassword = 'Admin@123';

    const owner = await User.create({
      name: 'Admin Owner',
      email: 'admin@medineo.com',
      password: plainPassword,
      phone: '9876543210',
      role: 'owner',
      permissions: {
        canViewDashboard: true,
        canManagePurchases: true,
        canManageSales: true,
        canManageStock: true,
        canManagePayments: true,
        canViewReports: true,
        canManageUsers: true,
        canManageSettings: true
      }
    });

    console.log('Owner user created:', owner.email);

    // Create sample staff user
    await User.create({
      name: 'Staff User',
      email: 'staff@medineo.com',
      password: plainPassword,
      phone: '9876543211',
      role: 'staff',
      permissions: {
        canViewDashboard: true,
        canManagePurchases: true,
        canManageSales: true,
        canManageStock: true,
        canManagePayments: false,
        canViewReports: false,
        canManageUsers: false,
        canManageSettings: false
      }
    });

    console.log('Staff user created: staff@medineo.com');

    // Create accountant user
    await User.create({
      name: 'Accountant',
      email: 'accountant@medineo.com',
      password: plainPassword,
      phone: '9876543212',
      role: 'accountant',
      permissions: {
        canViewDashboard: true,
        canManagePurchases: false,
        canManageSales: false,
        canManageStock: false,
        canManagePayments: true,
        canViewReports: true,
        canManageUsers: false,
        canManageSettings: false
      }
    });

    console.log('Accountant user created: accountant@medineo.com');

    // Create company settings
    const settings = await Settings.create({
      companyName: 'Medineo Enterprises',
      companyTagline: 'Quality Healthcare Products',
      email: 'medineoenterprises@gmail.com',
      phone: '7893818387',
      address: {
        street: 'Narmadapuram Rd, Danish Nagar',
        city: 'Bhopal',
        state: 'Madhya Pradesh',
        pincode: '462026',
        country: 'India'
      },
      gstin: '23HNCPM6815F1Z2',
      panNumber: 'HNCPM6815F',
      invoiceSettings: {
        salePrefix: 'INV',
        purchasePrefix: 'PUR',
        receiptPrefix: 'REC',
        paymentPrefix: 'PAY',
        showBankDetails: true
      },
      gstSettings: {
        defaultGstRate: 12,
        stateCode: '23',
        stateName: 'Madhya Pradesh'
      },
      stockSettings: {
        lowStockThreshold: 50,
        expiryWarningDays: 90,
        enableBatchTracking: true,
        enableExpiryTracking: true
      }
    });

    console.log('Company settings created');
    console.log('\n===================================');
    console.log('Seed completed successfully!');
    console.log('===================================');
    console.log('\nLogin Credentials:');
    console.log('Owner: admin@medineo.com / Admin@123');
    console.log('Staff: staff@medineo.com / Admin@123');
    console.log('Accountant: accountant@medineo.com / Admin@123');
    console.log('===================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
