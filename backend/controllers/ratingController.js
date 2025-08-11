
const Rating = require('../models/Rating');

exports.rateTutor = async (req, res) => {
  try {
    const { tutor, rating, comment } = req.body;
    const newRating = new Rating({
      user: req.user._id,
      tutor,
      rating,
      comment,
    });
    await newRating.save();
    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: 'Rating failed', error });
  }
};
