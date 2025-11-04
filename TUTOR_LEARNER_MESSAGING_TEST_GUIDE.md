# Tutor-Learner Messaging System - Comprehensive Test Guide 🧪

## 🎯 **Test Objectives:**
- Verify message sending works both ways (tutor ↔ learner)
- Test real-time message delivery
- Confirm message persistence
- Validate notification system
- Check error handling and edge cases

## 📋 **Pre-Test Checklist:**

### **Prerequisites:**
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB database connected
- [ ] At least one tutor account created
- [ ] At least one learner account created
- [ ] Learner enrolled in tutor's course
- [ ] WebSocket connection working

### **Test Accounts Setup:**
- **Tutor Account**: Should have courses and enrolled learners
- **Learner Account**: Should be enrolled in tutor's course
- **Browser Setup**: Two different browsers or incognito windows

## 🧪 **Test Scenarios:**

### **Test 1: Basic Message Flow**

#### **1.1 Tutor to Learner Message:**
1. **Login as Tutor**
   - Navigate to messaging page
   - Select a learner from the list
   - Start conversation

2. **Send Message**
   - Type: "Hello [Learner Name], how are you doing with the assignment?"
   - Click send button
   - **Expected**: Message appears in tutor's chat immediately

3. **Verify on Learner Side**
   - Login as learner (different browser)
   - Navigate to messaging page
   - Select the tutor
   - **Expected**: Tutor's message should be visible
   - **Expected**: Notification should appear

#### **1.2 Learner to Tutor Message:**
1. **Send Reply**
   - Type: "Hi [Tutor Name], I'm doing well. I have a question about chapter 3."
   - Click send button
   - **Expected**: Message appears in learner's chat immediately

2. **Verify on Tutor Side**
   - Switch to tutor browser
   - **Expected**: Learner's message should appear in real-time
   - **Expected**: Notification should appear

### **Test 2: Real-Time Delivery**

#### **2.1 Simultaneous Messaging:**
1. **Open Both Windows Side by Side**
   - Tutor window on left
   - Learner window on right

2. **Send Messages Rapidly**
   - Tutor: "Can you share your progress?"
   - Learner: "Sure, I'll send it now"
   - Tutor: "Great, I'll review it"
   - Learner: "Thank you!"

3. **Expected Results:**
   - All messages appear instantly in both windows
   - No delays or missing messages
   - Messages appear in correct order

### **Test 3: Message Persistence**

#### **3.1 Refresh Test:**
1. **Send Several Messages**
   - Tutor: "Here's the assignment feedback"
   - Learner: "Thank you for the detailed feedback"
   - Tutor: "You're welcome, keep up the good work"

2. **Refresh Both Pages**
   - Refresh tutor's browser
   - Refresh learner's browser

3. **Expected Results:**
   - All messages should still be visible
   - Message history preserved
   - No duplicate messages

### **Test 4: Notification System**

#### **4.1 Message Notifications:**
1. **Send Message from Tutor**
   - Tutor sends: "Please check your email for the new materials"
   - **Expected**: Learner receives notification

2. **Send Message from Learner**
   - Learner sends: "I've submitted the assignment"
   - **Expected**: Tutor receives notification

3. **Check Notification Content:**
   - Notification should show sender name
   - Notification should show message preview
   - Notification should be clickable

### **Test 5: Error Handling**

#### **5.1 Network Issues:**
1. **Disconnect Internet**
   - Send message while offline
   - **Expected**: Error message appears
   - **Expected**: Message is queued for retry

2. **Reconnect Internet**
   - **Expected**: Queued message sends automatically
   - **Expected**: Normal messaging resumes

#### **5.2 Invalid Messages:**
1. **Send Empty Message**
   - Try to send empty message
   - **Expected**: Send button disabled
   - **Expected**: Error message appears

2. **Send Very Long Message**
   - Send message over 1000 characters
   - **Expected**: Message sends successfully
   - **Expected**: Notification shows preview with "..."

