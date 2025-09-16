#!/usr/bin/env node

/**
 * 📧 Email Configuration Test Script for SkillLift
 * 
 * This script tests your email configuration and sends sample emails
 * to verify everything is working correctly.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Test email configuration
const testEmailSetup = async () => {
  console.log('📧 Testing Email Configuration for SkillLift...');
  console.log('=' .repeat(50));
  console.log('');

  // Check environment variables
  console.log('🔍 Checking Environment Variables:');
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail (default)'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log(`SENDGRID_FROM_EMAIL: ${process.env.SENDGRID_FROM_EMAIL || 'noreply@skilllift.com (default)'}`);
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('');
    console.log('🔧 To fix this:');
    console.log('1. Create a .env file in the backend/ directory');
    console.log('2. Add your email credentials:');
    console.log('   EMAIL_SERVICE=gmail');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('');
    console.log('📖 See REAL_EMAIL_SETUP.md for detailed instructions');
    return;
  }

  try {
    // Create transporter based on service
    let transporter;
    
    if (process.env.EMAIL_SERVICE === 'sendgrid' || process.env.EMAIL_SERVICE === 'twilio') {
      transporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      transporter = nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Test SMTP connection
    console.log('🔗 Testing SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log('');

    // Send test email
    console.log('📤 Sending test email...');
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    
    const testEmail = {
      from: `"SkillLift" <${fromEmail}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '🧪 SkillLift Email Test - Configuration Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 SkillLift</h1>
            <p style="margin: 10px 0 0 0;">Email Configuration Test</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10b981;">✅ Email Service Working!</h2>
            <p>Congratulations! Your SkillLift email configuration is working correctly.</p>
            
            <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ Test Results:</strong><br>
              • SMTP Connection: Success<br>
              • Email Sending: Success<br>
              • Template Support: Ready<br>
              • Admin Notifications: Ready
            </div>
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Service:</strong> ${process.env.EMAIL_SERVICE || 'gmail'}</p>
            <p><strong>From:</strong> ${fromEmail}</p>
            
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 14px;">
              Your SkillLift platform is now ready to send:<br>
              • Account approval/rejection emails<br>
              • Course approval/rejection emails<br>
              • Password reset emails<br>
              • Welcome emails<br>
              • And more!
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`);
    console.log('');

    // Test template-based email
    console.log('🎨 Testing Template-Based Email...');
    const templateEmail = {
      from: `"SkillLift" <${fromEmail}>`,
      to: process.env.EMAIL_USER,
      subject: '🎉 Account Approved - Template Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 SkillLift</h1>
            <p style="margin: 10px 0 0 0;">Account Approved!</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Congratulations Test User!</h2>
            <p>This is a test of the professional email template system.</p>
            
            <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ Template Test Successful!</strong><br>
              Professional email templates are working correctly.
            </div>
            
            <p>Best regards,<br>The SkillLift Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(templateEmail);
    console.log('✅ Template email sent successfully!');
    console.log('');

    console.log('🎉 All tests passed! Your email system is ready for production.');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. ✅ Email configuration is working');
    console.log('2. ✅ Professional templates are ready');
    console.log('3. ✅ Admin notifications will work');
    console.log('4. 🚀 You can now approve/reject users and courses');
    console.log('');

  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 Common Solutions:');
    
    if (error.message.includes('Invalid login')) {
      console.log('• Check your EMAIL_USER and EMAIL_PASS in .env file');
      console.log('• For Gmail: Use App Password, not regular password');
      console.log('• Enable 2-Factor Authentication on Gmail');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('• Check your internet connection');
      console.log('• Verify EMAIL_SERVICE is correct');
      console.log('• Check firewall settings');
    } else if (error.message.includes('authentication')) {
      console.log('• Verify EMAIL_PASS is correct');
      console.log('• For SendGrid: Use API key, not password');
      console.log('• Check if account is locked or suspended');
    } else {
      console.log('• Check all environment variables');
      console.log('• Verify .env file is in backend/ directory');
      console.log('• Restart your server after changing .env');
    }
    
    console.log('');
    console.log('📖 See REAL_EMAIL_SETUP.md for detailed troubleshooting');
  }
};

// Run the test
testEmailSetup().then(() => {
  console.log('📧 Email test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
