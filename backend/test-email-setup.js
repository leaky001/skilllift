const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmailSetup = async () => {
  console.log('📧 Testing Email Configuration...');
  console.log('');

  // Check environment variables
  console.log('🔍 Checking Environment Variables:');
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'NOT SET'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET'}`);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration missing!');
    console.log('📝 Please set up EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('');
    console.log('🔧 Quick Setup:');
    console.log('1. Create backend/.env file');
    console.log('2. Add your Gmail credentials:');
    console.log('   EMAIL_SERVICE=gmail');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-16-character-app-password');
    console.log('');
    console.log('📧 Gmail App Password Setup:');
    console.log('1. Go to Google Account settings');
    console.log('2. Navigate to Security → 2-Step Verification');
    console.log('3. Click on "App passwords"');
    console.log('4. Select "Mail" and "Other (Custom name)"');
    console.log('5. Enter "SkillLift" as the name');
    console.log('6. Copy the generated 16-character password');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    console.log('🔗 Testing SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 SkillLift Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🎉 Email Verification Working!</h2>
          <p>This is a test email from SkillLift to verify your email configuration.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Status:</strong> ✅ Email service is working correctly</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            If you received this email, your email verification system is ready to use!
          </p>
        </div>
      `
    };

    await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Check your inbox: ${process.env.EMAIL_USER}`);

  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 Common Solutions:');
    console.log('1. Check your Gmail app password');
    console.log('2. Ensure 2-factor authentication is enabled');
    console.log('3. Verify EMAIL_USER and EMAIL_PASS in .env file');
    console.log('4. Check if Gmail is blocking the connection');
  }
};

// Run the test
testEmailSetup().then(() => {
  console.log('');
  console.log('🏁 Email test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
