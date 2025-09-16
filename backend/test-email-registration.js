const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testEmailRegistration() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check email configuration
    console.log('\n📧 EMAIL CONFIGURATION CHECK:');
    console.log('='.repeat(50));
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'NOT SET'}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET'}`);
    console.log(`SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || 'NOT SET'}`);
    console.log('='.repeat(50));

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n⚠️ EMAIL CONFIGURATION MISSING!');
      console.log('\n📋 TO FIX EMAIL SENDING:');
      console.log('1. Create a .env file in the backend directory');
      console.log('2. Add the following configuration:');
      console.log('');
      console.log('# For Gmail:');
      console.log('EMAIL_SERVICE=gmail');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=your-app-password');
      console.log('');
      console.log('# OR for SendGrid:');
      console.log('EMAIL_SERVICE=sendgrid');
      console.log('EMAIL_PASS=your-sendgrid-api-key');
      console.log('SENDGRID_FROM_EMAIL=noreply@skilllift.com');
      console.log('');
      console.log('3. For Gmail, you need to:');
      console.log('   - Enable 2-factor authentication');
      console.log('   - Generate an App Password');
      console.log('   - Use the App Password as EMAIL_PASS');
      console.log('');
      console.log('4. For SendGrid, you need to:');
      console.log('   - Create a SendGrid account');
      console.log('   - Generate an API key');
      console.log('   - Verify your sender email');
    } else {
      console.log('\n✅ Email configuration found!');
    }

    // Test user registration with email verification
    console.log('\n🧪 TESTING USER REGISTRATION:');
    console.log('='.repeat(50));
    
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'learner'
    };

    console.log('Creating test user...');
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Role:', testUser.role);

    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('⚠️ Test user already exists, deleting...');
      await User.findByIdAndDelete(existingUser._id);
    }

    // Create new user (this will trigger email verification)
    const user = new User(testUser);
    await user.save();

    console.log('✅ Test user created successfully!');
    console.log('📧 Email verification should have been sent to:', testUser.email);
    
    // Check if email was sent (look at console logs)
    console.log('\n📋 CHECK CONSOLE LOGS ABOVE FOR EMAIL STATUS');
    console.log('If you see "EMAIL WOULD BE SENT" - email config is missing');
    console.log('If you see "Email sent successfully" - email is working!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testEmailRegistration();
