require('dotenv').config();
const jwt = require('jsonwebtoken');

// Create a test token for the tutor
const tutorId = '68c84b9067287d08e49e1264'; // From the course data
const testToken = jwt.sign(
  { 
    id: tutorId,
    role: 'tutor',
    email: 'abdulkabir0600@gmail.com'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('🔑 Test token created:');
console.log(testToken);
console.log('\n📋 Use this token to test the API:');
console.log(`curl -H "Authorization: Bearer ${testToken}" http://localhost:5000/api/courses/68c8520c0fec18aa4b8e1015`);

