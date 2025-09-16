const http = require('http');

console.log('🔍 Testing backend connection...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Health check response:');
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('❌ Backend connection failed:', error.message);
  console.log('💡 Make sure the backend is running with: node server.js');
});

req.end();
