// Test Paystack Configuration
const paystackConfig = require('./config/paystackConfig');

console.log('🔍 Testing Paystack Configuration...');
console.log('='.repeat(50));

console.log('📋 Current Configuration:');
console.log('• Test Mode:', paystackConfig.testMode);
console.log('• Base URL:', paystackConfig.baseUrl);
console.log('• Secret Key:', paystackConfig.secretKey ? 'Set' : 'Not Set');
console.log('• Public Key:', paystackConfig.publicKey ? 'Set' : 'Not Set');
console.log('• Commission:', paystackConfig.platformCommission + '%');

console.log('\n🔧 Environment Variables:');
console.log('• PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? 'Set' : 'Not Set');
console.log('• PAYSTACK_PUBLIC_KEY:', process.env.PAYSTACK_PUBLIC_KEY ? 'Set' : 'Not Set');

console.log('\n❌ Issues Found:');
if (!process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET_KEY === 'sk_test_your_secret_key_here') {
  console.log('• PAYSTACK_SECRET_KEY not configured');
}
if (!process.env.PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC_KEY === 'pk_test_your_public_key_here') {
  console.log('• PAYSTACK_PUBLIC_KEY not configured');
}

console.log('\n✅ Solutions:');
console.log('1. Get Paystack test keys from: https://dashboard.paystack.com/#/settings/developers');
console.log('2. Add to .env file:');
console.log('   PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key');
console.log('   PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key');
console.log('3. Restart the server');

console.log('\n🧪 Test Mode Fallback:');
console.log('• If keys not set, system uses test mode simulation');
console.log('• Payments are simulated without real Paystack API');
console.log('• Good for development and testing');
