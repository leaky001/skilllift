# Real-Time Notification System

## Overview

The SkillLift platform now includes a comprehensive real-time notification system that provides users with timely updates about their learning activities, upcoming events, and platform changes.

## Features

### 1. Real-Time Notifications
- **WebSocket Connection**: Real-time notifications via WebSocket
- **Automatic Reconnection**: Handles connection drops and reconnects automatically
- **Live Updates**: Instant notification delivery without page refresh

### 2. Multiple Notification Channels
- **In-App Notifications**: Displayed within the platform
- **Browser Push Notifications**: Desktop notifications with user permission
- **Email Notifications**: Sent to user's registered email
- **SMS Notifications**: Text message notifications (optional)

### 3. Notification Types
- **Live Class Reminders**: Notifications before live classes start
- **Assignment Due**: Reminders for upcoming assignment deadlines
- **Course Updates**: New content and course announcements
- **Payment Reminders**: Payment due date notifications
- **Mentorship Requests**: New mentorship opportunities
- **Certificate Ready**: When certificates are available
- **System Updates**: Platform maintenance and updates
- **Welcome Messages**: Onboarding notifications

### 4. User Preferences
- **Channel Selection**: Users can choose which channels to receive notifications
- **Type Filtering**: Enable/disable specific notification types
- **Priority Levels**: High, medium, and low priority notifications
- **Customizable Settings**: Granular control over notification preferences

## Technical Implementation

### 1. Notification Context (`NotificationContext.jsx`)

```javascript
// Key features:
- WebSocket connection management
- Real-time notification handling
- Browser push notification support
- Notification preferences management
- Automatic event checking (live classes, assignments)
```

### 2. Notification Types Configuration

```javascript
export const NOTIFICATION_TYPES = {
  LIVE_CLASS_REMINDER: {
    id: 'live_class_reminder',
    title: 'Live Class Reminder',
    icon: '🎥',
    priority: 'high',
    defaultMessage: 'Your live class starts in {time} minutes',
    channels: ['push', 'email', 'sms', 'inApp']
  },
  // ... other types
};
```

### 3. WebSocket Integration

```javascript
// WebSocket connection for real-time notifications
const connectWebSocket = () => {
  const wsUrl = `ws://localhost:3001/notifications?userId=${user._id}&role=${user.role}`;
  wsRef.current = new WebSocket(wsUrl);
  
  wsRef.current.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    handleIncomingNotification(notification);
  };
};
```

### 4. Browser Push Notifications

```javascript
// Request notification permissions
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success('Push notifications enabled!');
    }
  }
};
```

## Usage Examples

### 1. Creating Notifications

```javascript
// Create a live class reminder
await createNotification({
  type: 'live_class_reminder',
  title: 'Live Class Reminder',
  message: 'Your live class "Advanced JavaScript" starts in 15 minutes',
  priority: 'high',
  data: { liveClassId: '1', courseId: 'course1' }
});
```

### 2. Handling Notification Clicks

```javascript
const handleNotificationClick = (notification) => {
  markAsRead(notification._id);
  
  // Navigate based on notification type
  if (notification.data?.liveClassId) {
    window.open(`/learner/live-classes/${notification.data.liveClassId}`, '_blank');
  }
};
```

### 3. Updating Preferences

```javascript
await updateNotificationPreferences({
  email: true,
  sms: false,
  push: true,
  liveClassReminders: true,
  assignmentReminders: true
});
```

## Backend Requirements

### 1. WebSocket Server
- **Endpoint**: `ws://localhost:3001/notifications`
- **Authentication**: User ID and role-based access
- **Message Format**: JSON with notification data

### 2. Email Service Integration
- **Service**: SendGrid, AWS SES, or similar
- **Templates**: HTML email templates for different notification types
- **Rate Limiting**: Prevent spam and respect user preferences

### 3. SMS Service Integration
- **Service**: Twilio, AWS SNS, or similar
- **Cost Management**: Monitor SMS costs and usage
- **Opt-out Handling**: Respect user SMS preferences

### 4. Database Schema

```sql
-- Notifications table
CREATE TABLE notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data JSON,
  channels JSON
);

-- User notification preferences
CREATE TABLE user_notification_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  email BOOLEAN DEFAULT TRUE,
  sms BOOLEAN DEFAULT FALSE,
  push BOOLEAN DEFAULT TRUE,
  in_app BOOLEAN DEFAULT TRUE,
  live_class_reminders BOOLEAN DEFAULT TRUE,
  assignment_reminders BOOLEAN DEFAULT TRUE,
  course_updates BOOLEAN DEFAULT TRUE,
  payment_reminders BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Security Considerations

### 1. Authentication
- WebSocket connections require user authentication
- Notification access is role-based
- User preferences are user-specific

### 2. Data Privacy
- Notification data is encrypted in transit
- User preferences are stored securely
- Opt-out mechanisms for all channels

### 3. Rate Limiting
- Prevent notification spam
- Respect user preferences
- Monitor system performance

## Performance Optimization

### 1. Caching
- Cache user preferences
- Cache notification templates
- Optimize database queries

### 2. Batch Processing
- Batch email notifications
- Batch SMS notifications
- Reduce API calls

### 3. Monitoring
- Track notification delivery rates
- Monitor WebSocket connections
- Alert on system issues

## Future Enhancements

### 1. Advanced Features
- **Scheduled Notifications**: Send notifications at specific times
- **Notification Templates**: Customizable notification content
- **Notification Analytics**: Track user engagement
- **Smart Notifications**: AI-powered notification timing

### 2. Integration Opportunities
- **Calendar Integration**: Sync with user calendars
- **Mobile App**: Native mobile notifications
- **Third-party Services**: Slack, Discord, etc.
- **Learning Analytics**: Personalized notification recommendations

### 3. User Experience
- **Notification Center**: Centralized notification management
- **Notification History**: Search and filter past notifications
- **Bulk Actions**: Mark multiple notifications as read
- **Notification Sounds**: Customizable audio alerts

## Troubleshooting

### 1. Common Issues
- **WebSocket Connection Failed**: Check server status and authentication
- **Push Notifications Not Working**: Verify browser permissions
- **Email Notifications Not Sent**: Check email service configuration
- **SMS Notifications Failed**: Verify SMS service credentials

### 2. Debug Tools
- Browser developer tools for WebSocket debugging
- Network tab for API call monitoring
- Console logs for notification events
- User preference validation

## Testing

### 1. Unit Tests
- Notification creation and handling
- Preference management
- WebSocket connection handling

### 2. Integration Tests
- End-to-end notification flow
- Multi-channel delivery
- User preference updates

### 3. Performance Tests
- WebSocket connection limits
- Notification delivery speed
- System load testing

## Deployment Checklist

### 1. Environment Setup
- [ ] WebSocket server configuration
- [ ] Email service credentials
- [ ] SMS service credentials
- [ ] Database schema setup

### 2. Security Configuration
- [ ] SSL/TLS for WebSocket connections
- [ ] API key management
- [ ] Rate limiting configuration
- [ ] User authentication setup

### 3. Monitoring Setup
- [ ] Notification delivery monitoring
- [ ] Error tracking and alerting
- [ ] Performance metrics
- [ ] User engagement analytics

This notification system provides a robust foundation for keeping users engaged and informed about their learning journey on the SkillLift platform.
