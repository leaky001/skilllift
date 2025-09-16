const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const Course = require('./models/Course');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB with longer timeout
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

const sampleAssignments = [
  {
    title: "HTML & CSS Portfolio Project",
    description: "Create a responsive portfolio website using HTML and CSS. This project will test your understanding of layout, styling, and responsive design principles.",
    assignmentType: "project",
    instructions: "Build a personal portfolio website with at least 3 sections: Home, About, and Projects. Use CSS Grid and Flexbox for layout. Make it responsive for mobile, tablet, and desktop screens. Include hover effects and smooth transitions.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    points: 100,
    weight: 20,
    submissionType: "file",
    allowedFileTypes: ["pdf", "zip"],
    maxFileSize: 50,
    maxSubmissions: 2,
    allowLateSubmission: true,
    latePenalty: 5,
    resources: [
      {
        title: "CSS Grid Tutorial",
        url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
        description: "Complete guide to CSS Grid"
      },
      {
        title: "Flexbox Guide",
        url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        description: "Complete guide to Flexbox"
      }
    ],
    rubric: [
      {
        criterion: "HTML Structure",
        points: 25,
        description: "Proper semantic HTML with clean, well-organized code"
      },
      {
        criterion: "CSS Styling",
        points: 30,
        description: "Attractive design with consistent styling and responsive layout"
      },
      {
        criterion: "Responsive Design",
        points: 25,
        description: "Website works well on all screen sizes"
      },
      {
        criterion: "Code Quality",
        points: 20,
        description: "Clean, commented, and well-structured code"
      }
    ],
    status: "published",
    isVisible: true,
    publishedAt: new Date(),
    totalSubmissions: 12,
    averageScore: 87,
    tags: ["html", "css", "portfolio", "responsive"]
  },
  {
    title: "JavaScript Fundamentals Quiz",
    description: "Test your knowledge of JavaScript basics including variables, functions, arrays, and object manipulation.",
    assignmentType: "quiz",
    instructions: "Complete the 20-question multiple choice quiz covering JavaScript fundamentals. You have 30 minutes to complete the quiz. Each question is worth 5 points.",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    points: 100,
    weight: 15,
    submissionType: "multiple-choice",
    maxSubmissions: 1,
    allowLateSubmission: false,
    resources: [
      {
        title: "JavaScript Basics",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        description: "MDN JavaScript Guide"
      }
    ],
    rubric: [
      {
        criterion: "Variables & Data Types",
        points: 25,
        description: "Understanding of var, let, const and primitive types"
      },
      {
        criterion: "Functions",
        points: 25,
        description: "Function declaration, expressions, and arrow functions"
      },
      {
        criterion: "Arrays & Objects",
        points: 25,
        description: "Array methods and object manipulation"
      },
      {
        criterion: "Control Flow",
        points: 25,
        description: "Conditionals, loops, and error handling"
      }
    ],
    status: "published",
    isVisible: true,
    publishedAt: new Date(),
    totalSubmissions: 18,
    averageScore: 92,
    tags: ["javascript", "quiz", "fundamentals"]
  },
  {
    title: "React Component Library",
    description: "Build a reusable component library using React. Create components that can be used across different projects.",
    assignmentType: "project",
    instructions: "Create a component library with at least 5 reusable components: Button, Card, Modal, Form, and Navigation. Use TypeScript for type safety. Include proper documentation and examples for each component. Publish to npm or create a GitHub repository.",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    points: 150,
    weight: 25,
    submissionType: "link",
    maxSubmissions: 1,
    allowLateSubmission: true,
    latePenalty: 10,
    resources: [
      {
        title: "React Documentation",
        url: "https://react.dev/",
        description: "Official React documentation"
      },
      {
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/",
        description: "TypeScript official documentation"
      }
    ],
    rubric: [
      {
        criterion: "Component Design",
        points: 30,
        description: "Well-designed, reusable components with proper props"
      },
      {
        criterion: "TypeScript Implementation",
        points: 25,
        description: "Proper TypeScript usage with interfaces and types"
      },
      {
        criterion: "Documentation",
        points: 25,
        description: "Clear documentation and usage examples"
      },
      {
        criterion: "Code Quality",
        points: 20,
        description: "Clean, maintainable code with proper testing"
      }
    ],
    status: "published",
    isVisible: true,
    publishedAt: new Date(),
    totalSubmissions: 8,
    averageScore: 89,
    tags: ["react", "typescript", "components", "library"]
  },
  {
    title: "Digital Marketing Strategy Analysis",
    description: "Analyze a real company's digital marketing strategy and provide recommendations for improvement.",
    assignmentType: "assessment",
    instructions: "Choose a company and analyze their current digital marketing strategy. Research their social media presence, SEO, content marketing, and paid advertising. Create a comprehensive report with findings and recommendations. Include data and metrics where possible.",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    points: 120,
    weight: 20,
    submissionType: "file",
    allowedFileTypes: ["pdf", "docx"],
    maxFileSize: 20,
    maxSubmissions: 1,
    allowLateSubmission: true,
    latePenalty: 8,
    resources: [
      {
        title: "Digital Marketing Tools",
        url: "https://www.semrush.com/",
        description: "SEO and competitive analysis tools"
      },
      {
        title: "Social Media Analytics",
        url: "https://analytics.google.com/",
        description: "Google Analytics for website traffic"
      }
    ],
    rubric: [
      {
        criterion: "Research Quality",
        points: 30,
        description: "Thorough research with credible sources and data"
      },
      {
        criterion: "Analysis Depth",
        points: 35,
        description: "Comprehensive analysis of marketing strategies"
      },
      {
        criterion: "Recommendations",
        points: 25,
        description: "Practical and actionable recommendations"
      },
      {
        criterion: "Presentation",
        points: 10,
        description: "Clear, professional report format"
      }
    ],
    status: "draft",
    isVisible: false,
    totalSubmissions: 0,
    averageScore: 0,
    tags: ["marketing", "analysis", "strategy", "digital"]
  },
  {
    title: "UI/UX Design Critique",
    description: "Conduct a detailed critique of a mobile app's user interface and user experience design.",
    assignmentType: "homework",
    instructions: "Download and use a mobile app of your choice. Conduct a thorough UI/UX analysis covering usability, accessibility, visual design, and user flow. Create a detailed report with screenshots and specific recommendations for improvement.",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    points: 80,
    weight: 15,
    submissionType: "file",
    allowedFileTypes: ["pdf", "pptx"],
    maxFileSize: 15,
    maxSubmissions: 1,
    allowLateSubmission: false,
    resources: [
      {
        title: "UI/UX Principles",
        url: "https://www.nngroup.com/articles/",
        description: "Nielsen Norman Group articles on UX"
      },
      {
        title: "Design Critique Framework",
        url: "https://www.interaction-design.org/",
        description: "Interaction Design Foundation resources"
      }
    ],
    rubric: [
      {
        criterion: "Analysis Framework",
        points: 25,
        description: "Use of proper UI/UX evaluation methods"
      },
      {
        criterion: "Critical Thinking",
        points: 30,
        description: "Insightful analysis and identification of issues"
      },
      {
        criterion: "Recommendations",
        points: 25,
        description: "Practical and well-reasoned improvement suggestions"
      },
      {
        criterion: "Documentation",
        points: 20,
        description: "Clear documentation with visual evidence"
      }
    ],
    status: "draft",
    isVisible: false,
    totalSubmissions: 0,
    averageScore: 0,
    tags: ["ui", "ux", "design", "critique", "mobile"]
  }
];

