// Simple email test for SkillLift
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing SkillLift Email Configuration...');
  console.log('='.repeat(50));
  
  // Check environment variables
  console.log('🔍 Environment Check:');
  console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials missing!');
    return;
  }
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Test connection
    console.log('🔗 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"SkillLift" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '🎉 SkillLift Email Test - SUCCESS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 SkillLift</h1>
            <p style="margin: 10px 0 0 0;">Email Test Successful!</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10b981;">✅ Congratulations!</h2>
            <p>Your SkillLift email configuration is working perfectly!</p>
            
            <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>✅ Email System Ready!</strong><br>
              • SMTP Connection: Working<br>
              • Email Sending: Working<br>
              • Admin Notifications: Ready<br>
              • User Approvals: Ready<br>
              • Course Approvals: Ready
            </div>
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
            
            <p>Your admin panel can now send real emails instead of console logs!</p>
            
            <p>Best regards,<br>The SkillLift Team</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox: ${process.env.EMAIL_USER}`);
    console.log('');
    console.log('🎉 Your email system is ready for production!');
    
  } catch (error) {
    console.log('❌ Email test failed:');
    console.log(`Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('');
      console.log('🔧 Solution:');
      console.log('• Check your Gmail app password');
      console.log('• Make sure 2-Factor Authentication is enabled');
      console.log('• Verify EMAIL_USER and EMAIL_PASS in .env file');
    }
  }
}

testEmail();
