const http = require('http');

console.log('🔍 Testing simple server...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Simple server is running! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Test response:');
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('❌ Simple server connection failed:', error.message);
});

req.end();
