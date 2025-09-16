# Learning Streak Tracking System

## 🎯 Overview
The Learning Streak Tracking System monitors daily learner activities to maintain and calculate learning streaks. It encourages consistent learning habits by tracking consecutive days of activity and providing gamification elements.

## 🔧 How It Works

### 1. Activity Tracking
The system tracks various learning activities:
- **Course Progress** (10 points) - Making progress in courses
- **Assignment Submission** (15 points) - Completing assignments
- **Live Class Attendance** (20 points) - Attending live classes
- **Replay Watching** (5 points) - Watching course replays
- **Quiz Completion** (8 points) - Completing quizzes
- **Forum Posts** (3 points) - Participating in discussions

### 2. Streak Calculation
- **Current Streak**: Consecutive days with at least one activity
- **Longest Streak**: Best streak ever achieved
- **Total Days Active**: Total days with activity (not necessarily consecutive)
- **Last Activity Date**: When the learner was last active

### 3. Streak Rules
- ✅ **Activity Required**: At least one tracked activity per day
- ✅ **Consecutive Days**: Streak continues only with consecutive days
- ❌ **No Activity**: Missing a day breaks the streak
- 🔄 **Reset**: Streak resets to 0 when broken

## 📊 Database Schema

### ActivityLog Collection
```javascript
{
  learnerId: ObjectId,        // Reference to User
  activityType: String,      // Type of activity
  activityData: Object,       // Additional activity data
  points: Number,            // Points earned
  date: Date,               // When activity occurred
  createdAt: Date           // Record creation time
}
```

### LearnerStreak Collection
```javascript
{
  learnerId: ObjectId,        // Reference to User (unique)
  currentStreak: Number,      // Current consecutive days
  longestStreak: Number,      // Best streak ever
  lastActivityDate: Date,     // Last activity timestamp
  streakStartDate: Date,      // When current streak started
  totalDaysActive: Number,    // Total active days
  streakHistory: Array,       // History of streaks
  updatedAt: Date            // Last update time
}
```

## 🚀 API Endpoints

### Track Activity
```http
POST /api/streaks/track-activity
Content-Type: application/json
Authorization: Bearer <token>

{
  "activityType": "course_progress",
  "activityData": {
    "courseId": "course123",
    "progressPercentage": 75
  }
}
```

### Get Learner Streak
```http
GET /api/streaks/:learnerId
Authorization: Bearer <token>
```

### Get My Streak
```http
GET /api/streaks/my-streak
Authorization: Bearer <token>
```

### Get Leaderboard
```http
GET /api/streaks/leaderboard?limit=10
Authorization: Bearer <token>
```

### Get Activity Points
```http
GET /api/streaks/activity-points
Authorization: Bearer <token>
```

## 🎮 Frontend Integration

### Using the Streak Hook
```javascript
import { useStreakTracking } from '../hooks/useStreakTracking';

const MyComponent = () => {
  const { 
    streakData, 
    trackCourseProgress, 
    trackAssignmentSubmission 
  } = useStreakTracking();

  const handleCourseProgress = async (courseId, progress) => {
    await trackCourseProgress(courseId, progress);
  };

  return (
    <div>
      <p>Current Streak: {streakData?.currentStreak || 0} days</p>
    </div>
  );
};
```

### Using Streak Components
```javascript
import StreakTracker, { StreakLeaderboard } from '../components/StreakTracker';

const Dashboard = () => {
  return (
    <div>
      <StreakTracker showDetails={true} />
      <StreakLeaderboard limit={5} />
    </div>
  );
};
```

### Manual Activity Tracking
```javascript
import streakService from '../services/streakService';

// Track course progress
await streakService.trackActivity('course_progress', {
  courseId: 'course123',
  progressPercentage: 50
});

// Track assignment submission
await streakService.trackActivity('assignment_submit', {
  assignmentId: 'assignment456',
  score: 85
});
```

## 🔄 Automatic Tracking Integration