### **Test 6: Edge Cases**

#### **6.1 Multiple Conversations:**
1. **Create Multiple Chats**
   - Tutor chats with Learner A
   - Tutor chats with Learner B
   - **Expected**: Messages don't mix between conversations

#### **6.2 Typing Indicators:**
1. **Test Typing Status**
   - Start typing in tutor window
   - **Expected**: Learner sees "Tutor is typing..."
   - Stop typing
   - **Expected**: Typing indicator disappears

#### **6.3 Message Status:**
1. **Check Message States**
   - Sent messages should show "Sent" status
   - Delivered messages should show "Delivered"
   - Read messages should show "Read" (if implemented)

## 🔍 **Debug Information to Monitor:**

### **Backend Console Logs:**
```
🔌 User connected: [User Name] ([User ID])
💬 [User Name] joining conversation: [Conversation ID]
✅ [User Name] joined conversation: [Conversation ID]
💬 [User Name] sending message to conversation: [Conversation ID]
✅ Message sent by [User Name] to conversation: [Conversation ID]
📡 Broadcasting message via Socket.IO: [Message Data]
🔔 Notification sent to [User Name] for message from [Sender Name]
```

### **Frontend Console Logs:**
```
📨 Loading messages for conversation: [Conversation ID]
📨 Loaded messages data: [Response Data]
📨 Loaded X valid messages out of Y total
📤 Sending message data: [Message Data]
✅ Message sent via WebSocket
📨 Received Socket.IO message: [Message Data]
🔔 New notification received: [Notification Data]
```

## 🚨 **Common Issues and Solutions:**

### **Issue: Messages not appearing**
**Debug Steps:**
1. Check WebSocket connection status
2. Verify conversation room joining
3. Check browser console for errors
4. Ensure both users are in the same conversation

### **Issue: Messages not saving**
**Debug Steps:**
1. Check MongoDB connection
2. Verify ChatMessage model validation
3. Check database for saved messages
4. Ensure conversation exists

### **Issue: Notifications not working**
**Debug Steps:**
1. Check notification service status
2. Verify user notification preferences
3. Check browser notification permissions
4. Ensure notification types are correct

### **Issue: Real-time not working**
**Debug Steps:**
1. Check Socket.IO connection
2. Verify room joining/leaving
3. Check message broadcasting
4. Ensure event listeners are set up

## 📊 **Test Results Template:**

### **Test Results:**
- [ ] **Test 1.1**: Tutor to Learner Message - ✅/❌
- [ ] **Test 1.2**: Learner to Tutor Message - ✅/❌
- [ ] **Test 2.1**: Real-Time Delivery - ✅/❌
- [ ] **Test 3.1**: Message Persistence - ✅/❌
- [ ] **Test 4.1**: Notifications - ✅/❌
- [ ] **Test 5.1**: Error Handling - ✅/❌
- [ ] **Test 6.1**: Edge Cases - ✅/❌

### **Performance Metrics:**
- **Message Delivery Time**: < 1 second
- **Notification Delivery Time**: < 2 seconds
- **Page Load Time**: < 3 seconds
- **Message Persistence**: 100%

## 🎯 **Success Criteria:**

### **Must Have:**
- ✅ Messages send successfully both ways
- ✅ Real-time delivery works
- ✅ Messages persist after refresh
- ✅ Notifications appear
- ✅ No duplicate messages
- ✅ Proper error handling

### **Nice to Have:**
- ✅ Typing indicators work
- ✅ Message status indicators
- ✅ Offline message queuing
- ✅ Message search functionality

## 🚀 **Next Steps After Testing:**

1. **Document any issues found**
2. **Fix any bugs discovered**
3. **Optimize performance if needed**
4. **Add any missing features**
5. **Update documentation**

---

**Ready to Test!** 🚀

Follow this guide step by step to thoroughly test the tutor-learner messaging system. If you encounter any issues, use the debug information and solutions provided.

