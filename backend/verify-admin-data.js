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

const verifyAdminData = async () => {
  await connectDB();
  
  console.log('🔍 Verifying admin data and functionality...\n');
  
  try {
    // Check admin user
    const admin = await User.findOne({ email: 'admin@skilllift.com' });
    if (admin) {
      console.log('✅ Admin user exists:', admin.email, 'Role:', admin.role);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Check users
    const totalUsers = await User.countDocuments();
    const tutors = await User.countDocuments({ role: 'tutor' });
    const learners = await User.countDocuments({ role: 'learner' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    console.log(`\n👥 User Statistics:`);
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Admins: ${admins}`);
    console.log(`- Tutors: ${tutors}`);
    console.log(`- Learners: ${learners}`);
    
    // Check courses
    const totalCourses = await Course.countDocuments();
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const rejectedCourses = await Course.countDocuments({ status: 'rejected' });
    
    console.log(`\n📚 Course Statistics:`);
    console.log(`- Total courses: ${totalCourses}`);
    console.log(`- Pending courses: ${pendingCourses}`);
    console.log(`- Published courses: ${publishedCourses}`);
    console.log(`- Rejected courses: ${rejectedCourses}`);
    
    // Check transactions
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    
    console.log(`\n💰 Transaction Statistics:`);
    console.log(`- Total transactions: ${totalTransactions}`);
    console.log(`- Completed transactions: ${completedTransactions}`);
    console.log(`- Pending transactions: ${pendingTransactions}`);
    
    // Check payments
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'successful' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    
    console.log(`\n💳 Payment Statistics:`);
    console.log(`- Total payments: ${totalPayments}`);
    console.log(`- Successful payments: ${successfulPayments}`);
    console.log(`- Failed payments: ${failedPayments}`);
    
    // Show sample data
    console.log(`\n📋 Sample Data:`);
    
    if (pendingCourses > 0) {
      const samplePendingCourse = await Course.findOne({ status: 'pending' }).populate('tutor', 'name email');
      console.log(`- Sample pending course: "${samplePendingCourse.title}" by ${samplePendingCourse.tutor.name}`);
    }
    
    if (publishedCourses > 0) {
      const samplePublishedCourse = await Course.findOne({ status: 'published' }).populate('tutor', 'name email');
      console.log(`- Sample published course: "${samplePublishedCourse.title}" by ${samplePublishedCourse.tutor.name}`);
    }
    
    if (tutors > 0) {
      const sampleTutor = await User.findOne({ role: 'tutor' });
      console.log(`- Sample tutor: ${sampleTutor.name} (${sampleTutor.email})`);
    }
    
    if (learners > 0) {
      const sampleLearner = await User.findOne({ role: 'learner' });
      console.log(`- Sample learner: ${sampleLearner.name} (${sampleLearner.email})`);
    }
    
    console.log(`\n🎯 Admin Functionality Status:`);
    
    if (admin && pendingCourses > 0) {
      console.log('✅ Course approval functionality: READY');
    } else {
      console.log('⚠️  Course approval functionality: NEEDS DATA');
    }
    
    if (admin && totalUsers > 1) {
      console.log('✅ User management functionality: READY');
    } else {
      console.log('⚠️  User management functionality: NEEDS DATA');
    }
    
    if (totalTransactions > 0) {
      console.log('✅ Payment management functionality: READY');
    } else {
      console.log('⚠️  Payment management functionality: NEEDS DATA');
    }
    
    if (admin && totalCourses > 0) {
      console.log('✅ Course management functionality: READY');
    } else {
      console.log('⚠️  Course management functionality: NEEDS DATA');
    }
    
    console.log(`\n🔑 Login Credentials:`);
    console.log('Admin: admin@skilllift.com / admin123');
    
    if (tutors > 0) {
      const tutor = await User.findOne({ role: 'tutor' });
      console.log(`Tutor: ${tutor.email} / tutor123`);
    }
    
    if (learners > 0) {
      const learner = await User.findOne({ role: 'learner' });
      console.log(`Learner: ${learner.email} / learner123`);
    }
    
    console.log(`\n✅ Verification completed!`);
    
  } catch (error) {
    console.error('❌ Error verifying admin data:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyAdminData();
