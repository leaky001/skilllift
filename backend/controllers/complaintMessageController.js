const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');
const { sendEmail } = require('../utils/sendEmail');

// ===== COMPLAINTS CONTROLLER =====

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private
exports.submitComplaint = asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    category,
    priority,
    relatedCourse,
    relatedUser,
    evidence
  } = req.body;

  // Validate required fields
  if (!type || !title || !description || !category) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Handle evidence uploads
  let processedEvidence = [];
  if (req.files && req.files.length > 0) {
    try {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'skilllift/complaints/evidence',
          use_filename: true,
          unique_filename: true
        });
        
        processedEvidence.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'document',
          url: result.secure_url,
          description: file.originalname,
          uploadedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Evidence upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload evidence files'
      });
    }
  }

  // Create complaint
  const complaint = await Complaint.create({
    user: req.user._id,
    type,
    title,
    description,
    category,
    priority: priority || 'medium',
    relatedCourse,
    relatedUser,
    evidence: processedEvidence
  });

  // Notify admins
  try {
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        sender: req.user._id,
        type: 'complaint_submitted',
        title: 'New Complaint Submitted',
        message: `${req.user.name} submitted a complaint: "${title}"`,
        data: {
          complaintId: complaint._id,
          complaintType: type,
          category: category,
          priority: complaint.priority
        }
      });

      // Send email notification to admin
      await sendEmail({
        to: admin.email,
        subject: '🚨 New Complaint Submitted - SkillLift',
        template: 'complaintSubmitted',
        data: {
          adminName: admin.name,
          complainantName: req.user.name,
          complaintTitle: title,
          complaintType: type,
          category: category,
          priority: complaint.priority,
          complaintUrl: `${process.env.FRONTEND_URL}/admin/complaints/${complaint._id}`
        }
      });
    }
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }

  res.status(201).json({
    success: true,
    data: complaint,
    message: 'Complaint submitted successfully'
  });
});

// @desc    Get complaints by user
// @route   GET /api/complaints/my-complaints
// @access  Private
exports.getMyComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority } = req.query;

  const complaints = await Complaint.getByStatus(status, {
    userId: req.user._id,
    category,
    priority
  });

  res.json({
    success: true,
    data: complaints,
    count: complaints.length
  });
});

// @desc    Get complaint details
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id)
    .populate('user', 'name email avatar')
    .populate('relatedCourse', 'title thumbnail')
    .populate('relatedUser', 'name email')
    .populate('assignedTo', 'name email')
    .populate('adminResponses.admin', 'name email');

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if user owns the complaint or is admin
  if (complaint.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this complaint'
    });
  }

  res.json({
    success: true,
    data: complaint
  });
});

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
exports.updateComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if user owns the complaint
  if (complaint.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this complaint'
    });
  }

  // Check if complaint can be updated
  if (!complaint.canBeUpdatedByUser()) {
    return res.status(400).json({
      success: false,
      message: 'This complaint cannot be updated'
    });
  }

  const updatedComplaint = await Complaint.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedComplaint,
    message: 'Complaint updated successfully'
  });
});

