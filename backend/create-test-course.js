// Create a test course for the current user
const mongoose = require('mongoose');
const Course = require('./models/Course');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createTestCourse = async () => {
  try {
    await connectDB();
    
    const userId = '68c43ef8de60ec7155428df9'; // Your user ID from the token
    
    const testCourse = new Course({
      title: 'Test Course for Replays',
      description: 'This is a test course to test replay uploads',
      tutor: userId,
      category: 'web-development',
      subcategory: 'frontend',
      level: 'beginner',
      price: 0,
      duration: '2 hours',
      language: 'English',
      status: 'published',
      publishedAt: new Date()
    });
    
    const savedCourse = await testCourse.save();
    console.log('✅ Test course created:', {
      id: savedCourse._id,
      title: savedCourse.title,
      tutor: savedCourse.tutor
    });
    
  } catch (error) {
    console.error('❌ Error creating test course:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createTestCourse();
