const asyncHandler = require('express-async-handler');


exports.generateCertificate = asyncHandler(async (req, res) => {
  const { userId, courseTitle } = req.body;
  res.json({ message: `Certificate generated for ${userId} - ${courseTitle}` });
});
