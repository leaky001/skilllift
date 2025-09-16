const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// Get user's transactions
exports.getMyTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, status, page = 1, limit = 10 } = req.query;

  try {
    const filter = { user: userId };
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('course', 'title thumbnail')
      .populate('tutor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get specific transaction
exports.getTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const userId = req.user._id;

  try {
    const transaction = await Transaction.findById(transactionId)
      .populate('course', 'title thumbnail description')
      .populate('tutor', 'name email avatar')
      .populate('user', 'name email avatar');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user owns this transaction or is the tutor
    if (transaction.user._id.toString() !== userId && 
        transaction.tutor._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

// Get tutor payouts
exports.getTutorPayouts = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  try {
    const filter = { 
      tutor: tutorId, 
      type: 'payout' 
    };
    if (status && status !== 'all') filter.status = status;

    const skip = (page - 1) * limit;

    const payouts = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payouts',
      error: error.message
    });
  }
});

// Request payout
exports.requestPayout = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
  const { amount, paymentMethod, bankDetails } = req.body;

  try {
    // Check if tutor account is approved
    const tutor = await User.findById(tutorId);
    if (tutor.accountStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Account approval required before requesting payouts'
      });
    }

    // Check available balance
    const availableBalance = await calculateAvailableBalance(tutorId);
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₦${availableBalance.toLocaleString()}`
      });
    }

    // Check minimum withdrawal amount
    const minWithdrawal = 5000; // ₦5,000 minimum
    if (amount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₦${minWithdrawal.toLocaleString()}`
      });
    }

    // Check if there's a pending payout
    const pendingPayout = await Transaction.findOne({
      tutor: tutorId,
      type: 'payout',
      status: 'pending'
    });

    if (pendingPayout) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payout request'
      });
    }

    // Create payout transaction
    const payout = new Transaction({
      user: tutorId,
      tutor: tutorId,
      type: 'payout',
      amount: amount,
      status: 'pending',
      paymentMethod: paymentMethod,
      bankDetails: bankDetails,
      description: `Payout request for ₦${amount.toLocaleString()}`,
      metadata: {
        requestType: 'manual',
        requestDate: new Date()
      }
    });

    await payout.save();

    // Send notification to admin
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      const notification = new Notification({
        user: admin._id,
        type: 'payout_request',
        title: 'New Payout Request',
        message: `Tutor ${tutor.name} has requested a payout of ₦${amount.toLocaleString()}`,
        data: {
          tutorId: tutorId,
          payoutId: payout._id,
          amount: amount
        }
      });
      await notification.save();
    }

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: payout
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request payout',
      error: error.message
    });
  }
});

// Get tutor earnings
exports.getTutorEarnings = asyncHandler(async (req, res) => {
  const tutorId = req.user._id;
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

    // Get successful course purchases
    const courseEarnings = await Transaction.aggregate([
      {
        $match: {
          tutor: tutorId,
          type: 'course_purchase',
          status: 'completed',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$tutorAmount' },
          totalTransactions: { $sum: 1 },
          totalCommission: { $sum: '$commission' }
        }
      }
    ]);

    // Get completed payouts
    const completedPayouts = await Transaction.aggregate([
      {
        $match: {
          tutor: tutorId,
          type: 'payout',
          status: 'completed',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: '$amount' },
          payoutCount: { $sum: 1 }
        }
      }
    ]);

    // Get pending payouts
    const pendingPayouts = await Transaction.aggregate([
      {
        $match: {
          tutor: tutorId,
          type: 'payout',
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: '$amount' },
          pendingCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate available balance
    const availableBalance = await calculateAvailableBalance(tutorId);

    const earnings = {
      totalEarnings: courseEarnings[0]?.totalEarnings || 0,
      totalTransactions: courseEarnings[0]?.totalTransactions || 0,
      totalCommission: courseEarnings[0]?.totalCommission || 0,
      totalPayouts: completedPayouts[0]?.totalPayouts || 0,
      payoutCount: completedPayouts[0]?.payoutCount || 0,
      totalPending: pendingPayouts[0]?.totalPending || 0,
      pendingCount: pendingPayouts[0]?.pendingCount || 0,
      availableBalance: availableBalance
    };

    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
});

// Get all transactions (admin only)
exports.getAllTransactions = asyncHandler(async (req, res) => {
  const { type, status, userId, tutorId, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (userId) filter.user = userId;
    if (tutorId) filter.tutor = tutorId;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .populate('tutor', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get pending payouts (admin only)
exports.getPendingPayouts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const payouts = await Transaction.find({
      type: 'payout',
      status: 'pending'
    })
      .populate('tutor', 'name email avatar tutorProfile')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments({
      type: 'payout',
      status: 'pending'
    });

    res.json({
      success: true,
      data: payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payouts',
      error: error.message
    });
  }
});

// Process payout (admin only)
exports.processPayout = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { status, adminNotes, paymentReference } = req.body;
  const adminId = req.user._id;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.type !== 'payout') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not a payout'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout is not pending'
      });
    }

    // Update transaction status
    transaction.status = status;
    transaction.processedAt = new Date();
    transaction.processedBy = adminId;
    transaction.adminNotes = adminNotes;
    transaction.paymentReference = paymentReference;

    if (status === 'completed') {
      transaction.metadata = {
        ...transaction.metadata,
        completedAt: new Date(),
        adminId: adminId
      };
    } else if (status === 'rejected') {
      transaction.metadata = {
        ...transaction.metadata,
        rejectedAt: new Date(),
        adminId: adminId,
        rejectionReason: adminNotes
      };
    }

    await transaction.save();

    // Send notification to tutor
    const notification = new Notification({
      user: transaction.tutor,
      type: 'payout_update',
      title: `Payout ${status === 'completed' ? 'Processed' : 'Rejected'}`,
      message: status === 'completed' 
        ? `Your payout of ₦${transaction.amount.toLocaleString()} has been processed successfully.`
        : `Your payout request has been rejected: ${adminNotes}`,
      data: {
        payoutId: transaction._id,
        amount: transaction.amount,
        status: status,
        paymentReference: paymentReference
      }
    });
    await notification.save();

    res.json({
      success: true,
      message: `Payout ${status} successfully`,
      data: transaction
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payout',
      error: error.message
    });
  }
});

