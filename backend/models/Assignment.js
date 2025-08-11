const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  fileUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
