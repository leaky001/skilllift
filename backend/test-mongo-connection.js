const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    console.log('📡 Connection string:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📊 Ready State: ${conn.connection.readyState}`);
    
    // Test a simple query
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`👥 Total users in database: ${userCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('whitelist')) {
      console.log('\n💡 Solution: Add your IP to MongoDB Atlas Network Access List');
      console.log('1. Go to: https://cloud.mongodb.com/');
      console.log('2. Click "Network Access"');
      console.log('3. Add IP: 0.0.0.0/0 (allows all IPs)');
      console.log('4. Wait 2-3 minutes for changes to take effect');
    }
    
    process.exit(1);
  }
}

testMongoConnection();
