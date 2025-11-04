const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabaseIndex() {
  try {
    console.log('🔍 Fixing database index issue...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('liveclasssessions');
    
    // List all indexes
    console.log('🔍 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log('- Index:', index.name, 'Keys:', index.key);
    });
    
    // Check if roomId_1 index exists
    const roomIdIndex = indexes.find(index => index.name === 'roomId_1');
    if (roomIdIndex) {
      console.log('❌ Found problematic roomId_1 index');
      console.log('🔧 Dropping roomId_1 index...');
      await collection.dropIndex('roomId_1');
      console.log('✅ Dropped roomId_1 index');
    } else {
      console.log('✅ No roomId_1 index found');
    }
    
    // List indexes again to confirm
    console.log('🔍 Updated indexes:');
    const updatedIndexes = await collection.indexes();
    updatedIndexes.forEach(index => {
      console.log('- Index:', index.name, 'Keys:', index.key);
    });
    
    // Check for any documents with null roomId
    const nullRoomIdDocs = await collection.find({ roomId: null }).limit(5);
    console.log('🔍 Documents with null roomId:', await nullRoomIdDocs.toArray());
    
    // Remove roomId field from all documents if it exists
    console.log('🔧 Removing roomId field from all documents...');
    const result = await collection.updateMany(
      { roomId: { $exists: true } },
      { $unset: { roomId: 1 } }
    );
    console.log('✅ Removed roomId field from', result.modifiedCount, 'documents');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixDatabaseIndex();
