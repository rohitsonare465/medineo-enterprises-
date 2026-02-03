/**
 * MongoDB Migration Script
 * Migrates all collections from local MongoDB to MongoDB Atlas
 * 
 * Usage: node migrate-to-atlas.js
 */

const mongoose = require('mongoose');

// Connection strings
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/medineo_erp';
const ATLAS_MONGODB_URI = 'mongodb+srv://medineoenterprises_db_user:swAoqXYjruHhgn8U@medineoenterprises.98qohml.mongodb.net/medineo_erp';

// All collections to migrate
const COLLECTIONS = [
  'users',
  'settings',
  'vendors',
  'customers',
  'medicines',
  'batches',
  'purchases',
  'sales',
  'payments',
  'ledgers',
  'inquiries',
  'counters'
];

async function migrateData() {
  let localConnection = null;
  let atlasConnection = null;

  try {
    console.log('🚀 Starting MongoDB Migration...\n');

    // Connect to local MongoDB
    console.log('📍 Connecting to LOCAL MongoDB...');
    localConnection = await mongoose.createConnection(LOCAL_MONGODB_URI).asPromise();
    console.log('✅ Connected to LOCAL MongoDB\n');

    // Connect to Atlas MongoDB
    console.log('☁️  Connecting to ATLAS MongoDB...');
    atlasConnection = await mongoose.createConnection(ATLAS_MONGODB_URI).asPromise();
    console.log('✅ Connected to ATLAS MongoDB\n');

    console.log('=' .repeat(50));
    console.log('Starting data migration...');
    console.log('=' .repeat(50) + '\n');

    let totalDocuments = 0;
    let migratedCollections = 0;

    for (const collectionName of COLLECTIONS) {
      try {
        // Get local collection
        const localCollection = localConnection.collection(collectionName);
        
        // Check if collection exists and has data
        const count = await localCollection.countDocuments();
        
        if (count === 0) {
          console.log(`⏭️  ${collectionName}: No documents found, skipping...`);
          continue;
        }

        console.log(`📦 Migrating ${collectionName}... (${count} documents)`);

        // Fetch all documents from local
        const documents = await localCollection.find({}).toArray();

        // Get or create atlas collection
        const atlasCollection = atlasConnection.collection(collectionName);

        // Clear existing data in Atlas collection (optional - comment out if you want to append)
        await atlasCollection.deleteMany({});

        // Insert documents to Atlas
        if (documents.length > 0) {
          await atlasCollection.insertMany(documents);
          totalDocuments += documents.length;
          migratedCollections++;
          console.log(`✅ ${collectionName}: ${documents.length} documents migrated successfully`);
        }

      } catch (err) {
        if (err.codeName === 'NamespaceNotFound') {
          console.log(`⏭️  ${collectionName}: Collection doesn't exist, skipping...`);
        } else {
          console.error(`❌ Error migrating ${collectionName}:`, err.message);
        }
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Collections migrated: ${migratedCollections}`);
    console.log(`📄 Total documents: ${totalDocuments}`);
    console.log('=' .repeat(50));
    console.log('\n🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close connections
    if (localConnection) {
      await localConnection.close();
      console.log('📍 Local connection closed');
    }
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('☁️  Atlas connection closed');
    }
    process.exit(0);
  }
}

// Run migration
migrateData();
