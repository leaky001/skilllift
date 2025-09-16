const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// Submit a complaint/report
exports.submitComplaint = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { 
    type, 
    title, 
    description, 
    category, 
    priority, 
    relatedCourseId, 
    relatedUserId,
    evidence 
  } = req.body;

  try {
    // Validate required fields
    if (!type || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, title, description, category'
      });
    }

    // Check if user has submitted too many complaints recently
    const recentComplaints = await Complaint.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    if (recentComplaints >= 5) {
      return res.status(429).json({
        success: false,
        message: 'You have submitted too many complaints recently. Please wait before submitting another.'
      });
    }

    // Create complaint
    const complaint = new Complaint({
      user: userId,
      type,
      title,
      description,
      category,
      priority: priority || 'medium',
      relatedCourse: relatedCourseId,
      relatedUser: relatedUserId,
      evidence: evidence || [],
      status: 'pending',
      submittedAt: new Date()
    });

    await complaint.save();

    // Send notification to admins
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const notification = new Notification({
        user: admin._id,
        type: 'new_complaint',
        title: 'New Complaint Submitted',
        message: `A new ${priority || 'medium'} priority complaint has been submitted: ${title}`,
        data: {
          complaintId: complaint._id,
          type: type,
          category: category,
          priority: priority || 'medium'
        }
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
});

// Get user's complaints
exports.getMyComplaints = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, category, page = 1, limit = 10 } = req.query;

  try {
    const filter = { user: userId };
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('relatedCourse', 'title thumbnail')
      .populate('relatedUser', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
});

// Get specific complaint
exports.getComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId)
      .populate('user', 'name email avatar')
      .populate('relatedCourse', 'title thumbnail description')
      .populate('relatedUser', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user owns this complaint or is admin
    const user = await User.findById(userId);
    if (complaint.user._id.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
});

// Update complaint (for users)
exports.updateComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const userId = req.user._id;
  const { description, evidence } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user owns this complaint
    if (complaint.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if complaint can be updated
    if (complaint.status !== 'pending' && complaint.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be updated in its current status'
      });
    }

    // Update complaint
    if (description) complaint.description = description;
    if (evidence) complaint.evidence = evidence;
    complaint.updatedAt = new Date();

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: error.message
    });
  }
});

// Get all complaints (admin only)
exports.getAllComplaints = asyncHandler(async (req, res) => {
  const { 
    status, 
    category, 
    priority, 
    type, 
    assignedTo, 
    page = 1, 
    limit = 20 
  } = req.query;

  try {
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;
    if (type && type !== 'all') filter.type = type;
    if (assignedTo && assignedTo !== 'all') filter.assignedTo = assignedTo;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email')
      .populate('relatedCourse', 'title')
      .populate('relatedUser', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ 
        priority: -1, // High priority first
        submittedAt: -1 
      })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      data: complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
});

// Assign complaint to admin (admin only)
exports.assignComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { assignedTo, notes } = req.body;
  const adminId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify assignedTo is an admin
    const assignedAdmin = await User.findById(assignedTo);
    if (!assignedAdmin || assignedAdmin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign to admin users'
      });
    }

    // Update complaint
    complaint.assignedTo = assignedTo;
    complaint.status = 'assigned';
    complaint.assignedAt = new Date();
    complaint.assignedBy = adminId;
    complaint.adminNotes = notes || '';

    await complaint.save();

    // Send notification to assigned admin
    const notification = new Notification({
      user: assignedTo,
      type: 'complaint_assigned',
      title: 'Complaint Assigned',
      message: `A complaint has been assigned to you: ${complaint.title}`,
      data: {
        complaintId: complaint._id,
        title: complaint.title,
        priority: complaint.priority
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
      error: error.message
    });
  }
});

