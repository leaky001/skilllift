const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use local MongoDB if no MONGO_URI is set
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift';
    
    if (!mongoUri) {
      console.log('⚠️  No MONGO_URI found, using local MongoDB');
      return;
    }
    
    console.log('🔗 Attempting to connect to MongoDB...');
    console.log(`📡 Connection string: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000, // Increased to 60s
      socketTimeoutMS: 120000, // Increased to 120s
      connectTimeoutMS: 60000, // Increased to 60s
      maxPoolSize: 20, // Increased pool size
      minPoolSize: 5, // Increased minimum connections
      maxIdleTimeMS: 120000, // Increased idle time to 120s
      retryWrites: true, // Enable retry writes
      retryReads: true, // Enable retry reads
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection ready: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // In production, exit the process if database connection fails
    if (process.env.NODE_ENV === 'production') {
      console.error('💥 Database connection failed in production. Exiting...');
      process.exit(1);
    } else {
      console.log('⚠️  Server will continue without database connection for testing purposes');
      console.log('💡 Make sure to set MONGO_URI environment variable');
    }
  }
};

module.exports = connectDB;
