const Mentorship = require('../models/Mentorship');
const User = require('../models/User');

exports.applyForMentorship = async (req, res) => {
  try {
    const { mentorId, reason } = req.body;

    if (!mentorId || !reason) {
      return res.status(400).json({ message: 'Mentor ID and reason are required' });
    }

    const mentorship = new Mentorship({
      mentee: req.user._id,
      mentor: mentorId,
      reason
    });

    await mentorship.save();
    res.status(201).json({ message: 'Mentorship request sent successfully', mentorship });
  } catch (error) {
    res.status(500).json({ message: 'Mentorship request failed', error: error.message });
  }
};

// Get mentorship requests (either for mentee or mentor)
exports.getMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await Mentorship.find({
      $or: [{ mentee: userId }, { mentor: userId }]
    }).populate('mentee mentor', 'name email role');

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mentorship requests', error: error.message });
  }
};

// Respond to mentorship request (accept or reject)
exports.respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const mentorship = await Mentorship.findById(id);

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship request not found' });
    }

    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    mentorship.status = status;
    await mentorship.save();

    res.status(200).json({ message: `Mentorship request ${status}`, mentorship });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to mentorship request', error: error.message });
  }
};
