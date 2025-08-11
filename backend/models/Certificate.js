const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseTitle: String,
  issuedAt: Date,
  certificateUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
