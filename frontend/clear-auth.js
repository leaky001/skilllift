// Simple script to clear authentication data
// Run this in browser console if you need to clear auth data

console.log('🧹 Clearing authentication data...');

// Clear localStorage
localStorage.removeItem('skilllift_user');
localStorage.removeItem('token');

// Clear sessionStorage
sessionStorage.clear();

console.log('✅ Authentication data cleared!');
console.log('🔄 Please refresh the page to see the login screen.');

// Optional: redirect to login
// window.location.href = '/login';
