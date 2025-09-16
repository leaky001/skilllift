const asyncHandler = require('express-async-handler');
const Installment = require('../models/Installment');
const Course = require('../models/Course');
const User = require('../models/User');
const axios = require('axios');

// Get all installments for a course
exports.getInstallments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  try {
    const installments = await Installment.find({
      course: courseId,
      learner: userId
    }).sort({ installmentNumber: 1 });

    res.json({
      success: true,
      data: installments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch installments',
      error: error.message
    });
  }
});

// Get installment summary
exports.getInstallmentSummary = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  try {
    const summary = await Installment.getInstallmentSummary(courseId, userId);
    
    if (summary.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No installment plan found for this course'
      });
    }

    const data = summary[0];
    const progress = (data.paidInstallments / data.totalInstallments) * 100;

    res.json({
      success: true,
      data: {
        ...data,
        progress: Math.round(progress),
        remainingInstallments: data.totalInstallments - data.paidInstallments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch installment summary',
      error: error.message
    });
  }
});

// Get specific installment details
exports.getInstallmentDetails = asyncHandler(async (req, res) => {
  const { courseId, installmentId } = req.params;
  const userId = req.user._id;

  try {
    const installment = await Installment.findOne({
      _id: installmentId,
      course: courseId,
      learner: userId
    }).populate('course', 'title price');

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Installment not found'
      });
    }

    res.json({
      success: true,
      data: installment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch installment details',
      error: error.message
    });
  }
});

// Pay installment
exports.payInstallment = asyncHandler(async (req, res) => {
  const { courseId, installmentId } = req.params;
  const userId = req.user._id;
  const { email } = req.body;

  try {
    // Get installment details
    const installment = await Installment.findOne({
      _id: installmentId,
      course: courseId,
      learner: userId
    }).populate('course', 'title price');

    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Installment not found'
      });
    }

    if (installment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Installment already paid'
      });
    }

    // Check if Paystack is configured
    if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
      return res.status(400).json({
        success: false,
        message: 'Paystack is not configured. Please set up your Paystack API keys in the .env file.'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize Paystack payment for installment
    const paystackData = {
      amount: installment.amount * 100, // Convert to kobo
      email: email || user.email,
      reference: `INST_${Date.now()}_${userId}_${courseId}_${installment.installmentNumber}`,
      callback_url: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/payment/verify`,
      metadata: {
        courseId: courseId,
        userId: userId,
        courseTitle: installment.course.title,
        installmentId: installment._id,
        installmentNumber: installment.installmentNumber,
        totalInstallments: installment.totalInstallments,
        paymentType: 'installment'
      }
    };

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      paystackData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (paystackResponse.data.status) {
      // Update installment with payment reference
      installment.paystackReference = paystackData.reference;
      await installment.save();

      res.json({
        success: true,
        message: `Installment ${installment.installmentNumber} payment initialized`,
        data: {
          authorizationUrl: paystackResponse.data.data.authorization_url,
          reference: paystackData.reference,
          installmentId: installment._id,
          amount: installment.amount,
          dueDate: installment.dueDate
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize installment payment'
      });
    }
  } catch (error) {
    console.error('Installment payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Installment payment failed',
      error: error.message
    });
  }
});

// Verify installment payment (called after Paystack callback)
exports.verifyInstallmentPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  try {
    // Find installment by reference
    const installment = await Installment.findOne({ paystackReference: reference });
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: 'Installment payment not found'
      });
    }

    // 🔧 MOCK VERIFICATION FOR TESTING
    if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_PAYMENT === 'true') {
      console.log('🔧 Using mock installment verification for testing');
      
      // Update installment status
      installment.status = 'paid';
      installment.paidAt = new Date();
      await installment.save();

      // Check if all installments are paid
      const allInstallments = await Installment.find({
        course: installment.course,
        learner: installment.learner
      });

      const allPaid = allInstallments.every(inst => inst.status === 'paid');

      return res.json({
        success: true,
        message: `Installment ${installment.installmentNumber} paid successfully`,
        data: {
          installment: installment,
          allPaid: allPaid,
          totalInstallments: allInstallments.length,
          paidInstallments: allInstallments.filter(inst => inst.status === 'paid').length
        }
      });
    }

    // Real Paystack verification
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
      // Update installment status
      installment.status = 'paid';
      installment.paidAt = new Date();
      await installment.save();

      // Check if all installments are paid
      const allInstallments = await Installment.find({
        course: installment.course,
        learner: installment.learner
      });

      const allPaid = allInstallments.every(inst => inst.status === 'paid');

      res.json({
        success: true,
        message: `Installment ${installment.installmentNumber} paid successfully`,
        data: {
          installment: installment,
          allPaid: allPaid,
          totalInstallments: allInstallments.length,
          paidInstallments: allInstallments.filter(inst => inst.status === 'paid').length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Installment payment verification failed'
      });
    }
  } catch (error) {
    console.error('Installment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Installment verification failed',
      error: error.message
    });
  }
});
