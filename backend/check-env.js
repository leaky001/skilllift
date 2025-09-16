require('dotenv').config();

console.log('🔍 Environment Variables Check:');
console.log('================================');

// Check JWT Secret
if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET is set');
  console.log('   Length:', process.env.JWT_SECRET.length);
  console.log('   Preview:', process.env.JWT_SECRET.substring(0, 10) + '...');
} else {
  console.log('❌ JWT_SECRET is NOT set');
  console.log('   Setting default JWT secret...');
  process.env.JWT_SECRET = 'skilllift_jwt_secret_key_2024_make_it_long_and_random_for_security';
  console.log('✅ Default JWT_SECRET set');
}

// Check other important variables
console.log('\n📋 Other Environment Variables:');
console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('   CORS_ORIGIN:', process.env.CORS_ORIGIN || 'http://localhost:5173 (default)');

// Test JWT functionality
const jwt = require('jsonwebtoken');

try {
  const testToken = jwt.sign({ id: 'test', role: 'learner' }, process.env.JWT_SECRET);
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('\n✅ JWT functionality test passed');
  console.log('   Test token created and verified successfully');
} catch (error) {
  console.log('\n❌ JWT functionality test failed');
  console.log('   Error:', error.message);
}

console.log('\n🎯 Environment check complete!');
