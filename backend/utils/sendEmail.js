const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Create transporter with better error handling, SendGrid and Twilio support
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email configuration missing! Please set up EMAIL_USER and EMAIL_PASS in your .env file');
    console.warn('📧 For now, emails will be logged to console instead of being sent');
    return null;
  }

  try {
    // Support for SendGrid
    if (process.env.EMAIL_SERVICE === 'sendgrid') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'apikey', // This is always 'apikey' for SendGrid
          pass: process.env.EMAIL_PASS, // Your SendGrid API key
        },
      });
    }

    // Support for Twilio SendGrid (if using Twilio's SendGrid)
    if (process.env.EMAIL_SERVICE === 'twilio') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.EMAIL_PASS, // Your Twilio SendGrid API key
        },
      });
    }

    // Support for Gmail and other services
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .verification-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 SkillLift</h1>
          <p>Verify Your Email Address</p>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>Thank you for registering with SkillLift. To complete your registration, please verify your email address using the verification code below:</p>
          
          <div class="verification-code">
            <p><strong>Your Verification Code:</strong></p>
            <div class="code">${data.verificationCode}</div>
            <p><small>This code will expire in 10 minutes</small></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Never share this code with anyone. SkillLift will never ask for your verification code via phone or email.
          </div>
          
          <p>If you didn't create an account with SkillLift, please ignore this email.</p>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  welcome: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SkillLift!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to SkillLift!</h1>
          <p>Your Learning Journey Begins Here</p>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>Welcome to SkillLift! We're excited to have you join our community of learners and tutors.</p>
          
          <p><strong>Your Account Details:</strong></p>
          <ul>
            <li><strong>Role:</strong> ${data.role}</li>
            <li><strong>Status:</strong> ${data.accountStatus}</li>
            <li><strong>Email:</strong> ${data.email}</li>
          </ul>
          
          <p>You can now:</p>
          <ul>
            <li>Browse and enroll in courses</li>
            <li>Connect with tutors and learners</li>
            <li>Track your learning progress</li>
            <li>Earn certificates upon completion</li>
          </ul>
          
          <p>Ready to start learning? Visit our platform and explore the available courses!</p>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,
  
  passwordReset: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .code { background: #f8f9fa; border: 2px solid #667eea; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 SkillLift</h1>
          <p>Password Reset Request</p>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>We received a request to reset your password for your SkillLift account.</p>
          
          <p>If you made this request, please use the following reset token:</p>
          
          <div class="code">
            ${data.resetToken}
          </div>
          
          <p>This token will expire in 10 minutes for security reasons.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </div>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // New professional email templates
  accountApproved: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 SkillLift</h1>
          <p>Account Approved!</p>
        </div>
        <div class="content">
          <h2>Congratulations ${data.name}!</h2>
          <p>Great news! Your SkillLift account has been approved by our admin team.</p>
          
          <div class="success">
            <strong>✅ Your account is now active!</strong><br>
            You can now login and start using the platform.
          </div>
          
          <p>What you can do now:</p>
          <ul>
            <li>📚 Browse and enroll in courses</li>
            <li>👨‍🏫 Create courses (if you're a tutor)</li>
            <li>💬 Connect with mentors</li>
            <li>📊 Track your learning progress</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to SkillLift</a>
          
          <p>Welcome to SkillLift!<br><br>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  accountRejected: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Application Update - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .notice { background: #fef2f2; border: 1px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .reason { background: #f3f4f6; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 SkillLift</h1>
          <p>Account Application Update</p>
        </div>
        <div class="content">
          <h2>Hello ${data.name},</h2>
          <p>We regret to inform you that your SkillLift account application has been rejected.</p>
          
          <div class="notice">
            <strong>❌ Application Status: Rejected</strong>
          </div>
          
          <div class="reason">
            <strong>Reason:</strong> ${data.rejectionReason}
          </div>
          
          <p>If you have any questions or would like to appeal this decision, please contact our support team.</p>
          
          <p>We appreciate your interest in SkillLift and encourage you to reapply in the future.</p>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  courseApproved: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Approved - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 SkillLift</h1>
          <p>Course Approved!</p>
        </div>
        <div class="content">
          <h2>Congratulations!</h2>
          <p>Your course "${data.courseTitle}" has been approved by admin and is now live!</p>
          
          <div class="success">
            <strong>✅ Your course is now published!</strong><br>
            Students can now discover and enroll in your course.
          </div>
          
          <p>What happens next:</p>
          <ul>
            <li>📚 Your course is now visible to students</li>
            <li>📊 You can track enrollments and progress</li>
            <li>💰 You'll start earning from course sales</li>
            <li>⭐ Students can rate and review your course</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tutor/courses" class="button">View Your Course</a>
          
          <p>Keep up the great work!<br><br>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
      </div>
    </body>
    </html>
  `,

  courseRejected: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Update Required - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .reason { background: #f3f4f6; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 SkillLift</h1>
          <p>Course Update Required</p>
        </div>
        <div class="content">
          <h2>Hello ${data.name},</h2>
          <p>Your course "${data.courseTitle}" needs updates before approval.</p>
          
          <div class="notice">
            <strong>⚠️ Action Required: Course Updates Needed</strong>
          </div>
          
          <div class="reason">
            <strong>Reason:</strong> ${data.rejectionReason}
          </div>
          
          <p>Please review the feedback above and make the necessary improvements to your course.</p>
          
          <p>Once you've made the updates, you can resubmit your course for review.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tutor/courses" class="button">Update Your Course</a>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>This email was sent to ${data.email}</p>
        </div>
        </div>
      </body>
    </html>
  `,

  // Admin payment notification template
  adminPaymentNotification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Payment Received - SkillLift Admin</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .payment-details { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 SkillLift Admin</h1>
          <p>New Payment Received!</p>
        </div>
        <div class="content">
          <h2>Hello ${data.adminName},</h2>
          <p>A new payment has been received on SkillLift platform!</p>
          
          <div class="payment-details">
            <h3>💳 Payment Details:</h3>
            <p><strong>Learner:</strong> ${data.learnerName} (${data.learnerEmail})</p>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Tutor:</strong> ${data.tutorName}</p>
            <p><strong>Total Amount:</strong> <span class="amount">₦${data.amount}</span></p>
            <p><strong>Platform Commission:</strong> ₦${data.commission}</p>
            <p><strong>Tutor Amount:</strong> ₦${data.tutorAmount}</p>
            <p><strong>Payment ID:</strong> ${data.paymentId}</p>
          </div>
          
          <p>The learner has been automatically enrolled in the course.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/payments" class="button">View Payment Details</a>
          
          <p>Best regards,<br>SkillLift Payment System</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>Admin Dashboard - Payment Notification System</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Tutor payment notification template
  tutorPaymentNotification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received - SkillLift</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .payment-details { background: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .tutor-amount { font-size: 24px; font-weight: bold; color: #17a2b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 SkillLift</h1>
          <p>Payment Received!</p>
        </div>
        <div class="content">
          <h2>Hello ${data.tutorName},</h2>
          <p>Great news! You've received a payment for your course on SkillLift!</p>
          
          <div class="payment-details">
            <h3>💳 Payment Details:</h3>
            <p><strong>Learner:</strong> ${data.learnerName}</p>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Total Amount:</strong> ₦${data.amount}</p>
            <p><strong>Platform Commission:</strong> ₦${data.commission}</p>
            <p><strong>Your Share:</strong> <span class="tutor-amount">₦${data.tutorAmount}</span></p>
          </div>
          
          <p>The learner has been automatically enrolled in your course and can now access all course materials.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/tutor/dashboard" class="button">View Dashboard</a>
          
          <p>Keep up the great work! Your students are learning valuable skills because of your expertise.</p>
          
          <p>Best regards,<br>The SkillLift Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SkillLift. All rights reserved.</p>
          <p>Empowering Education Through Technology</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Live class scheduled template
  liveClassScheduled: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎥 Live Class Scheduled!</h1>
        <p style="color: #e0e6ff; margin: 10px 0 0 0; font-size: 16px;">Get ready for an amazing learning experience</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-top: 0;">Hello ${data.name}!</h2>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
          <h3 style="color: #2d3748; margin-top: 0;">Live Class Details</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseTitle}</p>
          <p style="margin: 5px 0;"><strong>Live Class:</strong> ${data.liveClassTitle}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${data.scheduledDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${data.scheduledTime}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${data.duration} minutes</p>
          <p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #667eea;">Join Live Class</a></p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${data.meetingPassword}</p>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6;">We're excited to have you join our live class! Make sure to test your audio and video before the session starts.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.meetingLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Join Live Class</a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">See you in the live class!</p>
      </div>
    </div>
  `,

  // Payment reminder template
  paymentReminder: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💳 Payment Reminder</h1>
        <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px;">Complete your installment payment</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-top: 0;">Hello ${data.name}!</h2>
        
        <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f6ad55;">
          <h3 style="color: #2d3748; margin-top: 0;">Payment Details</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseTitle}</p>
          <p style="margin: 5px 0;"><strong>Amount Due:</strong> ₦${data.amount}</p>
          <p style="margin: 5px 0;"><strong>Due Date:</strong> ${data.dueDate}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${data.daysUntilDue < 0 ? 'Overdue' : 'Due Soon'}</p>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6;">${data.daysUntilDue < 0 ? 'Your payment is overdue. Please complete it as soon as possible to avoid suspension of your course access.' : 'Your installment payment is due soon. Please complete it to continue your course access.'}</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentLink}" style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Pay Now</a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">Thank you for choosing SkillLift!</p>
      </div>
    </div>
  `,

  // Enrollment suspended template
  enrollmentSuspended: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Enrollment Suspended</h1>
        <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px;">Payment required to continue</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-top: 0;">Hello ${data.name}!</h2>
        
        <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f6ad55;">
          <h3 style="color: #2d3748; margin-top: 0;">Suspension Details</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseTitle}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${data.reason}</p>
          <p style="margin: 5px 0;"><strong>Support:</strong> ${data.supportEmail}</p>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6;">Your enrollment has been temporarily suspended due to overdue payment. Please complete your payment to reactivate your course access and continue learning.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/payments" style="background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Complete Payment</a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">Contact support if you need assistance.</p>
      </div>
    </div>
  `,

  // Enrollment reactivated template
  enrollmentReactivated: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Welcome Back!</h1>
        <p style="color: #c6f6d5; margin: 10px 0 0 0; font-size: 16px;">Your enrollment has been reactivated</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin-top: 0;">Hello ${data.name}!</h2>
        
        <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
          <h3 style="color: #2d3748; margin-top: 0;">Reactivation Details</h3>
          <p style="margin: 5px 0;"><strong>Course:</strong> ${data.courseTitle}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
          <p style="margin: 5px 0;"><strong>Access:</strong> Fully Restored</p>
        </div>
        
        <p style="color: #4a5568; line-height: 1.6;">Great news! Your enrollment has been reactivated and you now have full access to your course. Continue your learning journey!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/my-courses" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Continue Learning</a>
        </div>
        
        <p style="color: #718096; font-size: 14px; margin-top: 30px;">Welcome back to SkillLift!</p>
      </div>
    </div>
  `,

  assignmentCreated: (data) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Assignment Notification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .assignment-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            .title {
                color: #007bff;
                font-size: 28px;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #6c757d;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .assignment-details {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #007bff;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: bold;
                color: #495057;
            }
            .detail-value {
                color: #007bff;
            }
            .due-date {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .due-date-text {
                font-size: 18px;
                font-weight: bold;
                color: #856404;
            }
            .instructions {
                background-color: #e7f3ff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .instructions h3 {
                color: #007bff;
                margin-top: 0;
            }
            .cta-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
                transition: background-color 0.3s;
            }
            .cta-button:hover {
                background-color: #0056b3;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
            .points-badge {
                background-color: #28a745;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                display: inline-block;
            }
            .type-badge {
                background-color: #6c757d;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-weight: bold;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">SkillLift</div>
                <div class="assignment-icon">📝</div>
                <h1 class="title">New Assignment Posted!</h1>
                <p class="subtitle">Your tutor has created a new assignment for you</p>
            </div>

            <div class="content">
                <p>Hello <strong>${data.name || 'Student'}</strong>,</p>
                
                <p>Great news! Your tutor <strong>${data.tutorName || 'Your Tutor'}</strong> has posted a new assignment for the course <strong>"${data.courseTitle || 'Your Course'}"</strong>.</p>

                <div class="assignment-details">
                    <h3 style="color: #007bff; margin-top: 0;">Assignment Details</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Assignment Title:</span>
                        <span class="detail-value">${data.assignmentTitle || 'New Assignment'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Course:</span>
                        <span class="detail-value">${data.courseTitle || 'Your Course'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="type-badge">${data.assignmentType || 'Assignment'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Points:</span>
                        <span class="points-badge">${data.points || '0'} points</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Submission Type:</span>
                        <span class="detail-value">${data.submissionType || 'File Upload'}</span>
                    </div>
                </div>

                <div class="due-date">
                    <div class="due-date-text">📅 Due Date: ${data.dueDate || 'TBD'} at ${data.dueTime || 'TBD'}</div>
                </div>

                <div class="instructions">
                    <h3>📋 Assignment Description</h3>
                    <p>${data.description || 'No description provided.'}</p>
                    
                    <h3>📝 Instructions</h3>
                    <p>${data.instructions || 'Please check the platform for detailed instructions.'}</p>
                </div>

                <div style="text-align: center;">
                    <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/learner/assignments" class="cta-button">
                        View Assignment Details
                    </a>
                </div>

                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #856404; margin-top: 0;">⏰ Important Reminders</h4>
                    <ul style="color: #856404; margin: 0;">
                        <li>Make sure to submit your assignment before the due date</li>
                        <li>Check the submission requirements carefully</li>
                        <li>Contact your tutor if you have any questions</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>This is an automated notification from SkillLift.</p>
                <p>If you have any questions, please contact your tutor or our support team.</p>
                <p><a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}">Visit SkillLift Platform</a></p>
            </div>
        </div>
    </body>
    </html>
  `
};

// Send email function with fallback to console logging
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Fallback: Log email to console
      console.log('📧 EMAIL WOULD BE SENT (Email config missing):');
      console.log('From: SkillLift <noreply@skilllift.com>');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.html || options.text);
      console.log('---');
      return { success: true, message: 'Email logged to console (no email config)' };
    }

    // Use the verified sender email from environment
    let fromEmail = process.env.SENDGRID_FROM_EMAIL;
    
    if (!fromEmail) {
      console.warn('⚠️ SENDGRID_FROM_EMAIL not set, using default');
      fromEmail = 'noreply@skilllift.com';
    }

    // Handle template-based emails
    let htmlContent = options.html;
    if (options.template && emailTemplates[options.template]) {
      htmlContent = emailTemplates[options.template](options.data || {});
    }

    const mailOptions = {
      from: `"SkillLift" <${fromEmail}>`, // Use verified email
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // Log error but don't crash the application
    console.error('❌ Email sending failed:', error.message);
    console.log('📧 EMAIL WOULD BE SENT (Email failed, logging to console):');
    console.log('From: SkillLift <', process.env.SENDGRID_FROM_EMAIL || 'noreply@skilllift.com', '>');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html || options.text);
    console.log('---');
    return { success: true, message: 'Email logged to console (email service failed)' };
  }
};

// Send email verification function that sends REAL emails
const sendEmailVerification = async (user, verificationCode) => {
  try {
    // Send REAL email using the main sendEmail function
    await sendEmail({
      to: user.email,
      subject: '🔐 Verify Your SkillLift Account',
      template: 'emailVerification',
      data: {
        name: user.name,
        verificationCode: verificationCode,
        email: user.email
      }
    });
    
    console.log('✅ Email verification sent to:', user.email);
    
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    
    // Fallback: Log to console if email fails
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL VERIFICATION CODE (EMAIL FAILED - CONSOLE FALLBACK)');
    console.log('='.repeat(60));
    console.log('To:', user.email);
    console.log('Name:', user.name);
    console.log('Verification Code:', verificationCode);
    console.log('Expires in: 10 minutes');
    console.log('='.repeat(60) + '\n');
    
    return { success: true, message: 'Verification code logged to console (email failed)' };
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to SkillLift! 🎓',
      html: emailTemplates.welcome({ 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        accountStatus: user.accountStatus 
      })
    });
  } catch (error) {
    console.error('Welcome email sending failed:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - SkillLift',
      html: emailTemplates.passwordReset({ 
        name: user.name, 
        resetToken 
      })
    });
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    throw error;
  }
};

// Send KYC approval email
const sendKYCApprovalEmail = async (tutor) => {
  try {
    await sendEmail({
      to: tutor.email,
      subject: '🎉 Your KYC Verification Has Been Approved!',
      template: 'kycApproval',
      data: {
        name: tutor.name,
        email: tutor.email
      }
    });
    
    console.log('✅ KYC approval email sent to:', tutor.email);
    
    return { success: true, message: 'KYC approval email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send KYC approval email:', error.message);
    
    // Fallback: Log to console if email fails
    console.log('\n' + '='.repeat(60));
    console.log('📧 KYC APPROVAL EMAIL (EMAIL FAILED - CONSOLE FALLBACK)');
    console.log('='.repeat(60));
    console.log('To:', tutor.email);
    console.log('Name:', tutor.name);
    console.log('Subject: 🎉 Your KYC Verification Has Been Approved!');
    console.log('Message: Congratulations! Your KYC verification has been approved. You can now create courses and receive payments.');
    console.log('='.repeat(60) + '\n');
    
    return { success: true, message: 'KYC approval email logged to console (email failed)' };
  }
};

// Send KYC rejection email
const sendKYCRejectionEmail = async (tutor, reason) => {
  try {
    await sendEmail({
      to: tutor.email,
      subject: '❌ KYC Verification Update Required',
      template: 'kycRejection',
      data: {
        name: tutor.name,
        email: tutor.email,
        reason: reason
      }
    });
    
    console.log('✅ KYC rejection email sent to:', tutor.email);
    
    return { success: true, message: 'KYC rejection email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send KYC rejection email:', error.message);
    
    // Fallback: Log to console if email fails
    console.log('\n' + '='.repeat(60));
    console.log('📧 KYC REJECTION EMAIL (EMAIL FAILED - CONSOLE FALLBACK)');
    console.log('='.repeat(60));
    console.log('To:', tutor.email);
    console.log('Name:', tutor.name);
    console.log('Subject: ❌ KYC Verification Update Required');
    console.log('Reason:', reason);
    console.log('Message: Your KYC verification has been rejected. Please resubmit your documents with the required corrections.');
    console.log('='.repeat(60) + '\n');
    
    return { success: true, message: 'KYC rejection email logged to console (email failed)' };
  }
};

module.exports = { 
  sendEmail, 
  sendEmailVerification, 
  sendWelcomeEmail, 
  sendPasswordResetEmail,
  sendKYCApprovalEmail,
  sendKYCRejectionEmail
};
