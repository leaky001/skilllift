const KYC = require('../models/KYC');
const cloudinary = require('../config/cloudinary');

exports.submitKYC = async (req, res) => {
  try {
    const { fullName, address, idNumber } = req.body;
    const userId = req.user._id;

    let uploadedFile;
    if (req.file) {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'kyc-docs',
      });
    }

    const kyc = new KYC({
      user: userId,
      fullName,
      address,
      idNumber,
      idDocumentUrl: uploadedFile?.secure_url || '',
    });

    await kyc.save();
    res.status(201).json(kyc);
  } catch (error) {
    res.status(500).json({ message: 'KYC submission failed', error });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });
    res.json(kyc);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get KYC status', error });
  }
};