// Get transaction statistics
exports.getTransactionStatistics = asyncHandler(async (req, res) => {
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
    const overallStats = await Transaction.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalCommission: { $sum: '$commission' }
        }
      }
    ]);

    // Transaction type breakdown
    const typeBreakdown = await Transaction.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Transaction.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const stats = {
      overview: overallStats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        totalCommission: 0
      },
      typeBreakdown,
      statusBreakdown,
      monthlyTrends
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
});

// Process refund
exports.processRefund = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { reason, refundAmount, adminNotes } = req.body;
  const adminId = req.user._id;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.type !== 'course_purchase') {
      return res.status(400).json({
        success: false,
        message: 'Only course purchases can be refunded'
      });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not completed'
      });
    }

    // Check if refund amount is valid
    if (refundAmount > transaction.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed transaction amount'
      });
    }

    // Create refund transaction
    const refund = new Transaction({
      user: transaction.user,
      course: transaction.course,
      tutor: transaction.tutor,
      type: 'refund',
      amount: refundAmount,
      status: 'completed',
      description: `Refund for ${transaction.description}`,
      metadata: {
        originalTransaction: transactionId,
        reason: reason,
        adminNotes: adminNotes,
        processedBy: adminId,
        processedAt: new Date()
      }
    });

    await refund.save();

    // Update original transaction
    transaction.status = 'refunded';
    transaction.metadata = {
      ...transaction.metadata,
      refunded: true,
      refundAmount: refundAmount,
      refundReason: reason,
      refundedAt: new Date(),
      refundedBy: adminId
    };

    await transaction.save();

    // Update course enrollment if full refund
    // Assuming Enrollment model exists and is imported
    // const Enrollment = require('../models/Enrollment'); 
    // if (refundAmount === transaction.amount) {
    //   await Enrollment.findOneAndUpdate(
    //     {
    //       user: transaction.user,
    //       course: transaction.course
    //     },
    //     {
    //       status: 'refunded',
    //       refundedAt: new Date()
    //     }
    //   );
    // }

    // Send notification to user
    const notification = new Notification({
      user: transaction.user,
      type: 'refund_processed',
      title: 'Refund Processed',
      message: `Your refund of ₦${refundAmount.toLocaleString()} has been processed. Reason: ${reason}`,
      data: {
        transactionId: transactionId,
        refundId: refund._id,
        amount: refundAmount,
        reason: reason
      }
    });
    await notification.save();

    // Send notification to tutor
    const tutorNotification = new Notification({
      user: transaction.tutor,
      type: 'refund_processed',
      title: 'Refund Processed',
      message: `A refund has been processed for your course. Amount: ₦${refundAmount.toLocaleString()}`,
      data: {
        transactionId: transactionId,
        refundId: refund._id,
        amount: refundAmount,
        reason: reason
      }
    });
    await tutorNotification.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        originalTransaction: transaction,
        refund: refund
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// Helper function to calculate available balance
async function calculateAvailableBalance(tutorId) {
  try {
    // Get total earnings from successful course purchases
    const totalEarnings = await Transaction.aggregate([
      {
        $match: {
          tutor: tutorId,
          type: 'course_purchase',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$tutorAmount' }
        }
      }
    ]);

    // Get total completed payouts
    const totalPayouts = await Transaction.aggregate([
      {
        $match: {
          tutor: tutorId,
          type: 'payout',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const earnings = totalEarnings[0]?.total || 0;
    const payouts = totalPayouts[0]?.total || 0;

    return Math.max(0, earnings - payouts);
  } catch (error) {
    console.error('Error calculating available balance:', error);
    return 0;
  }
}
