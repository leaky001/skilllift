const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Centralized MongoDB connection utility
 * Use this for all scripts and utilities to ensure consistency
 */
const connectToDatabase = async (options = {}) => {
  try {
    // Use the same connection logic as the main app
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift';
    
    // Default connection options
    const defaultOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10, // Smaller pool for scripts
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
    };
    
    // Merge with provided options
    const connectionOptions = { ...defaultOptions, ...options };
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📡 Database: ${mongoUri.split('/').pop()}`);
    
    const conn = await mongoose.connect(mongoUri, connectionOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error(`❌ Error disconnecting from MongoDB: ${error.message}`);
  }
};

/**
 * Check if MongoDB is connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  return {
    state: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  isConnected,
  getConnectionStatus
};
