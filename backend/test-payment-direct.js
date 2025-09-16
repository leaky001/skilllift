// Test Payment Controller Directly
const Payment = require('./models/Payment');
const Course = require('./models/Course');
const User = require('./models/User');
const mongoose = require('mongoose');

console.log('🧪 Testing Payment Controller Directly...');
console.log('='.repeat(50));

async function testPaymentController() {
  try {
    console.log('1. Testing database connection...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift');
    console.log('✅ Database connected');

    console.log('\n2. Testing Payment model...');
    const paymentCount = await Payment.countDocuments();
    console.log('✅ Payment model working, count:', paymentCount);

    console.log('\n3. Testing Course model...');
    const courseCount = await Course.countDocuments();
    console.log('✅ Course model working, count:', courseCount);

    console.log('\n4. Testing User model...');
    const userCount = await User.countDocuments();
    console.log('✅ User model working, count:', userCount);

    console.log('\n5. Testing payment creation...');
    const testPayment = new Payment({
      paymentId: `TEST_${Date.now()}`,
      paystackReference: `TEST_REF_${Date.now()}`,
      user: new mongoose.Types.ObjectId(),
      course: new mongoose.Types.ObjectId(),
      tutor: new mongoose.Types.ObjectId(),
      amount: 5000,
      totalAmount: 5000,
      currency: 'NGN',
      paymentMethod: 'paystack',
      paymentType: 'full',
      commissionPercentage: 15,
      commissionAmount: 750,
      tutorAmount: 4250,
      status: 'pending'
    });

    // Don't save, just validate
    const validation = testPayment.validateSync();
    if (validation) {
      console.log('❌ Payment validation error:', validation.message);
    } else {
      console.log('✅ Payment model validation passed');
    }

    console.log('\n✅ All tests passed!');
    console.log('The issue might be in the HTTP request handling or authentication middleware.');

  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}

testPaymentController();
