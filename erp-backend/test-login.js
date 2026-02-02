const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/medineo_erp');
  
  const user = await User.findOne({ email: 'admin@medineo.com' }).select('+password');
  console.log('User found:', user ? 'Yes' : 'No');
  console.log('User email:', user?.email);
  console.log('User role:', user?.role);
  console.log('Password hash (first 30 chars):', user?.password?.substring(0, 30));
  
  // Test password comparison
  const testPassword = 'Admin@123';
  const isMatch = await bcrypt.compare(testPassword, user.password);
  console.log('Password match with Admin@123:', isMatch);
  
  // Also test the user's comparePassword method
  const isMatch2 = await user.comparePassword(testPassword);
  console.log('comparePassword method result:', isMatch2);
  
  await mongoose.disconnect();
  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
