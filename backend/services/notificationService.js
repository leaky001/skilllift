// Socket.io will be injected when available
let io = null;
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class NotificationService {
  // Set Socket.io instance
  static setSocketIO(socketIO) {
    io = socketIO;
  }

  // Emit real-time notification via WebSocket
  static async emitNotification(userId, notification) {
    try {
      // Check if Socket.IO is available
      if (io) {
        // Emit to specific user
        io.to(`user_${userId}`).emit('notification', notification);
      } else {
        console.log('⚠️ Socket.IO not available, skipping real-time notification');
      }
      
      // Also store in database for persistence
      await this.storeNotification(userId, notification);
      
      return true;
    } catch (error) {
      console.error('Error emitting notification:', error);
      return false;
    }
  }

  // Store notification in database
  static async storeNotification(userId, notification) {
    try {
      const Notification = require('../models/Notification');
      
      const notificationDoc = new Notification({
        recipient: userId,
        sender: notification.sender || null,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: false
      });

      await notificationDoc.save();
      return notificationDoc;
    } catch (error) {
      // Handle duplicate key errors gracefully
      if (error.code === 11000) {
        console.log('⚠️ Duplicate notification detected, skipping...');
        return null;
      }
      console.error('Error storing notification:', error);
      return null;
    }
  }

  // Send email notification
  static async sendEmailNotification(userEmail, notification) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: notification.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">${notification.title}</h2>
            <p>${notification.message}</p>
            
            ${notification.data?.meetLink ? `
              <div style="margin: 20px 0;">
                <a href="${notification.data.meetLink}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Join Live Class
                </a>
              </div>
            ` : ''}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This is an automated message from SkillLift. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Send notification to multiple users
  static async sendBulkNotification(userIds, notification, includeEmail = false) {
    try {
      const User = require('../models/User');
      
      const results = await Promise.allSettled(
        userIds.map(async (userId) => {
          // Send real-time notification
          await this.emitNotification(userId, notification);
          
          // Send email if requested
          if (includeEmail) {
            const user = await User.findById(userId);
            if (user && user.email) {
              await this.sendEmailNotification(user.email, notification);
            }
          }
        })
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        successful,
        failed,
        total: userIds.length
      };
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return { successful: 0, failed: userIds.length, total: userIds.length };
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const Notification = require('../models/Notification');
      
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const Notification = require('../models/Notification');
      
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() }
      );

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const Notification = require('../models/Notification');
      
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

module.exports = NotificationService;