// Update complaint status (admin only)
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { status, adminNotes, resolution, actionTaken } = req.body;
  const adminId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint
    complaint.status = status;
    complaint.adminNotes = adminNotes || complaint.adminNotes;
    complaint.resolution = resolution || complaint.resolution;
    complaint.actionTaken = actionTaken || complaint.actionTaken;
    complaint.updatedAt = new Date();

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = adminId;
    } else if (status === 'under_review') {
      complaint.reviewStartedAt = new Date();
      complaint.reviewStartedBy = adminId;
    }

    await complaint.save();

    // Send notification to user
    const notification = new Notification({
      user: complaint.user,
      type: 'complaint_update',
      title: `Complaint ${status.replace('_', ' ')}`,
      message: `Your complaint "${complaint.title}" has been updated to: ${status}`,
      data: {
        complaintId: complaint._id,
        status: status,
        resolution: resolution
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
});

// Add admin response to complaint (admin only)
exports.addAdminResponse = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { response, isInternal } = req.body;
  const adminId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add response
    const adminResponse = {
      admin: adminId,
      response,
      isInternal: isInternal || false,
      timestamp: new Date()
    };

    complaint.adminResponses.push(adminResponse);
    complaint.updatedAt = new Date();

    await complaint.save();

    // Send notification to user if not internal
    if (!isInternal) {
      const notification = new Notification({
        user: complaint.user,
        type: 'complaint_response',
        title: 'Admin Response to Your Complaint',
        message: `An admin has responded to your complaint: "${complaint.title}"`,
        data: {
          complaintId: complaint._id,
          response: response
        }
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
});

// Close complaint (admin only)
exports.closeComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const { resolution, actionTaken, adminNotes } = req.body;
  const adminId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint
    complaint.status = 'closed';
    complaint.resolution = resolution;
    complaint.actionTaken = actionTaken;
    complaint.adminNotes = adminNotes || complaint.adminNotes;
    complaint.closedAt = new Date();
    complaint.closedBy = adminId;

    await complaint.save();

    // Send notification to user
    const notification = new Notification({
      user: complaint.user,
      type: 'complaint_closed',
      title: 'Complaint Closed',
      message: `Your complaint "${complaint.title}" has been closed. Resolution: ${resolution}`,
      data: {
        complaintId: complaint._id,
        resolution: resolution,
        actionTaken: actionTaken
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Complaint closed successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error closing complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close complaint',
      error: error.message
    });
  }
});

// Get complaint statistics
exports.getComplaintStatistics = asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;

  try {
    let dateFilter = {};
    
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case '7days':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30days':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '90days':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case 'thisMonth':
          dateFilter = { 
            $gte: new Date(now.getFullYear(), now.getMonth(), 1) 
          };
          break;
        case 'thisYear':
          dateFilter = { 
            $gte: new Date(now.getFullYear(), 0, 1) 
          };
          break;
      }
    }

    // Overall statistics
    const overallStats = await Complaint.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { submittedAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pendingComplaints: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          underReviewComplaints: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
          resolvedComplaints: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closedComplaints: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]);

    // Category breakdown
    const categoryBreakdown = await Complaint.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { submittedAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Priority breakdown
    const priorityBreakdown = await Complaint.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { submittedAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Complaint.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { submittedAt: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const stats = {
      overview: overallStats[0] || {
        totalComplaints: 0,
        pendingComplaints: 0,
        underReviewComplaints: 0,
        resolvedComplaints: 0,
        closedComplaints: 0
      },
      categoryBreakdown,
      priorityBreakdown,
      monthlyTrends
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching complaint statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint statistics',
      error: error.message
    });
  }
});

// Delete complaint (admin only)
exports.deleteComplaint = asyncHandler(async (req, res) => {
  const { complaintId } = req.params;
  const adminId = req.user._id;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if complaint can be deleted
    if (complaint.status !== 'closed' && complaint.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Only closed or resolved complaints can be deleted'
      });
    }

    await Complaint.findByIdAndDelete(complaintId);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
      error: error.message
    });
  }
});
