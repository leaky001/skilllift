const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String,
  address: String,
  idNumber: String,
  idDocumentUrl: String,
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);
