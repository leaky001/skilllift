const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  feedback: String,
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
