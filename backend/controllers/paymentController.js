const Payment = require('../models/Payment');

exports.recordPayment = async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const payment = new Payment({ user: req.user._id, amount, method, reference });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Payment failed', error });
  }
};
