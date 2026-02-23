/**
 * Seed admin user to MongoDB Atlas (Production)
 * Usage: node seed-atlas.js
 */
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Settings = require('./src/models/Settings');

const ATLAS_URI = 'mongodb+srv://medineoenterprises_db_user:swAoqXYjruHhgn8U@medineoenterprises.98qohml.mongodb.net/medineo-erp';

async function seedAtlas() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@medineo.com' });
    if (existingAdmin) {
      console.log('Admin user already exists, deleting and re-creating...');
      await User.deleteOne({ email: 'admin@medineo.com' });
    }

    // Create owner - password will be hashed by User model pre-save hook
    const owner = await User.create({
      name: 'Admin Owner',
      email: 'admin@medineo.com',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'owner',
      isActive: true
    });
    console.log('✅ Owner created:', owner.email);

    // Check if staff user exists
    const existingStaff = await User.findOne({ email: 'staff@medineo.com' });
    if (!existingStaff) {
      await User.create({
        name: 'Staff User',
        email: 'staff@medineo.com',
        password: 'Admin@123',
        phone: '9876543211',
        role: 'staff',
        isActive: true
      });
      console.log('✅ Staff user created: staff@medineo.com');
    }

    // Check if accountant user exists
    const existingAccountant = await User.findOne({ email: 'accountant@medineo.com' });
    if (!existingAccountant) {
      await User.create({
        name: 'Accountant',
        email: 'accountant@medineo.com',
        password: 'Admin@123',
        phone: '9876543212',
        role: 'accountant',
        isActive: true
      });
      console.log('✅ Accountant user created: accountant@medineo.com');
    }

    // Seed default settings if not exists
    const existingSettings = await Settings.findOne({});
    if (!existingSettings) {
      await Settings.create({
        companyName: 'Medineo Enterprises',
        address: {
          street: 'Narmadapuram Rd, Danish Nagar',
          city: 'Bhopal',
          state: 'Madhya Pradesh',
          pincode: '462026',
          country: 'India'
        },
        phone: '7893818387',
        email: 'medineoenterprises@gmail.com',
        gstin: '23HNCPM6815F1Z2',
        gstSettings: {
          defaultGstRate: 12,
          stateCode: '23',
          stateName: 'Madhya Pradesh'
        }
      });
      console.log('✅ Default settings created');
    }

    // Verify login works
    const testUser = await User.findOne({ email: 'admin@medineo.com' }).select('+password');
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare('Admin@123', testUser.password);
    console.log('\n🔐 Login verification:', isMatch ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 Atlas seeding complete!');
    console.log('Login credentials:');
    console.log('  Email: admin@medineo.com');
    console.log('  Password: Admin@123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAtlas();
