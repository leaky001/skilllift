const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testLocalMongo() {
  try {
    console.log('🔗 Testing Local MongoDB connection...');
    console.log('📡 MONGO_URI from .env:', process.env.MONGO_URI);
    
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.error('❌ No MONGO_URI found in environment');
      return;
    }
    
    console.log('📡 Connection string:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📊 Ready State: ${conn.connection.readyState}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Start MongoDB locally');
      console.log('1. Install MongoDB Community Server');
      console.log('2. Start MongoDB service: net start MongoDB');
      console.log('3. Or use: mongod --dbpath C:\\data\\db');
    }
    
    process.exit(1);
  }
}

testLocalMongo();
