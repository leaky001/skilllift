const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkTutorProfile() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find a tutor and check their profile
    const tutor = await User.findOne({ role: 'tutor' });
    
    if (!tutor) {
      console.log('❌ No tutor found');
      return;
    }
    
    console.log('👤 Tutor found:');
    console.log(`   Name: ${tutor.name}`);
    console.log(`   Email: ${tutor.email}`);
    console.log(`   Role: ${tutor.role}`);
    console.log(`   Has tutorProfile: ${!!tutor.tutorProfile}`);
    
    if (tutor.tutorProfile) {
      console.log(`   KYC Status: ${tutor.tutorProfile.kycStatus}`);
      console.log(`   Has kycDocuments: ${!!tutor.tutorProfile.kycDocuments}`);
    } else {
      console.log('❌ Tutor has no tutorProfile - this is the issue!');
      
      // Fix it
      tutor.tutorProfile = {
        skills: [],
        experience: '',
        bio: '',
        previewVideo: '',
        totalEarnings: 0,
        totalStudents: 0,
        kycStatus: 'pending',
        kycDocuments: {}
      };
      
      await tutor.save();
      console.log('✅ Fixed tutorProfile');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkTutorProfile();
