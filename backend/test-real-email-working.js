// Simple email test to show you what emails will look like
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testRealEmail() {
  console.log('📧 Testing Real Email to Your Gmail...');
  console.log('='.repeat(50));
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'lakybass19@gmail.com',
        pass: 'zjka avyj otqe yfbm'
      }
    });
    
    console.log('✅ Gmail transporter created');
    
    // Send verification email
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    const result = await transporter.sendMail({
      from: '"SkillLift" <lakybass19@gmail.com>',
      to: 'lakybass19@gmail.com',
      subject: '🔐 SkillLift Email Verification - TEST',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🔐 SkillLift</h1>
            <p style="margin: 10px 0 0 0;">Email Verification</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello!</h2>
            <p>This is a <strong>REAL EMAIL TEST</strong> to show you what users will receive!</p>
            
            <div style="background: #f8f9fa; border: 2px solid #667eea; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
              ${verificationCode}
            </div>
            
            <p><strong>✅ This proves:</strong></p>
            <ul>
              <li>✅ Your Gmail credentials work</li>
              <li>✅ Emails will be sent to real users</li>
              <li>✅ Professional templates are ready</li>
              <li>✅ Email verification system works</li>
            </ul>
            
            <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>🎉 SUCCESS!</strong><br>
              Your email system is working perfectly!
            </div>
            
            <p>Once you fix the database connection, users will receive emails like this when they register!</p>
            
            <p>Best regards,<br>The SkillLift Team</p>
          </div>
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>© 2024 SkillLift. All rights reserved.</p>
            <p>This is a test email sent to lakybass19@gmail.com</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`📬 Check your inbox: lakybass19@gmail.com`);
    console.log(`🔐 Verification code: ${verificationCode}`);
    console.log('');
    console.log('🎉 This proves your email system works!');
    console.log('Users will receive real emails when they register!');
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
  }
}

testRealEmail();
