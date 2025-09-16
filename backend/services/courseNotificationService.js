const Notification = require('../models/Notification');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * NOTIFICATION SERVICE FOR COURSE ACTIVITIES
 * 
 * Sends notifications to enrolled learners when:
 * - New assignments are created
 * - Live classes are scheduled
 * - Live classes are about to start
 * - Live classes have started
 */

// Send notification to enrolled learners
const sendNotificationToEnrolledLearners = async (courseId, notificationData) => {
  try {
    // Get all enrolled learners for the course
    const enrollments = await Enrollment.find({ 
      course: courseId, 
      status: 'active' 
    }).populate('learner', 'name email');

    if (enrollments.length === 0) {
      console.log('No enrolled learners found for course:', courseId);
      return;
    }

    // Create notifications for each enrolled learner
    const notifications = enrollments.map(enrollment => ({
      user: enrollment.learner._id,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      data: {
        courseId: courseId,
        courseTitle: notificationData.courseTitle,
        ...notificationData.data
      },
      priority: notificationData.priority || 'normal',
      expiresAt: notificationData.expiresAt
    }));

    // Save notifications to database
    const savedNotifications = await Notification.insertMany(notifications);
    
    console.log(`✅ Sent ${savedNotifications.length} notifications for course ${courseId}`);
    
    return savedNotifications;
  } catch (error) {
    console.error('❌ Error sending notifications to enrolled learners:', error);
    throw error;
  }
};

// Notification: New Assignment Created
const notifyNewAssignment = async (courseId, assignmentData) => {
  try {
    const course = await Course.findById(courseId).select('title');
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationData = {
      type: 'assignment_created',
      title: 'New Assignment Available',
      message: `A new assignment "${assignmentData.title}" has been added to "${course.title}"`,
      courseTitle: course.title,
      data: {
        assignmentId: assignmentData._id,
        assignmentTitle: assignmentData.title,
        dueDate: assignmentData.dueDate
      },
      priority: 'normal',
      expiresAt: assignmentData.dueDate ? new Date(assignmentData.dueDate) : null
    };

    return await sendNotificationToEnrolledLearners(courseId, notificationData);
  } catch (error) {
    console.error('❌ Error notifying about new assignment:', error);
    throw error;
  }
};

// Notification: Live Class Scheduled
const notifyLiveClassScheduled = async (courseId, liveClassData) => {
  try {
    const course = await Course.findById(courseId).select('title');
    if (!course) {
      throw new Error('Course not found');
    }

    const scheduledDate = new Date(liveClassData.scheduledDate);
    const notificationData = {
      type: 'live_class_scheduled',
      title: 'Live Class Scheduled',
      message: `A live class "${liveClassData.title}" has been scheduled for "${course.title}"`,
      courseTitle: course.title,
      data: {
        liveClassId: liveClassData._id,
        liveClassTitle: liveClassData.title,
        scheduledDate: liveClassData.scheduledDate,
        duration: liveClassData.duration
      },
      priority: 'normal',
      expiresAt: scheduledDate
    };

    return await sendNotificationToEnrolledLearners(courseId, notificationData);
  } catch (error) {
    console.error('❌ Error notifying about scheduled live class:', error);
    throw error;
  }
};

// Notification: Live Class Starting Soon (30 minutes before)
const notifyLiveClassStartingSoon = async (courseId, liveClassData) => {
  try {
    const course = await Course.findById(courseId).select('title');
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationData = {
      type: 'live_class_starting_soon',
      title: 'Live Class Starting Soon',
      message: `Your live class "${liveClassData.title}" for "${course.title}" starts in 30 minutes!`,
      courseTitle: course.title,
      data: {
        liveClassId: liveClassData._id,
        liveClassTitle: liveClassData.title,
        scheduledDate: liveClassData.scheduledDate,
        duration: liveClassData.duration
      },
      priority: 'high',
      expiresAt: new Date(liveClassData.scheduledDate)
    };

    return await sendNotificationToEnrolledLearners(courseId, notificationData);
  } catch (error) {
    console.error('❌ Error notifying about live class starting soon:', error);
    throw error;
  }
};

// Notification: Live Class Started
const notifyLiveClassStarted = async (courseId, liveClassData) => {
  try {
    const course = await Course.findById(courseId).select('title');
    if (!course) {
      throw new Error('Course not found');
    }

    const notificationData = {
      type: 'live_class_started',
      title: 'Live Class Started',
      message: `Your live class "${liveClassData.title}" for "${course.title}" is now live! Join now.`,
      courseTitle: course.title,
      data: {
        liveClassId: liveClassData._id,
        liveClassTitle: liveClassData.title,
        scheduledDate: liveClassData.scheduledDate,
        duration: liveClassData.duration
      },
      priority: 'high',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // Expire in 2 hours
    };

    return await sendNotificationToEnrolledLearners(courseId, notificationData);
  } catch (error) {
    console.error('❌ Error notifying about live class started:', error);
    throw error;
  }
};

// Schedule notification for live class starting soon
const scheduleLiveClassReminder = async (liveClassData) => {
  try {
    const scheduledDate = new Date(liveClassData.scheduledDate);
    const reminderTime = new Date(scheduledDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    
    // Only schedule if the reminder time is in the future
    if (reminderTime > new Date()) {
      // In a real implementation, you would use a job scheduler like Bull, Agenda, or node-cron
      // For now, we'll just log it
      console.log(`📅 Scheduled reminder for live class ${liveClassData._id} at ${reminderTime}`);
      
      // You can implement actual scheduling here
      // Example with node-cron:
      // const cron = require('node-cron');
      // cron.schedule(reminderTime, () => {
      //   notifyLiveClassStartingSoon(liveClassData.course, liveClassData);
      // });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error scheduling live class reminder:', error);
    throw error;
  }
};

module.exports = {
  sendNotificationToEnrolledLearners,
  notifyNewAssignment,
  notifyLiveClassScheduled,
  notifyLiveClassStartingSoon,
  notifyLiveClassStarted,
  scheduleLiveClassReminder
};
