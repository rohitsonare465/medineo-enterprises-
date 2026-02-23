/**
 * One-time migration: Fix Settings in MongoDB Atlas
 * Fixes state (Maharashtra → Madhya Pradesh) and GSTIN (masked → full)
 * 
 * Usage: node fix-settings.js
 */
const mongoose = require('mongoose');
const Settings = require('./src/models/Settings');

const ATLAS_URI = 'mongodb+srv://medineoenterprises_db_user:swAoqXYjruHhgn8U@medineoenterprises.98qohml.mongodb.net/medineo-erp';

async function fixSettings() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(ATLAS_URI);
        console.log('✅ Connected to Atlas');

        const settings = await Settings.findOne({});
        if (!settings) {
            console.log('❌ No settings found. Run seed-atlas.js first.');
            process.exit(1);
        }

        console.log('\n--- Current Values ---');
        console.log('GSTIN:', settings.gstin);
        console.log('Address State:', settings.address?.state);
        console.log('GST State Code:', settings.gstSettings?.stateCode);
        console.log('GST State Name:', settings.gstSettings?.stateName);

        // Fix GSTIN
        settings.gstin = '23HNCPM6815F1Z2';

        // Fix address
        if (!settings.address) settings.address = {};
        settings.address.street = 'Narmadapuram Rd, Danish Nagar';
        settings.address.city = 'Bhopal';
        settings.address.state = 'Madhya Pradesh';
        settings.address.pincode = '462026';
        settings.address.country = 'India';

        // Fix GST settings
        if (!settings.gstSettings) settings.gstSettings = {};
        settings.gstSettings.stateCode = '23';
        settings.gstSettings.stateName = 'Madhya Pradesh';
        settings.gstSettings.defaultGstRate = 12;

        // Fix contact info
        settings.phone = '7893818387';
        settings.email = 'medineoenterprises@gmail.com';

        await settings.save();

        console.log('\n--- Updated Values ---');
        console.log('GSTIN:', settings.gstin);
        console.log('Address State:', settings.address?.state);
        console.log('GST State Code:', settings.gstSettings?.stateCode);
        console.log('GST State Name:', settings.gstSettings?.stateName);
        console.log('\n✅ Settings fixed successfully!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

fixSettings();