async function createSampleAssignments() {
  try {
    console.log('🔍 Finding a tutor and courses...');
    
    // Find a tutor user
    const tutor = await User.findOne({ role: 'tutor' });
    if (!tutor) {
      console.log('❌ No tutor found. Please create a tutor account first.');
      return;
    }
    
    console.log('✅ Using tutor:', tutor.name);
    
    // Find published courses for this tutor
    const courses = await Course.find({ 
      tutor: tutor._id, 
      status: 'published',
      isApproved: true 
    });
    
    if (courses.length === 0) {
      console.log('❌ No published courses found for this tutor. Please create and approve courses first.');
      return;
    }
    
    console.log(`✅ Found ${courses.length} published courses`);
    
    console.log('🗑️ Clearing existing sample assignments...');
    await Assignment.deleteMany({ 
      title: { 
        $in: sampleAssignments.map(assignment => assignment.title) 
      } 
    });
    
    console.log('📝 Creating sample assignments...');
    
    for (let i = 0; i < sampleAssignments.length; i++) {
      const assignmentData = sampleAssignments[i];
      const course = courses[i % courses.length]; // Distribute assignments across courses
      
      const assignment = new Assignment({
        ...assignmentData,
        course: course._id,
        tutor: tutor._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await assignment.save();
      console.log(`✅ Created assignment: ${assignment.title} (${assignment.status}) for course: ${course.title}`);
    }
    
    console.log('🎉 Sample assignments created successfully!');
    console.log('📊 Summary:');
    console.log(`   - 3 published assignments`);
    console.log(`   - 2 draft assignments`);
    console.log(`   - All assignments assigned to tutor: ${tutor.name}`);
    
    // Display the created assignments
    const createdAssignments = await Assignment.find({ 
      title: { $in: sampleAssignments.map(a => a.title) } 
    }).populate('course', 'title').select('title status course totalSubmissions averageScore');
    
    console.log('\n📋 Created Assignments:');
    createdAssignments.forEach(assignment => {
      console.log(`   - ${assignment.title}`);
      console.log(`     Status: ${assignment.status} (${assignment.isVisible ? 'Visible' : 'Hidden'})`);
      console.log(`     Course: ${assignment.course.title}`);
      console.log(`     Submissions: ${assignment.totalSubmissions}, Avg Score: ${assignment.averageScore}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error creating sample assignments:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

createSampleAssignments();
