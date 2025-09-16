const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api'; // Change port if needed

async function createSampleLiveSessions() {
  console.log('🎥 Creating sample live sessions...\n');

  const sampleSessions = [
    {
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript in this comprehensive live session.",
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      duration: 120,
      maxStudents: 25,
      price: 0,
      meetingPlatform: "zoom",
      meetingLink: "https://zoom.us/j/123456789",
      meetingId: "123456789",
      meetingPassword: "webdev123",
      waitingRoom: true,
      autoRecord: true,
      chatEnabled: true,
      screenSharingEnabled: true,
      pollsEnabled: true,
      category: "Web Development",
      level: "beginner",
      isPublic: true,
      status: "scheduled"
    },
    {
      title: "Advanced React Patterns",
      description: "Deep dive into advanced React patterns, hooks, and performance optimization.",
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      duration: 180,
      maxStudents: 20,
      price: 50,
      meetingPlatform: "google-meet",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      meetingId: "abc-defg-hij",
      meetingPassword: "react2024",
      waitingRoom: true,
      autoRecord: true,
      chatEnabled: true,
      screenSharingEnabled: true,
      pollsEnabled: true,
      category: "Frontend Development",
      level: "advanced",
      isPublic: true,
      status: "scheduled"
    },
    {
      title: "Data Science Fundamentals",
      description: "Introduction to Python, pandas, and basic data analysis techniques.",
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
      duration: 150,
      maxStudents: 30,
      price: 25,
      meetingPlatform: "teams",
      meetingLink: "https://teams.microsoft.com/l/meetup-join/...",
      meetingId: "teams-meeting-123",
      meetingPassword: "datasci123",
      waitingRoom: true,
      autoRecord: false,
      chatEnabled: true,
      screenSharingEnabled: true,
      pollsEnabled: true,
      category: "Data Science",
      level: "intermediate",
      isPublic: true,
      status: "scheduled"
    }
  ];

  console.log('📋 Sample sessions to create:');
  sampleSessions.forEach((session, index) => {
    console.log(`${index + 1}. ${session.title} - ${session.category} (${session.level})`);
    console.log(`   📅 ${session.startTime.toLocaleString()}`);
    console.log(`   💰 ${session.price === 0 ? 'Free' : `$${session.price}`}`);
    console.log(`   🎥 ${session.meetingPlatform.toUpperCase()}`);
    console.log('');
  });

  console.log('🎯 To create these sessions:');
  console.log('1. Start the backend server: node server.js');
  console.log('2. Register as a tutor');
  console.log('3. Use the POST /api/live-sessions endpoint with the session data');
  console.log('4. Test the GET /api/live-sessions/public endpoint to see the sessions');
}

createSampleLiveSessions();
