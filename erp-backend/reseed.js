const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/medineo_erp';

async function reseed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Delete existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create owner - password will be hashed by User model pre-save hook
    const owner = await User.create({
      name: 'Admin Owner',
      email: 'admin@medineo.com',
      password: 'Admin@123',
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
    console.log('Created owner:', owner.email);
    
    // Create staff
    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@medineo.com',
      password: 'Admin@123',
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
    console.log('Created staff:', staff.email);
    
    // Create accountant
    const accountant = await User.create({
      name: 'Accountant',
      email: 'accountant@medineo.com',
      password: 'Admin@123',
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
    console.log('Created accountant:', accountant.email);
    
    console.log('\n✅ Users created successfully!');
    console.log('Login credentials:');
    console.log('  Owner: admin@medineo.com / Admin@123');
    console.log('  Staff: staff@medineo.com / Admin@123');
    console.log('  Accountant: accountant@medineo.com / Admin@123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

reseed();
