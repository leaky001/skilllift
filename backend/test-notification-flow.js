const mongoose = require('mongoose');
const LiveClass = require('./models/LiveClass');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Notification = require('./models/Notification');
const User = require('./models/User');

async function testLiveClassNotificationFlow() {
  try {
    await mongoose.connect('mongodb://localhost:27017/skilllift');
    console.log('✅ Connected to MongoDB');
    
    // Find a live class
    const liveClass = await LiveClass.findOne().populate('courseId tutorId');
    if (!liveClass) {
      console.log('❌ No live classes found');
      return;
    }
    
    console.log('📚 Found live class:', {
      id: liveClass._id,
      title: liveClass.title,
      status: liveClass.status,
      course: liveClass.courseId?.title,
      tutor: liveClass.tutorId?.name
    });
    
    // Find enrollments for this course
    const enrollments = await Enrollment.find({ 
      course: liveClass.courseId._id, 
      status: 'active' 
    }).populate('learner', 'name email');
    
    console.log('👥 Found enrollments:', enrollments.length);
    enrollments.forEach(enrollment => {
      console.log('  - Learner:', enrollment.learner.name, enrollment.learner.email);
    });
    
    // Check notifications for live class started
    const notifications = await Notification.find({
      type: 'live_class_started',
      'data.liveClassId': liveClass._id
    }).populate('recipient', 'name email');
    
    console.log('🔔 Found notifications:', notifications.length);
    notifications.forEach(notification => {
      console.log('  - Recipient:', notification.recipient.name, notification.recipient.email);
      console.log('  - Message:', notification.message);
      console.log('  - Created:', notification.createdAt);
    });
    
    // Test creating a notification manually
    if (enrollments.length > 0) {
      console.log('🧪 Testing notification creation...');
      const testNotification = await Notification.create({
        recipient: enrollments[0].learner._id,
        type: 'live_class_started',
        title: '🚀 Live Class Started!',
        message: `Live class "${liveClass.title}" has started! Click to join now.`,
        data: {
          liveClassId: liveClass._id,
          courseId: liveClass.courseId._id,
          courseTitle: liveClass.courseId.title,
          liveClassTitle: liveClass.title,
          platform: liveClass.platform || 'skilllift'
        },
        priority: 'high'
      });
      
      console.log('✅ Test notification created:', testNotification._id);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testLiveClassNotificationFlow();