// @desc    Assign complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint can be assigned
  if (!complaint.canBeAssigned()) {
    return res.status(400).json({
      success: false,
      message: 'This complaint cannot be assigned'
    });
  }

  // Verify assigned user exists and is admin
  const assignedUser = await User.findById(assignedTo);
  if (!assignedUser || assignedUser.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Invalid assigned user'
    });
  }

  complaint.assignedTo = assignedTo;
  complaint.assignedAt = new Date();
  complaint.assignedBy = req.user._id;
  complaint.status = 'assigned';
  await complaint.save();

  // Notify assigned admin
  try {
    await Notification.create({
      recipient: assignedTo,
      sender: req.user._id,
      type: 'complaint_assigned',
      title: 'Complaint Assigned to You',
      message: `You have been assigned complaint: "${complaint.title}"`,
      data: {
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        priority: complaint.priority
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }

  res.json({
    success: true,
    data: complaint,
    message: 'Complaint assigned successfully'
  });
});

// @desc    Resolve complaint
// @route   PUT /api/complaints/:id/resolve
// @access  Private (Admin)
exports.resolveComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution, actionTaken } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint can be resolved
  if (!complaint.canBeResolved()) {
    return res.status(400).json({
      success: false,
      message: 'This complaint cannot be resolved'
    });
  }

  complaint.status = 'resolved';
  complaint.resolution = resolution;
  complaint.actionTaken = actionTaken;
  complaint.resolvedAt = new Date();
  complaint.resolvedBy = req.user._id;
  await complaint.save();

  // Notify complainant
  try {
    await Notification.create({
      recipient: complaint.user,
      sender: req.user._id,
      type: 'complaint_resolved',
      title: 'Complaint Resolved',
      message: `Your complaint "${complaint.title}" has been resolved`,
      data: {
        complaintId: complaint._id,
        resolution: resolution,
        actionTaken: actionTaken
      }
    });

    // Send email notification
    const complainant = await User.findById(complaint.user);
    await sendEmail({
      to: complainant.email,
      subject: '✅ Complaint Resolved - SkillLift',
      template: 'complaintResolved',
      data: {
        name: complainant.name,
        complaintTitle: complaint.title,
        resolution: resolution,
        actionTaken: actionTaken,
        complaintUrl: `${process.env.FRONTEND_URL}/complaints/${complaint._id}`
      }
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }

  res.json({
    success: true,
    data: complaint,
    message: 'Complaint resolved successfully'
  });
});

// @desc    Close complaint
// @route   PUT /api/complaints/:id/close
// @access  Private (Admin)
exports.closeComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  // Check if complaint can be closed
  if (!complaint.canBeClosed()) {
    return res.status(400).json({
      success: false,
      message: 'This complaint cannot be closed'
    });
  }

  complaint.status = 'closed';
  complaint.closedAt = new Date();
  complaint.closedBy = req.user._id;
  await complaint.save();

  res.json({
    success: true,
    data: complaint,
    message: 'Complaint closed successfully'
  });
});

// @desc    Add admin response
// @route   POST /api/complaints/:id/response
// @access  Private (Admin)
exports.addAdminResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { response, isInternal = false } = req.body;

  const complaint = await Complaint.findById(id);
  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: 'Complaint not found'
    });
  }

  complaint.adminResponses.push({
    admin: req.user._id,
    response,
    isInternal,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify complainant if not internal
  if (!isInternal) {
    try {
      await Notification.create({
        recipient: complaint.user,
        sender: req.user._id,
        type: 'complaint_response',
        title: 'Response to Your Complaint',
        message: `Admin responded to your complaint: "${complaint.title}"`,
        data: {
          complaintId: complaint._id,
          response: response
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  res.json({
    success: true,
    data: complaint,
    message: 'Response added successfully'
  });
});

// @desc    Get complaint statistics
// @route   GET /api/complaints/statistics
// @access  Private (Admin)
exports.getComplaintStatistics = asyncHandler(async (req, res) => {
  const { category, priority, dateFrom, dateTo } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (priority) filters.priority = priority;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const statistics = await Complaint.getStatistics(filters);

  res.json({
    success: true,
    data: statistics[0] || {}
  });
});

// ===== MESSAGING CONTROLLER =====

// @desc    Send message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const {
    receiver,
    subject,
    content,
    messageType = 'general',
    course,
    isReplyTo
  } = req.body;

  // Validate required fields
  if (!receiver || !subject || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Verify receiver exists
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found'
    });
  }

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    receiver,
    subject,
    content,
    messageType,
    course,
    isReplyTo
  });

  // Send notification to receiver
  try {
    await Notification.create({
      recipient: receiver,
      sender: req.user._id,
      type: 'message_received',
      title: 'New Message',
      message: `${req.user.name} sent you a message: "${subject}"`,
      data: {
        messageId: message._id,
        senderName: req.user.name,
        subject: subject
      }
    });

    // Send email notification
    await sendEmail({
      to: receiverUser.email,
      subject: `📧 New Message from ${req.user.name} - SkillLift`,
      template: 'messageReceived',
      data: {
        name: receiverUser.name,
        senderName: req.user.name,
        subject: subject,
        content: content,
        messageUrl: `${process.env.FRONTEND_URL}/messages/${message._id}`
      }
    });
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }

  res.status(201).json({
    success: true,
    data: message,
    message: 'Message sent successfully'
  });
});

