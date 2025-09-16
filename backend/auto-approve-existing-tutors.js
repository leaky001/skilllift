const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
require('dotenv').config();

async function autoApproveExistingTutors() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Find all tutors
    const tutors = await User.find({ role: 'tutor' });
    console.log(`📊 Found ${tutors.length} tutors`);

    let approvedCount = 0;
    let skippedCount = 0;

    for (const tutor of tutors) {
      // Check if tutor has created any courses
      const courseCount = await Course.countDocuments({ tutor: tutor._id });
      
      if (courseCount > 0) {
        // Auto-approve KYC for tutors with existing courses
        if (tutor.tutorProfile?.kycStatus !== 'approved') {
          tutor.tutorProfile = tutor.tutorProfile || {};
          tutor.tutorProfile.kycStatus = 'approved';
          tutor.tutorProfile.kycDocuments = tutor.tutorProfile.kycDocuments || {};
          tutor.tutorProfile.kycDocuments.reviewedAt = new Date();
          tutor.tutorProfile.kycDocuments.reviewedBy = null; // System approval
          tutor.tutorProfile.kycDocuments.notes = 'Auto-approved: Existing course creator';
          
          await tutor.save();
          console.log(`✅ Auto-approved KYC for ${tutor.name} (${courseCount} courses)`);
          approvedCount++;
        } else {
          console.log(`⏭️  Skipped ${tutor.name} - already approved`);
          skippedCount++;
        }
      } else {
        // New tutors without courses - keep pending KYC
        if (!tutor.tutorProfile?.kycStatus) {
          tutor.tutorProfile = tutor.tutorProfile || {};
          tutor.tutorProfile.kycStatus = 'pending';
          await tutor.save();
          console.log(`⏳ Set KYC to pending for new tutor: ${tutor.name}`);
        }
        skippedCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Auto-approved: ${approvedCount} tutors`);
    console.log(`⏭️  Skipped: ${skippedCount} tutors`);
    console.log('🎉 Auto-approval process completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
autoApproveExistingTutors();
