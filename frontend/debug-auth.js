// Simple test to check authentication
console.log('🔐 Authentication Test');
console.log('Token:', localStorage.getItem('token'));
console.log('Token exists:', !!localStorage.getItem('token'));

// Test if we can decode the token (basic check)
const token = localStorage.getItem('token');
if (token) {
  try {
    // Basic JWT decode (without verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('User ID:', payload.id);
  } catch (error) {
    console.error('Token decode error:', error);
  }
}
