// Paystack Test Configuration
const paystackConfig = {
  // Test Mode Configuration
  testMode: true,
  baseUrl: 'https://api.paystack.co',
  
  // Test Keys (Replace with your actual test keys)
  secretKey: process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
  
  // Platform Settings
  platformCommission: 15, // 15% commission for admin
  platformName: 'SkillLift',
  platformEmail: 'noreply@skilllift.com',
  
  // Test Card Numbers (for testing)
  testCards: {
    success: '4084084084084081',
    declined: '4084084084084085',
    insufficient: '4084084084084082',
    expired: '4084084084084083'
  },
  
  // Test Amounts (in kobo - 1 NGN = 100 kobo)
  testAmounts: {
    min: 1000, // 10 NGN
    max: 1000000, // 10,000 NGN
    default: 50000 // 500 NGN
  }
};

module.exports = paystackConfig;
