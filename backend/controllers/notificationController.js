
exports.getNotifications = async (req, res) => {
  try {

    res.status(200).json({ message: 'Fetched notifications' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    
    res.status(201).json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
