const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function debugMongoConnection() {
  console.log('🔍 MongoDB Connection Debug Analysis');
  console.log('=====================================');
  
  // 1. Check environment variables
  console.log('\n1. Environment Variables:');
  console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'Not set');
  
  if (process.env.MONGO_URI) {
    const mongoUri = process.env.MONGO_URI;
    console.log('   Connection type:', mongoUri.startsWith('mongodb+srv://') ? 'Atlas (SRV)' : 'Standard');
    console.log('   Hidden URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
  }
  
  // 2. Test DNS resolution
  console.log('\n2. DNS Resolution Test:');
  try {
    const dns = require('dns');
    const { promisify } = require('util');
    const resolveSrv = promisify(dns.resolveSrv);
    
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv://')) {
      const hostname = process.env.MONGO_URI.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^\/]+)/)[1];
      console.log('   Testing SRV resolution for:', hostname);
      
      try {
        const records = await resolveSrv(`_mongodb._tcp.${hostname}`);
        console.log('   ✅ SRV records found:', records.length);
        records.forEach((record, i) => {
          console.log(`     ${i + 1}. ${record.name}:${record.port} (priority: ${record.priority}, weight: ${record.weight})`);
        });
      } catch (dnsError) {
        console.log('   ❌ SRV resolution failed:', dnsError.message);
        console.log('   💡 This is the root cause of your connection issue!');
      }
    }
  } catch (error) {
    console.log('   ❌ DNS test failed:', error.message);
  }
  
  // 3. Test basic connectivity
  console.log('\n3. Basic Connectivity Test:');
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift';
    
    console.log('   Attempting connection with 5-second timeout...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });
    
    console.log('   ✅ Connection successful!');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    console.log('   Ready state:', conn.connection.readyState);
    
    await mongoose.disconnect();
    console.log('   🔌 Disconnected');
    
  } catch (error) {
    console.log('   ❌ Connection failed:', error.message);
    
    // Analyze the error
    if (error.message.includes('ESERVFAIL')) {
      console.log('   🔍 Error Analysis: DNS SRV record resolution failed');
      console.log('   💡 Solutions:');
      console.log('      1. Check your internet connection');
      console.log('      2. Try using a different DNS server (8.8.8.8, 1.1.1.1)');
      console.log('      3. Check if your firewall/VPN is blocking DNS queries');
      console.log('      4. Verify your MongoDB Atlas cluster is active');
      console.log('      5. Try using a non-SRV connection string');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   🔍 Error Analysis: Connection refused');
      console.log('   💡 Solutions:');
      console.log('      1. Install and start local MongoDB');
      console.log('      2. Check if MongoDB service is running');
      console.log('      3. Verify the connection string is correct');
    } else if (error.message.includes('authentication')) {
      console.log('   🔍 Error Analysis: Authentication failed');
      console.log('   💡 Solutions:');
      console.log('      1. Check username and password');
      console.log('      2. Verify database user permissions');
      console.log('      3. Check if user exists in Atlas');
    }
  }
  
  // 4. Alternative connection strings
  console.log('\n4. Alternative Connection Options:');
  if (process.env.MONGO_URI && process.env.MONGO_URI.includes('cluster0.7qtal7v.mongodb.net')) {
    console.log('   Try this non-SRV connection string:');
    console.log('   MONGO_URI=mongodb://lakybass19:abass200@cluster0-shard-00-00.7qtal7v.mongodb.net:27017,cluster0-shard-00-01.7qtal7v.mongodb.net:27017,cluster0-shard-00-02.7qtal7v.mongodb.net:27017/skilllift?ssl=true&replicaSet=atlas-1a2b3c-shard-0&authSource=admin&retryWrites=true&w=majority');
  }
  
  console.log('\n   Or use local MongoDB:');
  console.log('   MONGO_URI=mongodb://localhost:27017/skilllift');
  
  console.log('\n=====================================');
  console.log('🔍 Debug analysis complete');
}

debugMongoConnection().catch(console.error);

