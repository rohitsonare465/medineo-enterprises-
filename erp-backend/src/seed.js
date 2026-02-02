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
      email: 'info@medineo.com',
      phone: '022-12345678',
      mobile: '9876543210',
      address: {
        street: '123, Healthcare Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      gstNumber: '27AABCM1234A1ZH',
      drugLicenseNumber: 'MH-MUM-123456',
      foodLicenseNumber: 'FSSAI-12345678901234',
      panNumber: 'AABCM1234A',
      invoicePrefix: {
        sale: 'MED',
        purchase: 'PUR',
        payment: 'PAY',
        receipt: 'REC'
      },
      gst: {
        enabled: true,
        defaultRate: 12
      },
      stock: {
        lowStockThreshold: 50,
        expiryAlertDays: 90
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
