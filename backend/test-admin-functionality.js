const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Payment = require('./models/Payment');
const Transaction = require('./models/Transaction');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const testAdminFunctionality = async () => {
  await connectDB();
  
  console.log('🔍 Testing Admin Functionality...\n');
  
  try {
    // Test 1: Check if admin user exists
    console.log('1. Checking admin user...');
    const adminUser = await User.findOne({ email: 'admin@skilllift.com' });
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email, 'Role:', adminUser.role);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 2: Check pending courses
    console.log('\n2. Checking pending courses...');
    const pendingCourses = await Course.find({ status: 'pending' });
    console.log(`✅ Found ${pendingCourses.length} pending courses`);
    if (pendingCourses.length > 0) {
      console.log('Sample pending course:', pendingCourses[0].title);
    }
    
    // Test 3: Check all courses
    console.log('\n3. Checking all courses...');
    const allCourses = await Course.find();
    console.log(`✅ Found ${allCourses.length} total courses`);
    
    // Test 4: Check users
    console.log('\n4. Checking users...');
    const allUsers = await User.find();
    console.log(`✅ Found ${allUsers.length} total users`);
    const tutors = await User.find({ role: 'tutor' });
    console.log(`✅ Found ${tutors.length} tutors`);
    const learners = await User.find({ role: 'learner' });
    console.log(`✅ Found ${learners.length} learners`);
    
    // Test 5: Check payments/transactions
    console.log('\n5. Checking payments...');
    const payments = await Payment.find();
    console.log(`✅ Found ${payments.length} payments`);
    
    const transactions = await Transaction.find();
    console.log(`✅ Found ${transactions.length} transactions`);
    
    // Test 6: Check if we need to create sample data
    console.log('\n6. Sample data analysis...');
    if (pendingCourses.length === 0) {
      console.log('⚠️  No pending courses found - may need sample data');
    }
    if (allCourses.length === 0) {
      console.log('⚠️  No courses found - may need sample data');
    }
    if (tutors.length === 0) {
      console.log('⚠️  No tutors found - may need sample data');
    }
    
    console.log('\n✅ Admin functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing admin functionality:', error);
  } finally {
    mongoose.connection.close();
  }
};

testAdminFunctionality();
