const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB with longer timeout
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

const sampleCourses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB from scratch. Build real projects and get hired as a web developer.",
    category: "Technology",
    subcategory: "Web Development",
    price: 25000,
    level: "beginner",
    language: "English",
    courseType: "online-prerecorded",
    duration: "45 hours",
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
    previewVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    content: [
      {
        title: "Introduction to Web Development",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      },
      {
        title: "HTML Fundamentals",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      }
    ],
    prerequisites: ["Basic computer knowledge", "No programming experience required"],
    learningOutcomes: ["Build responsive websites", "Create web applications", "Deploy to production"],
    tags: ["web development", "javascript", "react", "nodejs"],
    status: "published",
    isApproved: true,
    approvedAt: new Date(),
    publishedAt: new Date(),
    totalEnrollments: 45,
    rating: 4.8,
    totalRatings: 23
  },
  {
    title: "Advanced JavaScript Mastery",
    description: "Master modern JavaScript ES6+, async programming, design patterns, and advanced concepts for professional development.",
    category: "Technology",
    subcategory: "Programming",
    price: 18000,
    level: "advanced",
    language: "English",
    courseType: "online-prerecorded",
    duration: "32 hours",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    previewVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    content: [
      {
        title: "ES6+ Features",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      },
      {
        title: "Async Programming",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      }
    ],
    prerequisites: ["Basic JavaScript knowledge", "Understanding of programming concepts"],
    learningOutcomes: ["Master ES6+ features", "Understand async programming", "Apply design patterns"],
    tags: ["javascript", "es6", "async", "design patterns"],
    status: "published",
    isApproved: true,
    approvedAt: new Date(),
    publishedAt: new Date(),
    totalEnrollments: 12,
    rating: 4.9,
    totalRatings: 18
  },
  {
    title: "Digital Marketing Fundamentals",
    description: "Learn SEO, social media marketing, email marketing, and content strategy to grow your business online.",
    category: "Marketing",
    subcategory: "Digital Marketing",
    price: 15000,
    level: "beginner",
    language: "English",
    courseType: "online-prerecorded",
    duration: "28 hours",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    previewVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    content: [
      {
        title: "SEO Basics",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      },
      {
        title: "Social Media Strategy",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      }
    ],
    prerequisites: ["Basic computer skills", "Interest in marketing"],
    learningOutcomes: ["Implement SEO strategies", "Create social media campaigns", "Develop content plans"],
    tags: ["marketing", "seo", "social media", "content"],
    status: "published",
    isApproved: true,
    approvedAt: new Date(),
    publishedAt: new Date(),
    totalEnrollments: 78,
    rating: 4.7,
    totalRatings: 34
  },
  {
    title: "UI/UX Design Principles",
    description: "Master user interface and user experience design with practical projects and industry best practices.",
    category: "Arts & Design",
    subcategory: "Design",
    price: 22000,
    level: "intermediate",
    language: "English",
    courseType: "online-prerecorded",
    duration: "38 hours",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    previewVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    content: [
      {
        title: "Design Fundamentals",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      },
      {
        title: "User Research Methods",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      }
    ],
    prerequisites: ["Basic design knowledge", "Familiarity with design tools"],
    learningOutcomes: ["Create user-centered designs", "Conduct user research", "Prototype and test"],
    tags: ["ui", "ux", "design", "user research"],
    status: "pending",
    isApproved: false,
    totalEnrollments: 0,
    rating: 0,
    totalRatings: 0
  },
  {
    title: "Python Data Science Bootcamp",
    description: "Learn Python programming, data analysis, machine learning, and visualization for data science careers.",
    category: "Technology",
    subcategory: "Data Science",
    price: 30000,
    level: "intermediate",
    language: "English",
    courseType: "online-prerecorded",
    duration: "50 hours",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    previewVideo: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    content: [
      {
        title: "Python Basics",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      },
      {
        title: "Data Analysis with Pandas",
        type: "video",
        url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        size: 1024000
      }
    ],
    prerequisites: ["Basic programming knowledge", "Understanding of mathematics"],
    learningOutcomes: ["Analyze data with Python", "Build machine learning models", "Create data visualizations"],
    tags: ["python", "data science", "machine learning", "pandas"],
    status: "pending",
    isApproved: false,
    totalEnrollments: 0,
    rating: 0,
    totalRatings: 0
  }
];

async function createSampleCourses() {
  try {
    console.log('🔍 Finding a tutor user...');
    
    // Find a tutor user to assign courses to
    const tutor = await User.findOne({ role: 'tutor' });
    
    if (!tutor) {
      console.log('❌ No tutor found. Creating a sample tutor...');
      const sampleTutor = new User({
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'tutor',
        accountStatus: 'approved',
        tutorProfile: {
          bio: 'Experienced web developer and instructor',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          rating: 4.8
        }
      });
      await sampleTutor.save();
      console.log('✅ Created sample tutor:', sampleTutor._id);
    }
    
    const tutorId = tutor ? tutor._id : (await User.findOne({ role: 'tutor' }))._id;
    console.log('✅ Using tutor ID:', tutorId);
    
    console.log('🗑️ Clearing existing sample courses...');
    await Course.deleteMany({ 
      title: { 
        $in: sampleCourses.map(course => course.title) 
      } 
    });
    
    console.log('📚 Creating sample courses...');
    
    for (const courseData of sampleCourses) {
      const course = new Course({
        ...courseData,
        tutor: tutorId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await course.save();
      console.log(`✅ Created course: ${course.title} (${course.status})`);
    }
    
    console.log('🎉 Sample courses created successfully!');
    console.log('📊 Summary:');
    console.log(`   - 3 approved courses (published)`);
    console.log(`   - 2 pending courses (under review)`);
    console.log(`   - All courses assigned to tutor: ${tutorId}`);
    
    // Display the created courses
    const createdCourses = await Course.find({ 
      title: { $in: sampleCourses.map(c => c.title) } 
    }).select('title status isApproved totalEnrollments rating');
    
    console.log('\n📋 Created Courses:');
    createdCourses.forEach(course => {
      console.log(`   - ${course.title}`);
      console.log(`     Status: ${course.status} (${course.isApproved ? 'Approved' : 'Pending'})`);
      console.log(`     Enrollments: ${course.totalEnrollments}, Rating: ${course.rating}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error creating sample courses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createSampleCourses();
