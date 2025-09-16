const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

async function checkNotifications() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 60000,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check total notifications
    const totalNotifications = await Notification.countDocuments();
    console.log(`📊 Total notifications in database: ${totalNotifications}`);

    if (totalNotifications === 0) {
      console.log('⚠️ No notifications found in database');
      console.log('💡 This explains why the admin notifications page is empty');
      
      // Check if there are any users
      const totalUsers = await User.countDocuments();
      console.log(`👥 Total users in database: ${totalUsers}`);
      
      if (totalUsers > 0) {
        console.log('🔔 Creating some sample notifications...');
        
        // Create sample notifications
        const sampleNotifications = [
          {
            title: 'Welcome to SkillLift!',
            message: 'Welcome to the SkillLift platform. Start exploring courses and enhance your skills.',
            type: 'system',
            priority: 'medium',
            recipient: null, // System notification
            sender: null,
            isRead: false
          },
          {
            title: 'New Tutor Registration',
            message: 'A new tutor has registered and needs KYC verification.',
            type: 'new_tutor_registration',
            priority: 'high',
            recipient: null, // Admin notification
            sender: null,
            isRead: false
          },
          {
            title: 'KYC Submission Received',
            message: 'A tutor has submitted their KYC documents for review.',
            type: 'kyc_submitted',
            priority: 'medium',
            recipient: null, // Admin notification
            sender: null,
            isRead: false
          }
        ];
        
        const createdNotifications = await Notification.insertMany(sampleNotifications);
        console.log(`✅ Created ${createdNotifications.length} sample notifications`);
      }
    } else {
      // Show existing notifications
      const notifications = await Notification.find()
        .populate('recipient', 'name email role')
        .populate('sender', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log('\n📋 Recent notifications:');
      notifications.forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Priority: ${notification.priority || 'medium'}`);
        console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`);
        console.log(`   Created: ${notification.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkNotifications();
