const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testKYCSubmission() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find a tutor user
    const tutor = await User.findOne({ role: 'tutor' });
    
    if (!tutor) {
      console.log('❌ No tutor found');
      return;
    }
    
    console.log('👤 Tutor found:');
    console.log(`   Name: ${tutor.name}`);
    console.log(`   Email: ${tutor.email}`);
    console.log(`   Role: ${tutor.role}`);
    console.log(`   Current KYC Status: ${tutor.tutorProfile?.kycStatus || 'pending'}`);
    
    // Test the submitKYC method
    const testDocuments = {
      idDocumentType: 'passport',
      addressDocumentType: 'utility_bill',
      notes: 'Test KYC submission',
      idDocument: 'test-id-doc.pdf',
      addressDocument: 'test-address-doc.pdf',
      profilePhoto: 'test-photo.jpg'
    };
    
    console.log('\n🧪 Testing KYC submission...');
    await tutor.submitKYC(testDocuments);
    
    console.log('✅ KYC submission successful!');
    console.log(`   New KYC Status: ${tutor.tutorProfile.kycStatus}`);
    console.log(`   Submitted At: ${tutor.tutorProfile.kycDocuments.submittedAt}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testKYCSubmission();
