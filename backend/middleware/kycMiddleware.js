const KYC = require('../models/KYC');

exports.ensureKYCApproved = async (req, res, next) => {
  const kyc = await KYC.findOne({ user: req.user._id });
  if (!kyc || kyc.status !== 'approved') {
    return res.status(403).json({ message: 'KYC not approved' });
  }
  next();
};
