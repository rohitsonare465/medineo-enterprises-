const connectDB = require('../src/config/database');
const mongoose = require('mongoose');

async function main() {
  await connectDB();

  const Medicine = require('../src/models/Medicine');

  try {
    const medicines = await Medicine.find().select('_id name code');
    console.log(`Found ${medicines.length} medicines`);

    for (const m of medicines) {
      try {
        const doc = await Medicine.findById(m._id);
        await doc.updateStockFromBatches();
        console.log(`Updated stock for ${m.code} (${m.name}): ${doc.currentStock}`);
      } catch (err) {
        console.error(`Failed to update ${m._id}:`, err.message);
      }
    }

    console.log('Recalculation complete');
  } catch (error) {
    console.error('Error during recalculation:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
