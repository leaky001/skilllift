
const getUsers = (req, res) => {
  res.status(200).json({
    message: 'Users fetched successfully',
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
    ]
  });
};


const createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Please provide name and email' });
  }

  res.status(201).json({
    message: 'User created successfully',
    user: { id: Date.now(), name, email }
  });
};

module.exports = {
  getUsers,
  createUser
};
