const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Apply for mentorship (Learner only)
// @route   POST /api/mentorship
// @access  Private (Learner)
exports.applyForMentorship = asyncHandler(async (req, res, next) => {
  const { requestMessage, goals, skills, schedule, pricing } = req.body;
  const learnerId = req.user._id;

  if (!requestMessage) {
    return next(new ErrorResponse('Request message is required', 400));
  }

  const mentorship = new Mentorship({
    learner: learnerId,
    requestMessage,
    goals: goals || [],
    skills: skills || [],
    schedule: schedule || {},
    pricing: pricing || { type: 'hourly', amount: 0, currency: 'NGN' }
  });

  await mentorship.save();

  // Create notification for admin
  await Notification.create({
    recipient: await getAdminUserId(),
    sender: learnerId,
    type: 'mentorship_request',
    title: 'New Mentorship Request',
    message: `A new mentorship request has been submitted by ${req.user.name}`,
    priority: 'medium',
    data: { mentorshipId: mentorship._id }
  });

  res.status(201).json({
    success: true,
    data: mentorship,
    message: 'Mentorship request submitted successfully and awaiting admin review'
  });
});

// @desc    Get learner's mentorships
// @route   GET /api/mentorship/learner
// @access  Private (Learner)
exports.getLearnerMentorships = asyncHandler(async (req, res, next) => {
  const learnerId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  let query = { learner: learnerId };

  if (status && status !== 'all') {
    query.status = status;
  }

  const mentorships = await Mentorship.find(query)
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Mentorship.countDocuments(query);

  res.status(200).json({
    success: true,
    data: mentorships,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Update mentorship (Learner only)
// @route   PUT /api/mentorship/:id
// @access  Private (Learner)
exports.updateMentorship = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const learnerId = req.user._id;
  const { requestMessage, goals, skills, schedule, pricing } = req.body;

  const mentorship = await Mentorship.findOne({ _id: id, learner: learnerId });

  if (!mentorship) {
    return next(new ErrorResponse('Mentorship not found', 404));
  }

  if (mentorship.status !== 'pending') {
    return next(new ErrorResponse('Cannot update non-pending mentorship', 400));
  }

  if (requestMessage) mentorship.requestMessage = requestMessage;
  if (goals) mentorship.goals = goals;
  if (skills) mentorship.skills = skills;
  if (schedule) mentorship.schedule = schedule;
  if (pricing) mentorship.pricing = pricing;

  await mentorship.save();

  res.status(200).json({
    success: true,
    data: mentorship,
    message: 'Mentorship updated successfully'
  });
});

// @desc    Cancel mentorship (Learner only)
// @route   PUT /api/mentorship/:id/cancel
// @access  Private (Learner)
exports.cancelMentorship = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const learnerId = req.user._id;

  const mentorship = await Mentorship.findOne({ _id: id, learner: learnerId });

  if (!mentorship) {
    return next(new ErrorResponse('Mentorship not found', 404));
  }

  if (!['pending', 'active'].includes(mentorship.status)) {
    return next(new ErrorResponse('Cannot cancel this mentorship', 400));
  }

  await mentorship.cancel(reason, 'learner');

  // Create notification for admin
  await Notification.create({
    recipient: await getAdminUserId(),
    sender: learnerId,
    type: 'mentorship_cancelled',
    title: 'Mentorship Cancelled',
    message: `Mentorship ${id} has been cancelled by ${req.user.name}. Reason: ${reason}`,
    priority: 'medium',
    data: { mentorshipId: mentorship._id }
  });

  res.status(200).json({
    success: true,
    data: mentorship,
    message: 'Mentorship cancelled successfully'
  });
});

// @desc    Get all mentorship requests (Admin only)
// @route   GET /api/mentorship/admin
// @access  Private (Admin)
exports.getMentorshipRequests = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  const mentorships = await Mentorship.find(query)
    .populate('learner', 'name email avatar')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Mentorship.countDocuments(query);

  res.status(200).json({
    success: true,
    data: mentorships,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// Helper function to get admin user ID
const getAdminUserId = async () => {
  const admin = await User.findOne({ role: 'admin' });
  return admin ? admin._id : null;
};
