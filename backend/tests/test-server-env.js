const express = require('express');
const cors = require('cors');

// Set default environment variables if .env is missing
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'skilllift_jwt_secret_key_2024_make_it_long_and_random_for_security';
  console.log('⚠️  Using default JWT_SECRET');
}

if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/skilllift';
  console.log('⚠️  Using default MONGO_URI');
}

if (!process.env.PORT) {
  process.env.PORT = 5000;
}

if (!process.env.USE_MOCK_PAYMENT && process.env.NODE_ENV === 'development') {
  process.env.USE_MOCK_PAYMENT = 'true';
  console.log('⚠️  Using default USE_MOCK_PAYMENT = true for development');
}

console.log('Starting server with fallback environment variables...');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
    MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
    USE_MOCK_PAYMENT: process.env.USE_MOCK_PAYMENT
  });
});