// @desc    Get messages
// @route   GET /api/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { type = 'received', messageType, course, isRead } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  
  if (type === 'received') {
    query.receiver = req.user._id;
  } else if (type === 'sent') {
    query.sender = req.user._id;
  }

  if (messageType) query.messageType = messageType;
  if (course) query.course = course;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const messages = await Message.find(query)
    .populate('sender', 'name email profilePicture')
    .populate('receiver', 'name email profilePicture')
    .populate('course', 'title thumbnail')
    .populate('isReplyTo', 'subject')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments(query);

  res.json({
    success: true,
    data: messages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get message details
// @route   GET /api/messages/:id
// @access  Private
exports.getMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id)
    .populate('sender', 'name email profilePicture')
    .populate('receiver', 'name email profilePicture')
    .populate('course', 'title thumbnail')
    .populate('isReplyTo', 'subject content');

  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is sender or receiver
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this message'
    });
  }

  // Mark as read if user is receiver
  if (message.receiver._id.toString() === req.user._id.toString() && !message.isRead) {
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
  }

  res.json({
    success: true,
    data: message
  });
});

// @desc    Reply to message
// @route   POST /api/messages/:id/reply
// @access  Private
exports.replyToMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const originalMessage = await Message.findById(id);
  if (!originalMessage) {
    return res.status(404).json({
      success: false,
      message: 'Original message not found'
    });
  }

  // Check if user is sender or receiver of original message
  if (originalMessage.sender._id.toString() !== req.user._id.toString() && 
      originalMessage.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to reply to this message'
    });
  }

  // Determine receiver (opposite of original message)
  const receiver = originalMessage.sender._id.toString() === req.user._id.toString() 
    ? originalMessage.receiver._id 
    : originalMessage.sender._id;

  // Create reply
  const reply = await Message.create({
    sender: req.user._id,
    receiver,
    subject: `Re: ${originalMessage.subject}`,
    content,
    messageType: 'reply',
    course: originalMessage.course,
    isReplyTo: originalMessage._id
  });

  // Send notification
  try {
    await Notification.create({
      recipient: receiver,
      sender: req.user._id,
      type: 'message_reply',
      title: 'Message Reply',
      message: `${req.user.name} replied to your message`,
      data: {
        messageId: reply._id,
        originalMessageId: originalMessage._id,
        senderName: req.user.name
      }
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }

  res.status(201).json({
    success: true,
    data: reply,
    message: 'Reply sent successfully'
  });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is sender or receiver
  if (message.sender._id.toString() !== req.user._id.toString() && 
      message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to delete this message'
    });
  }

  await Message.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }

  // Check if user is receiver
  if (message.receiver._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to mark this message as read'
    });
  }

  message.isRead = true;
  message.readAt = new Date();
  await message.save();

  res.json({
    success: true,
    data: message,
    message: 'Message marked as read'
  });
});

module.exports = {
  // Complaints
  submitComplaint: exports.submitComplaint,
  getMyComplaints: exports.getMyComplaints,
  getComplaint: exports.getComplaint,
  updateComplaint: exports.updateComplaint,
  assignComplaint: exports.assignComplaint,
  resolveComplaint: exports.resolveComplaint,
  closeComplaint: exports.closeComplaint,
  addAdminResponse: exports.addAdminResponse,
  getComplaintStatistics: exports.getComplaintStatistics,
  
  // Messages
  sendMessage: exports.sendMessage,
  getMessages: exports.getMessages,
  getMessage: exports.getMessage,
  replyToMessage: exports.replyToMessage,
  deleteMessage: exports.deleteMessage,
  markAsRead: exports.markAsRead
};
