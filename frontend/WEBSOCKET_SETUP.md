# WebSocket Setup Guide for Real-time Notifications

## Overview
This guide explains how to set up a WebSocket server for real-time notifications in SkillLift.

## Current Status
- WebSocket connections are **disabled by default** in development
- No WebSocket errors will be shown in the console
- Notifications still work through polling and browser notifications

## Enable WebSocket in Development

### Option 1: Environment Variable (Recommended)
Create a `.env` file in the `frontend` directory and add:
```
REACT_APP_ENABLE_WEBSOCKET=true
```

### Option 2: Modify NotificationContext
In `frontend/src/context/NotificationContext.jsx`, change line 175:
```javascript
const shouldConnectWebSocket = true; // Force enable WebSocket
```

## Setting Up WebSocket Server

### 1. Create WebSocket Server
Create a new file `backend/websocketServer.js`:

```javascript
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const userId = url.searchParams.get('userId');
  const role = url.searchParams.get('role');

  console.log(`Client connected: ${userId} (${role})`);

  // Store client connection
  clients.set(userId, { ws, role });

  ws.on('close', () => {
    console.log(`Client disconnected: ${userId}`);
    clients.delete(userId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${userId}:`, error);
    clients.delete(userId);
  });
});

// Function to send notification to specific user
const sendNotification = (userId, notification) => {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(notification));
    return true;
  }
  return false;
};

// Function to broadcast to all users of a specific role
const broadcastToRole = (role, notification) => {
  let sentCount = 0;
  clients.forEach((client, userId) => {
    if (client.role === role && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(notification));
      sentCount++;
    }
  });
  return sentCount;
};

// Function to broadcast to all connected users
const broadcastToAll = (notification) => {
  let sentCount = 0;
  clients.forEach((client, userId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(notification));
      sentCount++;
    }
  });
  return sentCount;
};

const PORT = process.env.WEBSOCKET_PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

module.exports = {
  sendNotification,
  broadcastToRole,
  broadcastToAll,
  clients
};
```

### 2. Install WebSocket Dependencies
In the `backend` directory:
```bash
npm install ws
```

### 3. Start WebSocket Server
```bash
node websocketServer.js
```

### 4. Integrate with Main Backend
In your main backend server, import and use the WebSocket functions:

```javascript
const { sendNotification, broadcastToRole } = require('./websocketServer');

// Example: Send notification when assignment is created
app.post('/api/assignments', async (req, res) => {
  // ... create assignment logic ...
  
  // Send notification to all learners
  const notification = {
    _id: `notification_${Date.now()}`,
    type: 'assignment_created',
    title: 'New Assignment Available',
    message: `New assignment "${assignment.title}" is now available`,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    read: false,
    data: { assignmentId: assignment._id, courseId: assignment.courseId }
  };
  
  broadcastToRole('learner', notification);
  
  res.json({ success: true, assignment });
});
```

## Notification Types

The system supports these notification types:
- `live_class_reminder` - Live class starting soon
- `assignment_due` - Assignment due date approaching
- `course_update` - Course content updated
- `payment_reminder` - Payment due
- `mentorship_request` - New mentorship request
- `certificate_ready` - Certificate available
- `system_update` - System maintenance
- `welcome` - Welcome message

## Testing WebSocket

### 1. Enable WebSocket in Frontend
Set `REACT_APP_ENABLE_WEBSOCKET=true` in `.env`

### 2. Start WebSocket Server
```bash
cd backend
node websocketServer.js
```

### 3. Test Connection
- Open browser console
- You should see "WebSocket connected for notifications"
- No more connection errors

### 4. Test Notifications
Use the browser console to test:
```javascript
// Send test notification to all users
fetch('http://localhost:3001/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'test',
    title: 'Test Notification',
    message: 'This is a test notification'
  })
});
```

## Production Deployment

### 1. Environment Variables
Set in production:
```
REACT_APP_ENABLE_WEBSOCKET=true
WEBSOCKET_PORT=3001
```

### 2. WebSocket URL
Update the WebSocket URL in `NotificationContext.jsx`:
```javascript
const wsUrl = `wss://yourdomain.com/notifications?userId=${user._id}&role=${user.role}`;
```

### 3. Load Balancer
Configure your load balancer to handle WebSocket connections:
- AWS ALB: Enable WebSocket support
- Nginx: Add WebSocket proxy configuration
- Cloudflare: Enable WebSocket support

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure WebSocket server is running
   - Check port 3001 is not blocked
   - Verify firewall settings

2. **CORS Issues**
   - WebSocket doesn't have CORS restrictions
   - Check if using correct protocol (ws:// vs wss://)

3. **Client Not Receiving Notifications**
   - Verify client is connected (check console logs)
   - Ensure correct user ID and role
   - Check notification preferences

4. **Memory Leaks**
   - WebSocket server automatically cleans up disconnected clients
   - Monitor memory usage in production

## Security Considerations

1. **Authentication**
   - Implement JWT token validation
   - Verify user permissions before sending notifications

2. **Rate Limiting**
   - Limit notification frequency per user
   - Implement spam protection

3. **Data Validation**
   - Validate all notification data
   - Sanitize user inputs

4. **HTTPS/WSS**
   - Use WSS in production
   - Secure WebSocket connections

## Performance Optimization

1. **Connection Pooling**
   - Reuse WebSocket connections
   - Implement connection limits

2. **Message Batching**
   - Batch multiple notifications
   - Reduce WebSocket traffic

3. **Monitoring**
   - Monitor connection count
   - Track notification delivery rates
   - Set up alerts for failures
