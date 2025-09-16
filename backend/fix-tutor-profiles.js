const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixTutorProfiles() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find tutors without tutorProfile
    const tutorsWithoutProfile = await User.find({ 
      role: 'tutor',
      tutorProfile: { $exists: false }
    });
    
    console.log(`📊 Found ${tutorsWithoutProfile.length} tutors without tutorProfile`);
    
    for (const tutor of tutorsWithoutProfile) {
      console.log(`👤 Fixing tutor: ${tutor.name} (${tutor.email})`);
      
      // Initialize tutorProfile with default values
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
      console.log(`✅ Fixed tutor: ${tutor.name}`);
    }
    
    // Also check tutors with incomplete tutorProfile
    const tutorsWithIncompleteProfile = await User.find({ 
      role: 'tutor',
      'tutorProfile.kycStatus': { $exists: false }
    });
    
    console.log(`📊 Found ${tutorsWithIncompleteProfile.length} tutors with incomplete tutorProfile`);
    
    for (const tutor of tutorsWithIncompleteProfile) {
      console.log(`👤 Fixing incomplete profile: ${tutor.name} (${tutor.email})`);
      
      // Ensure kycStatus exists
      if (!tutor.tutorProfile.kycStatus) {
        tutor.tutorProfile.kycStatus = 'pending';
      }
      
      // Ensure kycDocuments exists
      if (!tutor.tutorProfile.kycDocuments) {
        tutor.tutorProfile.kycDocuments = {};
      }
      
      await tutor.save();
      console.log(`✅ Fixed incomplete profile: ${tutor.name}`);
    }
    
    console.log('\n🎉 All tutor profiles fixed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixTutorProfiles();