### Course Progress Tracking
```javascript
// In course progress component
const updateProgress = async (progress) => {
  // Update course progress
  await updateCourseProgress(courseId, progress);
  
  // Track streak activity
  await trackCourseProgress(courseId, progress);
};
```

### Assignment Submission Tracking
```javascript
// In assignment submission component
const submitAssignment = async (submission) => {
  // Submit assignment
  const result = await submitAssignment(submission);
  
  // Track streak activity
  await trackAssignmentSubmission(assignmentId, result.score);
};
```

### Live Class Attendance Tracking
```javascript
// In live class component
const joinLiveClass = async (classId) => {
  // Join live class
  await joinLiveClass(classId);
  
  // Track streak activity
  await trackLiveClassAttendance(classId, 0); // Duration tracked separately
};
```

## 📈 Streak Benefits

### Mentorship Score Impact
Streaks contribute to mentorship eligibility:
- **Streak Bonus**: Up to 40 points (2 points per day, max 40)
- **Consistency Factor**: 20% of total mentorship score
- **Mentorship Threshold**: 75+ points required

### Gamification Elements
- 🏆 **Leaderboards**: Compare streaks with other learners
- 🔥 **Streak Badges**: Earn badges for milestone streaks
- 📊 **Progress Tracking**: Visual streak history
- 🎯 **Motivation Messages**: Encouraging messages based on streak length

## 🛠️ Maintenance

### Daily Streak Maintenance
Run this cron job daily to maintain streaks:
```javascript
// Daily at midnight
POST /api/streaks/maintain
Authorization: Bearer <admin-token>
```

This will:
- Break streaks for inactive learners
- Update streak history
- Maintain data integrity

### Manual Streak Reset
```javascript
// Reset a learner's streak (admin only)
const resetStreak = async (learnerId) => {
  await LearnerStreak.findOneAndUpdate(
    { learnerId },
    { 
      currentStreak: 0,
      streakStartDate: null,
      updatedAt: new Date()
    }
  );
};
```

## 🎯 Best Practices

### 1. Activity Tracking
- ✅ Track activities immediately when they occur
- ✅ Include relevant metadata in activityData
- ✅ Handle errors gracefully
- ❌ Don't track duplicate activities

### 2. Streak Display
- ✅ Show streak prominently in dashboard
- ✅ Use visual indicators (fire icons, colors)
- ✅ Provide streak history and statistics
- ✅ Include motivational messages

### 3. Performance
- ✅ Use efficient database queries
- ✅ Cache streak data when possible
- ✅ Batch activity updates when appropriate
- ❌ Don't query streak data on every page load

## 🔮 Future Enhancements

### Planned Features
- **Streak Challenges**: Monthly/weekly streak goals
- **Streak Rewards**: Unlock content based on streaks
- **Social Features**: Share streaks with friends
- **Streak Analytics**: Detailed streak insights
- **Mobile Notifications**: Streak reminders
- **Streak Recovery**: One-time streak restoration

### Advanced Tracking
- **Activity Quality**: Weight activities by quality
- **Time-based Tracking**: Track learning time per day
- **Subject-specific Streaks**: Streaks per course category
- **Team Streaks**: Group learning streaks

## 🐛 Troubleshooting

### Common Issues
1. **Streak Not Updating**: Check activity tracking implementation
2. **Duplicate Activities**: Ensure proper activity deduplication
3. **Timezone Issues**: Use consistent timezone handling
4. **Performance**: Optimize database queries and indexing

### Debug Commands
```javascript
// Check learner's activity logs
const activities = await ActivityLog.find({ learnerId }).sort({ date: -1 });

// Check streak calculation
const streak = await calculateStreak(learnerId);

// Manual streak update
await updateLearnerStreak(learnerId, 'course_progress', { courseId: 'test' });
```

The Learning Streak Tracking System provides a comprehensive solution for motivating learners through consistent activity tracking and gamification! 🚀
