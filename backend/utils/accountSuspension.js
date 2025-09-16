const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Function to check for overdue payments and suspend accounts
async function checkAndSuspendOverdueAccounts() {
  try {
    console.log('🔍 Checking for overdue payments...');
    
    // Find all enrollments with pending payments
    const enrollmentsWithPendingPayments = await Enrollment.find({
      status: 'active',
      paymentType: 'installment'
    }).populate('learner', 'name email role accountStatus');
    
    console.log(`📚 Found ${enrollmentsWithPendingPayments.length} enrollments with installment payments`);
    
    const today = new Date();
    let suspendedCount = 0;
    
    for (const enrollment of enrollmentsWithPendingPayments) {
      // Find the most recent payment for this enrollment
      const recentPayment = await Payment.findOne({
        user: enrollment.learner._id,
        course: enrollment.course,
        status: 'successful'
      }).sort({ createdAt: -1 });
      
      if (recentPayment && recentPayment.nextInstallmentDate) {
        // Check if the next installment is overdue
        if (today > recentPayment.nextInstallmentDate) {
          console.log(`⚠️ Overdue payment found for ${enrollment.learner.name}`);
          
          // Suspend the learner's account
          await User.findByIdAndUpdate(enrollment.learner._id, {
            accountStatus: 'suspended',
            suspensionReason: 'Overdue payment',
            suspendedAt: new Date()
          });
          
          // Create notification for learner
          await Notification.create({
            recipient: enrollment.learner._id,
            type: 'account_suspended',
            title: '🚫 Account Suspended - Overdue Payment',
            message: `Your account has been suspended due to overdue payment for course "${enrollment.course.title}". Please make your payment to reactivate your account.`,
            data: {
              enrollmentId: enrollment._id,
              courseId: enrollment.course,
              overdueAmount: recentPayment.nextInstallmentAmount,
              dueDate: recentPayment.nextInstallmentDate
            }
          });
          
          // Create notification for admin
          const admin = await User.findOne({ role: 'admin' });
          if (admin) {
            await Notification.create({
              recipient: admin._id,
              type: 'account_suspended',
              title: '⚠️ Learner Account Suspended',
              message: `${enrollment.learner.name}'s account has been suspended due to overdue payment for course "${enrollment.course.title}".`,
              data: {
                learnerId: enrollment.learner._id,
                enrollmentId: enrollment._id,
                courseId: enrollment.course,
                overdueAmount: recentPayment.nextInstallmentAmount,
                dueDate: recentPayment.nextInstallmentDate
              }
            });
          }
          
          suspendedCount++;
          console.log(`✅ Suspended account for ${enrollment.learner.name}`);
        }
      }
    }
    
    console.log(`🎯 Suspended ${suspendedCount} accounts for overdue payments`);
    
  } catch (error) {
    console.error('❌ Error checking overdue payments:', error);
  }
}

// Function to reactivate a suspended account (for admin use)
async function reactivateAccount(learnerId, adminId) {
  try {
    console.log(`🔄 Reactivating account for learner: ${learnerId}`);
    
    // Update learner's account status
    await User.findByIdAndUpdate(learnerId, {
      accountStatus: 'approved',
      suspensionReason: null,
      suspendedAt: null,
      reactivatedAt: new Date(),
      reactivatedBy: adminId
    });
    
    // Create notification for learner
    await Notification.create({
      recipient: learnerId,
      type: 'account_reactivated',
      title: '✅ Account Reactivated',
      message: 'Your account has been reactivated. You can now access your courses again.',
      data: {
        reactivatedBy: adminId,
        reactivatedAt: new Date()
      }
    });
    
    console.log(`✅ Account reactivated for learner: ${learnerId}`);
    
  } catch (error) {
    console.error('❌ Error reactivating account:', error);
  }
}

// Export functions for use in controllers
module.exports = {
  checkAndSuspendOverdueAccounts,
  reactivateAccount
};
