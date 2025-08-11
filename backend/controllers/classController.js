const Class = require('../models/Class');

exports.createClass = async (req, res) => {
  try {
    const newClass = new Class({ ...req.body, tutor: req.user._id });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Create class failed', error });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate('tutor', 'name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get classes', error });
  }
};
