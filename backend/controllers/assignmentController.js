const Assignment = require('../models/Assignment');

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = new Assignment({
      user: req.user._id,
      title: req.body.title,
      fileUrl: req.file?.path || '',
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Assignment submission failed', error });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Assignment.find().populate('user', 'name email');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve submissions', error });
  }
};
