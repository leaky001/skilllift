const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';

async function checkDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('skilllift');
    const coursesCollection = db.collection('courses');
    const usersCollection = db.collection('users');
    
    // Check courses
    const courses = await coursesCollection.find({}).toArray();
    console.log(`📚 Total courses in database: ${courses.length}`);
    
    if (courses.length > 0) {
      console.log('\n📋 All courses:');
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Tutor: ${course.tutor}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Approved: ${course.isApproved}`);
        console.log('');
      });
    }
    
    // Check tutors
    const tutors = await usersCollection.find({ role: 'tutor' }).toArray();
    console.log(`👨‍🏫 Total tutors: ${tutors.length}`);
    
    if (tutors.length > 0) {
      console.log('\n👨‍🏫 Tutors:');
      tutors.forEach((tutor, index) => {
        console.log(`${index + 1}. ${tutor.name} (${tutor.email}) - ID: ${tutor._id}`);
      });
      
      // Check courses for first tutor
      const firstTutorId = tutors[0]._id;
      console.log(`\n🔍 Courses for tutor ${firstTutorId}:`);
      
      const tutorCourses = await coursesCollection.find({ tutor: firstTutorId }).toArray();
      console.log(`📚 Found ${tutorCourses.length} courses for this tutor`);
      
      if (tutorCourses.length > 0) {
        tutorCourses.forEach((course, index) => {
          console.log(`${index + 1}. ${course.title} - ${course.status}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

checkDatabase();
