const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: String,
  description: String,
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
